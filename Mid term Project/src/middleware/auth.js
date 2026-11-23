const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.access_token;
    if (!token) return res.status(401).json({ message: "Authentication required." });
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    const user = await User.findById(payload.sub).select("+sessionVersion");
    if (!user || !user.isVerified || user.sessionVersion !== payload.sv) {
      return res.status(401).json({ message: "Session is invalid or expired. Please sign in again." });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session is invalid or expired. Please sign in again." });
  }
}

module.exports = { requireAuth };
