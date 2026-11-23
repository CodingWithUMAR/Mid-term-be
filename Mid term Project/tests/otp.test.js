const test = require("node:test");
const assert = require("node:assert/strict");

process.env.OTP_SECRET = "test-only-secret-that-is-long-enough-for-tests-123456";
const { generateOtp, digestOtp } = require("../src/utils/otp");

test("OTP generator returns a six-digit numeric string", () => {
  const otp = generateOtp();
  assert.match(otp, /^\d{6}$/);
});

test("OTP digest is deterministic for the same email, purpose and code", () => {
  const a = digestOtp("USER@example.com", "verify_email", "123456");
  const b = digestOtp("user@example.com", "verify_email", "123456");
  assert.equal(a, b);
});

test("OTP digest changes when the code or purpose changes", () => {
  const a = digestOtp("user@example.com", "verify_email", "123456");
  assert.notEqual(a, digestOtp("user@example.com", "verify_email", "123457"));
  assert.notEqual(a, digestOtp("user@example.com", "reset_password", "123456"));
});
