import express from "express";
import {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  deleteCoupon,
  updateCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// POST /api/coupons/validate 
router.post("/validate", protect, validateCoupon);

router.get("/", protect, adminOnly, getAllCoupons);
router.post("/", protect, adminOnly, createCoupon);
router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;
