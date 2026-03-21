import express from "express";
import {
  addReview,
  updateReview,
  deleteReview,
  getProductReviews,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/reviews/:productId          – list all reviews for a product (public)
router.get("/:productId", getProductReviews);

// POST   /api/reviews/:productId       – add a review (auth required)
// PUT    /api/reviews/:productId/:reviewId  – edit own review
// DELETE /api/reviews/:productId/:reviewId  – delete own review (or admin)
router.post("/:productId", protect, addReview);
router.put("/:productId/:reviewId", protect, updateReview);
router.delete("/:productId/:reviewId", protect, deleteReview);

export default router;
