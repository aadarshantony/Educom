import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  markOrderAsPaid,
  getSalesAnalytics,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// POST /api/orders    
// GET  /api/orders/my  
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

// GET   /api/orders/:id          
// PATCH /api/orders/:id/pay   
router.get("/:id", protect, getOrderById);
router.patch("/:id/pay", protect, markOrderAsPaid);

// GET   /api/admin/orders   
// GET   /api/admin/analytics       
// PATCH /api/admin/orders/:id/status  
router.get("/admin/orders", protect, adminOnly, getAllOrders);
router.get("/admin/analytics", protect, adminOnly, getSalesAnalytics);
router.patch("/admin/orders/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
