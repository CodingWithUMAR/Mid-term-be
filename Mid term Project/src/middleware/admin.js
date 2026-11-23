const { requireAuth } = require("./auth");

const requireAdmin = [
  requireAuth,
  (req, res, next) => {
    const allowed = (process.env.ADMIN_EMAILS || "")
      .split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
    if (!allowed.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ message: "Administrator access required." });
    }
    next();
  }
];

module.exports = { requireAdmin };
