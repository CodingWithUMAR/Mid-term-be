const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { issueOtp, consumeOtp } = require("../utils/otp");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: 15 * 60 * 1000
});

function setSessionCookie(res, user) {
  const token = jwt.sign(
    { sub: user._id.toString(), sv: user.sessionVersion },
    process.env.JWT_SECRET,
    { algorithm: "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "15m", issuer: "mohammed-umar-auth" }
  );
  res.cookie("access_token", token, cookieOptions());
}

async function signup(req, res, next) {
  try {
    const name = req.body.name.trim();
    const email = req.body.email.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      if (existing.isVerified) return res.status(409).json({ message: "An account with this email already exists." });
      return res.status(409).json({ message: "An account is awaiting email verification. Use Resend OTP to continue." });
    }

    const user = await User.create({ name, email, password: req.body.password });
    try {
      const otp = await issueOtp({ email, purpose: "verify_email" });
      return res.status(201).json({
        message: "Account created. Check your email for the verification code.",
        email, expiresAt: otp.expiresAt, resendAfterSeconds: otp.resendAfterSeconds
      });
    } catch (err) {
      // Keep the unverified account so the user can recover via Resend OTP.
      return res.status(err.status || 503).json({
        message: "Your account was created, but the verification email could not be sent. Use Resend OTP.",
        email
      });
    }
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select("+password +sessionVersion");
    const valid = user && await user.comparePassword(req.body.password);
    if (!valid) return res.status(401).json({ message: "Invalid email or password." });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email before signing in." });
    setSessionCookie(res, user);
    res.json({ message: "Signed in successfully.", user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
}

async function logout(req, res) {
  res.clearCookie("access_token", { ...cookieOptions(), maxAge: undefined });
  res.json({ message: "Signed out successfully." });
}

async function resendOtp(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const purpose = req.body.purpose;
    if (purpose === "verify_email") {
      const user = await User.findOne({ email });
      if (!user || user.isVerified) return res.json({ message: "If the account can receive a code, an email will be sent." });
    } else {
      // Keep forgot-password/resend responses non-enumerating.
      const user = await User.findOne({ email });
      if (!user) return res.json({ message: "If the account can receive a code, an email will be sent." });
    }
    const result = await issueOtp({ email, purpose });
    res.json({ message: "A new code has been sent.", expiresAt: result.expiresAt, resendAfterSeconds: result.resendAfterSeconds });
  } catch (err) {
    if (req.body.purpose === "reset_password" && err.status !== 503) {
      return res.json({ message: "If the account can receive a code, an email will be sent." });
    }
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const valid = await consumeOtp({ email, purpose: "verify_email", otp: req.body.otp });
    if (!valid) return res.status(400).json({ message: "The code is invalid, expired, or has reached its attempt limit." });
    const user = await User.findOneAndUpdate({ email, isVerified: false }, { $set: { isVerified: true } }, { new: true });
    if (!user) return res.status(400).json({ message: "This account is already verified or does not exist." });
    res.json({ message: "Email verified. You can now sign in." });
  } catch (err) { next(err); }
}

async function forgotPassword(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await User.findOne({ email, isVerified: true });
    if (user) {
      try { await issueOtp({ email, purpose: "reset_password" }); }
      catch (err) {
        // Do not reveal whether the email exists or whether cooldown is active.
        if (err.status === 503) return res.status(503).json({ message: "We could not process the request. Please try again later." });
      }
    }
    res.json({ message: "If an eligible account exists, a password reset code will be sent." });
  } catch (err) { next(err); }
}

async function resetPassword(req, res, next) {
  try {
    const email = req.body.email.toLowerCase().trim();
    const valid = await consumeOtp({ email, purpose: "reset_password", otp: req.body.otp });
    if (!valid) return res.status(400).json({ message: "The code is invalid, expired, or has reached its attempt limit." });

    const user = await User.findOne({ email, isVerified: true }).select("+sessionVersion");
    if (!user) return res.status(400).json({ message: "Unable to reset password for this account." });
    user.password = req.body.newPassword;
    user.sessionVersion += 1; // Revokes all previously issued access tokens.
    await user.save();
    await Otp.deleteMany({ email });
    res.clearCookie("access_token", { ...cookieOptions(), maxAge: undefined });
    res.json({ message: "Password reset successfully. Sign in with your new password." });
  } catch (err) { next(err); }
}

async function me(req, res) {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email, isVerified: req.user.isVerified } });
}

module.exports = { signup, login, logout, resendOtp, verifyEmail, forgotPassword, resetPassword, me };
