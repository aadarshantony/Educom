import express from "express";
import {
  createCheckoutSession,
  stripeWebhook,
  verifyPayment,
} from "../services/stripeService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/payments/create-checkout-session  – create Stripe session (auth required)
router.post("/create-checkout-session", protect, createCheckoutSession);

// GET /api/payments/verify/:orderId  – poll payment status from frontend
router.get("/verify/:orderId", protect, verifyPayment);

// POST /api/payments/webhook
// NOTE: This route needs the raw body — handled in app.js with express.raw()
// Do NOT add protect middleware here; Stripe calls this directly
router.post("/webhook", stripeWebhook);

export default router;
