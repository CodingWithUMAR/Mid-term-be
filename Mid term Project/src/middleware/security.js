function sameOrigin(req, res, next) {
  const origin = req.get("origin");
  if (!origin) return next(); // Non-browser clients may omit Origin.
  const allowed = process.env.APP_ORIGIN;
  if (!allowed || origin !== allowed) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  next();
}

function notFound(req, res) {
  res.status(404).json({ message: "Route not found." });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const status = Number(err.status) || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    message: status >= 500 ? "An unexpected server error occurred." : err.message
  });
}
module.exports = { sameOrigin, notFound, errorHandler };
