const mongoose = require("mongoose");
const crypto = require("crypto");
const Product = require("../models/Product");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Address = require("../models/Address");

const publicProduct = (p) => ({
  id: p._id, name: p.name, slug: p.slug, description: p.description,
  category: p.category, price: p.price, compareAtPrice: p.compareAtPrice,
  images: p.images, featured: p.featured,
  variants: p.variants.map(v => ({ size: v.size, color: v.color, sku: v.sku, stock: v.stock }))
});

async function listProducts(req, res, next) {
  try {
    const filter = { active: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === "true") filter.featured = true;
    if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 80) };
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 60);
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 }).limit(limit).lean();
    res.json({ products: products.map(publicProduct) });
  } catch (err) { next(err); }
}

async function getProduct(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product: publicProduct(product) });
  } catch (err) { next(err); }
}

function cleanCartInput(items) {
  if (!Array.isArray(items) || items.length > 30) throw Object.assign(new Error("Cart must contain no more than 30 distinct items."), { status: 400 });
  return items.map(item => {
    if (!mongoose.isValidObjectId(item.productId) || typeof item.size !== "string" || !/^[A-Z0-9-]{1,20}$/i.test(item.size) ||
        typeof item.color !== "string" || item.color.length > 40 ||
        !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 10) {
      throw Object.assign(new Error("One or more cart items are invalid."), { status: 400 });
    }
    return { productId: item.productId, size: item.size.toUpperCase(), color: item.color.trim(), quantity: Number(item.quantity) };
  });
}

async function cartPayload(userId) {
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart) return { items: [], subtotal: 0, currency: "PKR" };
  const items = cart.items.filter(i => i.productId && i.productId.active).map(i => {
    const p = i.productId;
    const v = p.variants.find(v => v.size === i.size && v.color === i.color);
    if (!v) return null;
    return {
      productId: p._id, slug: p.slug, name: p.name, image: p.images[0],
      price: p.price, size: i.size, color: i.color, quantity: i.quantity,
      stock: v.stock, lineTotal: p.price * i.quantity
    };
  }).filter(Boolean);
  return { items, subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0), currency: "PKR" };
}

async function getCart(req, res, next) {
  try { res.json(await cartPayload(req.user._id)); } catch (err) { next(err); }
}

async function addCartItems(req, res, next) {
  try {
    const incoming = cleanCartInput([req.body]);
    const item = incoming[0];
    const product = await Product.findOne({ _id: item.productId, active: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    const variant = product.variants.find(v => v.size === item.size && v.color === item.color);
    if (!variant) return res.status(400).json({ message: "This size and colour combination is unavailable." });
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id }, { $setOnInsert: { userId: req.user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const existing = cart.items.find(i => i.productId.equals(item.productId) && i.size === item.size && i.color === item.color);
    if ((existing?.quantity || 0) + item.quantity > Math.min(10, variant.stock)) {
      return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    }
    if (existing) existing.quantity += item.quantity;
    else cart.items.push(item);
    await cart.save();
    res.json({ message: "Added to cart.", ...(await cartPayload(req.user._id)) });
  } catch (err) { next(err); }
}

async function updateCartItem(req, res, next) {
  try {
    const item = cleanCartInput([{ ...req.body, productId: req.params.productId }])[0];
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    const line = cart.items.find(i => i.productId.equals(item.productId) && i.size === item.size && i.color === item.color);
    if (!line) return res.status(404).json({ message: "Cart item not found." });
    const product = await Product.findOne({ _id: item.productId, active: true });
    const variant = product?.variants.find(v => v.size === item.size && v.color === item.color);
    if (!variant || item.quantity > Math.min(10, variant.stock)) return res.status(400).json({ message: "Requested quantity exceeds available stock." });
    line.quantity = item.quantity;
    await cart.save();
    res.json({ message: "Cart updated.", ...(await cartPayload(req.user._id)) });
  } catch (err) { next(err); }
}

async function removeCartItem(req, res, next) {
  try {
    const { size, color } = req.body || {};
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });
    cart.items = cart.items.filter(i => !(i.productId.equals(req.params.productId) && i.size === String(size).toUpperCase() && i.color === color));
    await cart.save();
    res.json({ message: "Cart item removed.", ...(await cartPayload(req.user._id)) });
  } catch (err) { next(err); }
}

async function mergeCart(req, res, next) {
  try {
    const incoming = cleanCartInput(req.body.items || []);
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id }, { $setOnInsert: { userId: req.user._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    for (const item of incoming) {
      const product = await Product.findOne({ _id: item.productId, active: true });
      const variant = product?.variants.find(v => v.size === item.size && v.color === item.color);
      if (!variant || variant.stock < 1) continue;
      const existing = cart.items.find(i => i.productId.equals(item.productId) && i.size === item.size && i.color === item.color);
      const nextQty = Math.min(10, variant.stock, (existing?.quantity || 0) + item.quantity);
      if (existing) existing.quantity = nextQty;
      else cart.items.push({ ...item, quantity: nextQty });
    }
    await cart.save();
    res.json({ message: "Guest cart merged.", ...(await cartPayload(req.user._id)) });
  } catch (err) { next(err); }
}

async function checkout(req, res, next) {
  const session = await mongoose.startSession();
  try {
    let createdOrder;
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ userId: req.user._id }).session(session);
      if (!cart || cart.items.length === 0) throw Object.assign(new Error("Your cart is empty."), { status: 400 });

      const items = [];
      let subtotal = 0;
      for (const line of cart.items) {
        const product = await Product.findOne({ _id: line.productId, active: true }).session(session);
        if (!product) throw Object.assign(new Error("A product in your cart is no longer available."), { status: 409 });
        const variant = product.variants.find(v => v.size === line.size && v.color === line.color);
        if (!variant || variant.stock < line.quantity) throw Object.assign(new Error(`Insufficient stock for ${product.name} (${line.size}, ${line.color}).`), { status: 409 });

        const updated = await Product.updateOne(
          { _id: product._id, active: true, variants: { $elemMatch: { size: line.size, color: line.color, stock: { $gte: line.quantity } } } },
          { $inc: { "variants.$.stock": -line.quantity } }, { session }
        );
        if (updated.modifiedCount !== 1) throw Object.assign(new Error("Stock changed during checkout. Please review your cart."), { status: 409 });

        const lineTotal = product.price * line.quantity;
        subtotal += lineTotal;
        items.push({
          productId: product._id, name: product.name, image: product.images[0],
          sku: variant.sku, size: line.size, color: line.color,
          unitPrice: product.price, quantity: line.quantity, lineTotal
        });
      }

      const shippingFee = subtotal >= 8000 ? 0 : 250;
      const order = new Order({
        orderNumber: `TRB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`,
        userId: req.user._id, items, shippingAddress: req.body.shippingAddress,
        subtotal, shippingFee, total: subtotal + shippingFee,
        paymentMethod: req.body.paymentMethod, customerNote: req.body.customerNote || ""
      });
      await order.save({ session });
      cart.items = [];
      await cart.save({ session });
      createdOrder = order;
    });
    const response = createdOrder.toObject();
    if (response.paymentMethod === "bank_transfer") response.bankTransferInstructions = process.env.BANK_ACCOUNT_DETAILS || "Contact TURBO support for bank transfer details.";
    res.status(201).json({ message: "Order placed successfully.", order: response });
  } catch (err) { next(err); }
  finally { await session.endSession(); }
}

async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ orders });
  } catch (err) { next(err); }
}

async function getOrder(req, res, next) {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).lean();
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (err) { next(err); }
}


async function listAddresses(req, res, next) {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ addresses });
  } catch (err) { next(err); }
}

async function createAddress(req, res, next) {
  try {
    const count = await Address.countDocuments({ userId: req.user._id });
    if (count >= 5) return res.status(400).json({ message: "You can save up to five delivery addresses." });
    const isDefault = Boolean(req.body.isDefault) || count === 0;
    if (isDefault) await Address.updateMany({ userId: req.user._id }, { $set: { isDefault: false } });
    const address = await Address.create({ ...req.body, userId: req.user._id, isDefault });
    res.status(201).json({ message: "Address saved.", address });
  } catch (err) { next(err); }
}

async function deleteAddress(req, res, next) {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) return res.status(404).json({ message: "Address not found." });
    if (address.isDefault) {
      const nextAddress = await Address.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
      if (nextAddress) { nextAddress.isDefault = true; await nextAddress.save(); }
    }
    res.json({ message: "Address removed." });
  } catch (err) { next(err); }
}

async function cancelMyOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    let cancelledOrder;
    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: req.params.id, userId: req.user._id }).session(session);
      if (!order) throw Object.assign(new Error("Order not found."), { status: 404 });
      if (!["pending", "confirmed"].includes(order.status)) {
        throw Object.assign(new Error("This order can no longer be cancelled online. Please contact TURBO support."), { status: 409 });
      }
      if (order.paymentStatus === "paid") {
        throw Object.assign(new Error("This order has a recorded payment. Contact TURBO support to arrange cancellation and refund."), { status: 409 });
      }
      for (const line of order.items) {
        const restored = await Product.updateOne(
          { _id: line.productId, variants: { $elemMatch: { size: line.size, color: line.color, sku: line.sku } } },
          { $inc: { "variants.$.stock": line.quantity } }, { session }
        );
        if (restored.modifiedCount !== 1) throw Object.assign(new Error(`Could not safely release stock for ${line.name}. Restore its original size/colour/SKU variant before cancelling.`), { status: 409 });
      }
      order.status = "cancelled";
      await order.save({ session });
      cancelledOrder = order;
    });
    res.json({ message: "Order cancelled. Reserved stock has been released.", order: cancelledOrder });
  } catch (err) { next(err); }
  finally { await session.endSession(); }
}

async function adminListOrders(req, res, next) {
  try {
    const orders = await Order.find().populate("userId", "name email").sort({ createdAt: -1 }).limit(200).lean();
    res.json({ orders });
  } catch (err) { next(err); }
}

async function adminUpdateOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const allowedStatus = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    const allowedPayment = ["pending", "paid", "failed", "refunded"];
    if (req.body.status && !allowedStatus.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    if (req.body.paymentStatus && !allowedPayment.includes(req.body.paymentStatus)) return res.status(400).json({ message: "Invalid payment status." });
    if (!req.body.status && !req.body.paymentStatus) return res.status(400).json({ message: "Provide a status or paymentStatus to update." });
    let updatedOrder;
    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);
      if (!order) throw Object.assign(new Error("Order not found."), { status: 404 });
      if (req.body.status) {
        const transitions = {
          pending: ["confirmed", "cancelled"],
          confirmed: ["processing", "cancelled"],
          processing: ["shipped", "cancelled"],
          shipped: ["delivered"], delivered: [], cancelled: []
        };
        if (!transitions[order.status].includes(req.body.status) && order.status !== req.body.status) {
          throw Object.assign(new Error(`Order cannot move from ${order.status} to ${req.body.status}.`), { status: 409 });
        }
        if (req.body.status === "cancelled" && order.status !== "cancelled") {
          for (const line of order.items) {
            const restored = await Product.updateOne(
              { _id: line.productId, variants: { $elemMatch: { size: line.size, color: line.color, sku: line.sku } } },
              { $inc: { "variants.$.stock": line.quantity } }, { session }
            );
            if (restored.modifiedCount !== 1) throw Object.assign(new Error(`Could not safely release stock for ${line.name}. Restore its original variant before cancelling.`), { status: 409 });
          }
        }
        order.status = req.body.status;
      }
      if (req.body.paymentStatus) order.paymentStatus = req.body.paymentStatus;
      await order.save({ session });
      updatedOrder = order;
    });
    res.json({ message: "Order updated.", order: updatedOrder });
  } catch (err) { next(err); }
  finally { await session.endSession(); }
}

async function adminCreateProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ message: "Product created.", product: publicProduct(product) });
  } catch (err) { next(err); }
}

async function adminUpdateProduct(req, res, next) {
  try {
    const current = await Product.findById(req.params.id);
    if (!current) return res.status(404).json({ message: "Product not found." });
    if (req.body.variants) {
      const openOrder = await Order.exists({
        status: { $in: ["pending", "confirmed", "processing"] },
        items: { $elemMatch: { productId: current._id } }
      });
      if (openOrder) return res.status(409).json({ message: "This product has open orders. Do not replace its size/colour/SKU variants until those orders are completed or cancelled." });
    }
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    res.json({ message: "Product updated.", product: publicProduct(product) });
  } catch (err) { next(err); }
}

async function adminDeleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { $set: { active: false } }, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product archived." });
  } catch (err) { next(err); }
}

module.exports = {
  listProducts, getProduct, getCart, addCartItems, updateCartItem, removeCartItem,
  mergeCart, checkout, myOrders, getOrder, adminListOrders, adminUpdateOrder,
  adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  listAddresses, createAddress, deleteAddress, cancelMyOrder
};
