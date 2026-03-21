import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// GET  /api/products       – list all products (public)
// POST /api/products       – create a product (admin only)
router
  .route("/")
  .get(getAllProducts)
  .post(protect, adminOnly, createProduct);

// GET   /api/products/:id  – get single product (public)
// PATCH /api/products/:id  – update product    (admin only)
// DELETE /api/products/:id – delete product    (admin only)
router
  .route("/:id")
  .get(getProductById)
  .patch(protect, adminOnly, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

// POST /api/products/:id/reviews  – add a review (auth required)
router.route("/:id/reviews").post(protect, createProductReview);

export default router;
