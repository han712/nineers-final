import fs from 'fs/promises';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/userModel.js';
import logger from '../utils/logger.js'; // Assuming you have a logging utility

/**
 * Upload and update user profile image
 * @route POST /api/users/upload-profile-image
 * @access Private
 */
const uploadProfileImage = async (req, res) => {
  let tempFilePath = null;

  try {
    // Comprehensive input validation
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file uploaded',
        error: 'FILE_NOT_FOUND'
      });
    }

    tempFilePath = req.file.path;

    // Find the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    // Enhanced file validation
    const validationErrors = validateFile(req.file);
    if (validationErrors) {
      await safelyRemoveFile(tempFilePath);
      return res.status(400).json(validationErrors);
    }

    // Cloudinary upload configuration
    const uploadOptions = {
      folder: `profile_images/${user._id}`,
      public_id: `profile_${user._id}_${Date.now()}`,
      overwrite: true, // Replace existing image
      transformation: [
        { 
          width: 500, 
          height: 500, 
          crop: 'cover', // More precise cropping
          gravity: 'face' // Focus on face if possible
        },
        { quality: 'auto:good' }, // Balanced quality optimization
        { format: 'webp' } // Convert to modern WebP format
      ]
    };

    // Upload to Cloudinary with enhanced error handling
    const uploadResult = await cloudinary.uploader.upload(tempFilePath, uploadOptions);

    // Remove temporary local file
    await safelyRemoveFile(tempFilePath);

    // Update user's profile image with additional metadata
    user.profileImage = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      uploadedAt: new Date()
    };

    await user.save();

    // Log successful upload
    logger.info(`Profile image uploaded for user ${user._id}`, {
      userId: user._id,
      imageUrl: uploadResult.secure_url
    });

    // Respond with success and new image details
    res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl: uploadResult.secure_url,
      uploadedAt: new Date().toISOString()
    });

  } catch (error) {
    // Safely remove temporary file if it exists
    if (tempFilePath) {
      await safelyRemoveFile(tempFilePath);
    }

    // Detailed error logging
    logger.error('Profile Image Upload Error', {
      userId: req.user?._id,
      error: error.message,
      stack: error.stack
    });

    // Differentiated error response
    const errorResponse = {
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred'
    };

    // Handle specific Cloudinary errors
    if (error.http_code) {
      return res.status(error.http_code).json(errorResponse);
    }

    // Generic server error
    res.status(500).json(errorResponse);
  }
};

/**
 * Validate file before upload
 * @param {Object} file - Uploaded file object
 * @returns {Object|null} Validation errors or null if valid
 */
function validateFile(file) {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    'image/jpeg', 
    'image/png', 
    'image/gif', 
    'image/webp'
  ];

  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    return { 
      message: 'File size too large. Maximum 5MB allowed',
      error: 'FILE_TOO_LARGE'
    };
  }

  // File type validation
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    return { 
      message: 'Invalid file type. Only images are allowed',
      error: 'INVALID_FILE_TYPE'
    };
  }

  return null;
}

/**
 * Safely remove temporary file with error handling
 * @param {string} filePath - Path to the temporary file
 */
async function safelyRemoveFile(filePath) {
  try {
    if (filePath) {
      await fs.unlink(filePath);
    }
  } catch (unlinkError) {
    logger.warn('Failed to remove temporary file', {
      filePath,
      error: unlinkError.message
    });
  }
}

export default uploadProfileImage;