const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  sku: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  unitPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  lineTotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, maxlength: 100 },
  phone: { type: String, required: true, trim: true, maxlength: 25 },
  addressLine: { type: String, required: true, trim: true, maxlength: 250 },
  city: { type: String, required: true, trim: true, maxlength: 80 },
  province: { type: String, required: true, trim: true, maxlength: 80 },
  postalCode: { type: String, trim: true, maxlength: 20, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  items: { type: [orderItemSchema], required: true },
  shippingAddress: { type: addressSchema, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "PKR", immutable: true },
  paymentMethod: { type: String, enum: ["cod", "bank_transfer"], required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  customerNote: { type: String, maxlength: 500, default: "" }
}, { timestamps: true });

orderSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model("Order", orderSchema);
