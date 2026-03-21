import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(protect);

// GET  /api/cart          – view current cart
// DELETE /api/cart/clear  – empty the cart
router.get("/", getCart);
router.delete("/clear", clearCart);

// POST  /api/cart/add              – add item
// PATCH /api/cart/update           – update quantity
router.post("/add", addToCart);
router.patch("/update", updateCartItem);

// DELETE /api/cart/remove/:productId  – remove single item
router.delete("/remove/:productId", removeFromCart);

export default router;
