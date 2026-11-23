const crypto = require("crypto");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../config/mailer");

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function digestOtp(email, purpose, otp) {
  return crypto.createHmac("sha256", process.env.OTP_SECRET)
    .update(`${email.toLowerCase()}:${purpose}:${otp}`)
    .digest("hex");
}

async function issueOtp({ email, purpose }) {
  const now = new Date();
  const cooldownMs = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60) * 1000;
  const ttlMs = Number(process.env.OTP_TTL_MINUTES || 10) * 60 * 1000;
  const existing = await Otp.findOne({ email, purpose });

  if (existing && now - existing.sentAt < cooldownMs) {
    const retryAfter = Math.ceil((cooldownMs - (now - existing.sentAt)) / 1000);
    const error = new Error(`Please wait ${retryAfter} seconds before requesting another code.`);
    error.status = 429;
    error.retryAfter = retryAfter;
    throw error;
  }

  const otp = generateOtp();
  const otpHash = digestOtp(email, purpose, otp);
  const expiresAt = new Date(now.getTime() + ttlMs);

  try {
    await Otp.findOneAndUpdate(
      { email, purpose },
      { $set: { otpHash, attempts: 0, sentAt: now, expiresAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error("A code was just requested. Please wait before trying again.");
      error.status = 429;
      throw error;
    }
    throw err;
  }

  try {
    await sendOtpEmail({ to: email, otp, purpose, expiresAt });
  } catch (err) {
    await Otp.deleteOne({ email, purpose, otpHash });
    const error = new Error("We could not send the email. Please try again shortly.");
    error.status = 503;
    throw error;
  }

  return { expiresAt, resendAfterSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60) };
}

/*
 * Successful verification is a single atomic findOneAndDelete. A valid OTP
 * can therefore be consumed only once, including under concurrent requests.
 * Failed attempts are atomically incremented and the record is removed at
 * the configured limit.
 */
async function consumeOtp({ email, purpose, otp }) {
  const now = new Date();
  const otpHash = digestOtp(email, purpose, otp);
  const consumed = await Otp.findOneAndDelete({
    email, purpose, otpHash, expiresAt: { $gt: now },
    $expr: { $lt: ["$attempts", Number(process.env.OTP_MAX_ATTEMPTS || 5)] }
  });

  if (consumed) return true;

  const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
  const updated = await Otp.findOneAndUpdate(
    { email, purpose, expiresAt: { $gt: now }, attempts: { $lt: maxAttempts } },
    { $inc: { attempts: 1 } },
    { new: true }
  );
  if (updated && updated.attempts >= maxAttempts) {
    await Otp.deleteOne({ _id: updated._id, attempts: { $gte: maxAttempts } });
  }
  return false;
}

module.exports = { generateOtp, digestOtp, issueOtp, consumeOtp };
