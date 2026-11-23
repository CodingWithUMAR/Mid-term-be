const router = require("express").Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const controller = require("../controllers/authController");

const email = body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail();
const password = body("password").isString().isLength({ min: 8, max: 72 }).withMessage("Password must be 8–72 characters.");
const otp = body("otp").isString().matches(/^\d{6}$/).withMessage("Enter the six-digit code.");

router.post("/signup", [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters."),
  email, password, validate
], controller.signup);

router.post("/login", [email, body("password").isString().notEmpty(), validate], controller.login);
router.post("/logout", controller.logout);

router.post("/resend-otp", [
  email,
  body("purpose").isIn(["verify_email", "reset_password"]).withMessage("Invalid code purpose."),
  validate
], controller.resendOtp);

router.post("/verify-email", [email, otp, validate], controller.verifyEmail);
router.post("/forgot-password", [email, validate], controller.forgotPassword);
router.post("/reset-password", [
  email, otp,
  body("newPassword").isString().isLength({ min: 8, max: 72 }).withMessage("New password must be 8–72 characters."),
  validate
], controller.resetPassword);

router.get("/me", requireAuth, controller.me);
module.exports = router;
