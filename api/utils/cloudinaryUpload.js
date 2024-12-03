// utils/cloudinaryUpload.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
  try {
    // Upload image
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder || 'user_uploads',
      transformation: [
        { width: 500, height: 500, crop: 'limit' }, // Limit image size
        { quality: 'auto' } // Auto-optimize quality
      ]
    });

    // Remove local file after upload
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    // Remove local file in case of error
    fs.unlinkSync(filePath);
    throw new Error('Image upload failed');
  }
};

export default uploadToCloudinary;