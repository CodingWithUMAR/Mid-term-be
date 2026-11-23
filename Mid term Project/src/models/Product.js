const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true, trim: true, uppercase: true },
  color: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true, uppercase: true },
  stock: { type: Number, required: true, min: 0, default: 0 }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, required: true, maxlength: 2500 },
  category: { type: String, required: true, enum: ["T-Shirts", "Hoodies", "Shirts", "Pants", "Jackets", "Accessories"] },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  images: [{ type: String, required: true, match: /^https:\/\// }],
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  variants: { type: [variantSchema], validate: v => v.length > 0 }
}, { timestamps: true });

productSchema.index({ active: 1, category: 1, featured: 1 });
productSchema.index({ name: "text", description: "text" });
module.exports = mongoose.model("Product", productSchema);
