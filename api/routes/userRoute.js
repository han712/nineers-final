import express from 'express';
import multer from 'multer';
import {
  getCurrentUser,
  updateUserProfile,
  // ... other user controller imports
} from '../controllers/userController.js';
import uploadProfileImage  from '../controllers/uploadProfileImage.js';
import { protect } from '../middleware/authMiddleware.js';

const upload = multer({ 
  dest: 'uploads/', 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
}); // Configure multer for file uploads
const router = express.Router();

// Get current user profile
router.get('/profile', protect, getCurrentUser);

// Get user profile by ID
router.get('/profile/:id', getCurrentUser);

// Update user profile
router.put('/profile', protect, updateUserProfile);

// Update user profile by ID (for admin use)
router.put('/profile/:id', protect, updateUserProfile);

// Profile image upload route
router.post(
  '/upload-profile-image', 
  protect, 
  upload.single('profileImage'), 
  uploadProfileImage
);
export default router;