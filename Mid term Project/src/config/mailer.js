const nodemailer = require("nodemailer");

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  }
  return transporter;
}

async function sendOtpEmail({ to, otp, purpose, expiresAt }) {
  const subject = purpose === "verify_email" ? "Verify your email address" : "Password reset code";
  const action = purpose === "verify_email" ? "verify your email address" : "reset your password";
  const minutes = Number(process.env.OTP_TTL_MINUTES || 10);
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: `Your verification code is ${otp}. Use it to ${action}. It expires in ${minutes} minutes. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>${subject}</h2><p>Use this one-time code to ${action}:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 0">${otp}</div><p>This code expires in ${minutes} minutes.</p><p>If you did not request this, you can ignore this email.</p></div>`
  });
}
module.exports = { sendOtpEmail };
