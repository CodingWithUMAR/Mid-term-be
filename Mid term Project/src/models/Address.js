const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  label: { type: String, required: true, trim: true, maxlength: 40, default: "Home" },
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  addressLine: { type: String, required: true, trim: true, maxlength: 250 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  province: { type: String, required: true, trim: true, maxlength: 80 },
  postalCode: { type: String, trim: true, maxlength: 20, default: "" },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

addressSchema.index({ userId:  1, createdAt: -1 });
module.exports = mongoose.model("Address", addressSchema);
