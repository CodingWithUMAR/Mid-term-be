const router = require("express").Router();
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const c = require("../controllers/storeController");

router.get("/products", c.listProducts);
router.get("/products/:slug", c.getProduct);

router.get("/cart", requireAuth, c.getCart);
router.post("/cart/items", requireAuth, [
  body("productId").isMongoId(), body("size").isString().notEmpty(),
  body("color").isString().notEmpty(), body("quantity").isInt({ min: 1, max: 10 }), validate
], c.addCartItems);
router.patch("/cart/items/:productId", requireAuth, [
  param("productId").isMongoId(), body("size").isString().notEmpty(),
  body("color").isString().notEmpty(), body("quantity").isInt({ min: 1, max: 10 }), validate
], c.updateCartItem);
router.delete("/cart/items/:productId", requireAuth, [param("productId").isMongoId(), validate], c.removeCartItem);
router.post("/cart/merge", requireAuth, [body("items").isArray({ max: 30 }), validate], c.mergeCart);

router.post("/checkout", requireAuth, [
  body("paymentMethod").isIn(["cod", "bank_transfer"]),
  body("shippingAddress.fullName").trim().isLength({ min: 2, max: 100 }),
  body("shippingAddress.phone").trim().isLength({ min: 7, max: 25 }),
  body("shippingAddress.addressLine").trim().isLength({ min: 5, max: 250 }),
  body("shippingAddress.city").trim().isLength({ min: 2, max: 80 }),
  body("shippingAddress.province").trim().isLength({ min: 2, max: 80 }),
  body("shippingAddress.postalCode").optional().isLength({ max: 20 }),
  body("customerNote").optional().isString().isLength({ max: 500 }), validate
], c.checkout);

router.get("/addresses", requireAuth, c.listAddresses);
router.post("/addresses", requireAuth, [
  body("label").optional().isString().isLength({ min: 2, max: 40 }),
  body("fullName").trim().isLength({ min: 2, max: 100 }),
  body("phone").trim().isLength({ min: 7, max: 25 }),
  body("addressLine").trim().isLength({ min: 5, max: 250 }),
  body("city").trim().isLength({ min: 2, max: 80 }),
  body("province").trim().isLength({ min: 2, max: 80 }),
  body("postalCode").optional().isLength({ max: 20 }),
  body("isDefault").optional().isBoolean(), validate
], c.createAddress);
router.delete("/addresses/:id", requireAuth, [param("id").isMongoId(), validate], c.deleteAddress);

router.get("/orders", requireAuth, c.myOrders);
router.get("/orders/:id", requireAuth, [param("id").isMongoId(), validate], c.getOrder);
router.post("/orders/:id/cancel", requireAuth, [param("id").isMongoId(), validate], c.cancelMyOrder);

router.get("/admin/orders", requireAdmin, c.adminListOrders);
router.patch("/admin/orders/:id", requireAdmin, [param("id").isMongoId(), validate], c.adminUpdateOrder);
router.post("/admin/products", requireAdmin, [
  body("name").isString().isLength({ min: 2, max: 120 }),
  body("slug").isString().matches(/^[a-z0-9-]+$/),
  body("description").isString().isLength({ min: 5, max: 2500 }),
  body("category").isIn(["T-Shirts", "Hoodies", "Shirts", "Pants", "Jackets", "Accessories"]),
  body("price").isInt({ min: 0 }), body("images").isArray({ min: 1, max: 8 }),
  body("variants").isArray({ min: 1 }), validate
], c.adminCreateProduct);
router.patch("/admin/products/:id", requireAdmin, [param("id").isMongoId(), validate], c.adminUpdateProduct);
router.delete("/admin/products/:id", requireAdmin, [param("id").isMongoId(), validate], c.adminDeleteProduct);

module.exports = router;
