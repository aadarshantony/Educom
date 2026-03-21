import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  registerValidation,
  loginValidation,
  validate,
} from "../validators/authValidator.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerValidation, validate, registerUser);

// POST /api/auth/login
router.post("/login", loginValidation, validate, loginUser);

// GET  /api/users/profile
// PUT  /api/users/profile
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// GET    /api/admin/users
// DELETE /api/admin/users/:id
router.route("/admin/users").get(protect, adminOnly, getAllUsers);
router.route("/admin/users/:id").delete(protect, adminOnly, deleteUser);

export default router;
