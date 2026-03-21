import express from 'express';
import {
  uploadSingleImage,
  uploadMultipleImages,
  uploadProductImages,
  deleteImage,
} from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError,
} from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All upload routes require admin authentication
router.use(protect, adminOnly);

// POST /api/upload/single   — upload one image, returns { url, publicId }
router.post('/single', handleMulterError(uploadSingle), uploadSingleImage);

// POST /api/upload/multiple — upload several images, returns { images: [...] }
router.post('/multiple', handleMulterError(uploadMultiple), uploadMultipleImages);

// POST /api/upload/product  — upload cover + gallery together
router.post('/product', handleMulterError(uploadFields), uploadProductImages);

// DELETE /api/upload        — delete an image from Cloudinary
router.delete('/', deleteImage);

export default router;
