const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false, minlength: 8 },
  isVerified: { type: Boolean, default: false },
  sessionVersion: { type: Number, default: 0, select: false }
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const rounds = Math.min(14, Math.max(10, Number(process.env.BCRYPT_ROUNDS || 12)));
  this.password = await bcrypt.hash(this.password, rounds);
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
