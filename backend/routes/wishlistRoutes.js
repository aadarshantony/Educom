import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(protect);

// GET  /api/wishlist          – get wishlist
// POST /api/wishlist/add      – add product
// POST /api/wishlist/toggle   – add if absent, remove if present
router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.post("/toggle", toggleWishlist);

// DELETE /api/wishlist/remove/:productId
router.delete("/remove/:productId", removeFromWishlist);

export default router;
