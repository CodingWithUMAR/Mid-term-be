const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const storeRoutes = require("./routes/storeRoutes");
const { sameOrigin, notFound, errorHandler } = require("./middleware/security");
const storeErrorHandler = require("./middleware/storeErrors");

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY === "true" ? 1 : false);
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"], connectSrc: ["'self'"], objectSrc: ["'none'"],
      baseUri: ["'self'"], frameAncestors: ["'none'"], formAction: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
app.use(sameOrigin);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, limit: 180,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
}));
app.use("/api/auth", rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." }
}), authRoutes);
app.use("/api/store/checkout", rateLimit({
  windowMs: 60 * 60 * 1000, limit: 8,
  standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many checkout attempts. Please wait before trying again." }
}));
app.use("/api/store", storeRoutes);
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "turbo-api" }));
app.use(notFound);
app.use(storeErrorHandler);
app.use(errorHandler);
module.exports = app;
