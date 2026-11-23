function storeErrorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err && err.code === 11000) {
    return res.status(409).json({ message: "A record with this value already exists. Check the product slug or account details." });
  }
  if (err && (err.name === "ValidationError" || err.name === "CastError")) {
    return res.status(400).json({ message: "The submitted data is invalid." });
  }
  next(err);
}
module.exports = storeErrorHandler;
