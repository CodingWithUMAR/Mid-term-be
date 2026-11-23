const required = ["MONGODB_URI", "JWT_SECRET", "OTP_SECRET"];

function validateEnv() {
  for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
  }
  if (process.env.JWT_SECRET.length < 32 || process.env.OTP_SECRET.length < 32) {
    throw new Error("JWT_SECRET and OTP_SECRET must each contain at least 32 characters.");
  }
  if (process.env.NODE_ENV === "production" && !process.env.APP_ORIGIN) {
    throw new Error("APP_ORIGIN is required in production.");
  }
}
module.exports = { validateEnv };
