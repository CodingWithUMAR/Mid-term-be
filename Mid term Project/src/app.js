const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const { sameOrigin, notFound, errorHandler } = require("./middleware/security");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"], connectSrc: ["'self'"], objectSrc: ["'none'"],
      baseUri: ["'self'"], frameAncestors: ["'none'"], formAction: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(sameOrigin);

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-7",
  legacyHeaders: false, message: { message: "Too many requests. Please try again later." }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: "draft-7",
  legacyHeaders: false, message: { message: "Too many authentication attempts. Please try again later." }
});
app.use(generalLimiter);
app.use("/api/auth", authLimiter);

app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use(express.static(path.join(__dirname, "..", "public"), { extensions: ["html"] }));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
