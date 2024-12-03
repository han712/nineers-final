import bcrypt from 'bcryptjs';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/userModel.js';
import { createError } from '../utils/createError.js';
import { createToken } from '../utils/createToken.js';

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, username, email, password} = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ 
    $or: [{ email: email.toLowerCase() }, { username }] 
  });
  
  if (userExists) {
    throw createError(400, userExists.email === email.toLowerCase() 
      ? 'Email already registered' 
      : 'Username already taken'
    );
  }

  // Create the user
  const user = await User.create({
    fullName,
    username,
    email: email.toLowerCase(),
    password, // The pre-save middleware in the model will handle hashing
    lastLogin: new Date() // Set initial login time
  });

  // Create authentication token
  createToken(res, user._id);
  
  // Respond with user details
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      lastLogin: user.lastLogin
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email and include the password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    // If no user is found, return a 401 error
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // If password is invalid, return a 401 error
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save();

  // Check if the user is a seller and fetch their profile
  const sellerProfile = user.role === 'seller'
    ? await Seller.findOne({ userId: user._id })
    : null;

  // Create a token for the user
  createToken(res, user._id);

  // Send the successful response
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      lastLogin: user.lastLogin
    }
  });
});


const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'development',
    sameSite: 'strict',
    expires: new Date(0)
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.userId;
  const user = await User.findById(userId);
  if (!user) {
    throw createError(404, 'User not found');
  }

  const sellerProfile = user.role === 'seller' 
    ? await Seller.findOne({ userId: user._id }) 
    : null;

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.userId;
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw createError(404, 'User not found');
  }

  // Check if the authenticated user is updating their own profile or has admin rights
  if (req.userId !== user._id.toString() && req.userRole !== 'admin') {
    throw createError(403, 'Not authorized to update this profile');
  }

  if (req.body.password) {
    const isPasswordValid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!isPasswordValid) {
      throw createError(401, 'Current password is incorrect');
    }
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  if (req.body.username) {
    const existingUser = await User.findOne({ 
      username: req.body.username,
      _id: { $ne: user._id }
    });
    if (existingUser) {
      throw createError(400, 'Username is already taken');
    }
    user.username = req.body.username;
  }

  if (req.body.email) {
    const existingUser = await User.findOne({ 
      email: req.body.email.toLowerCase(),
      _id: { $ne: user._id }
    });
    if (existingUser) {
      throw createError(400, 'Email is already in use');
    }
    user.email = req.body.email.toLowerCase();
  }

  if (user.role === 'seller' && req.body.sellerProfile) {
    const seller = await Seller.findOne({ userId: user._id });
    if (!seller) {
      throw createError(404, 'Seller profile not found');
    }

    const { skills, description, hourlyRate, title, isAvailable, languages } = req.body.sellerProfile;

    Object.assign(seller, {
      ...(skills && { skills: skills.map(skill => skill.trim()) }),
      ...(description && { description: description.trim() }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(title && { title: title.trim() }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(languages && { languages: languages.map(lang => lang.trim()) })
    });

    await seller.save();
  }

  const updatedUser = await user.save();
  const sellerProfile = user.role === 'seller' 
    ? await Seller.findOne({ userId: user._id }) 
    : null;

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      sellerProfile,
      updatedAt: updatedUser.updatedAt
    }
  });
});

const becomeSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw createError(404, 'User not found');
  }

  if (user.role === 'seller') {
    throw createError(400, 'User is already a seller');
  }

  const { skills, description, hourlyRate, title, languages } = req.body;

  user.role = 'seller';
  await user.save();

  const sellerProfile = await Seller.create({
    userId: user._id,
    skills: skills.map(skill => skill.trim()),
    description: description.trim(),
    hourlyRate,
    title: title.trim(),
    languages: languages?.map(lang => lang.trim()) || [],
    isAvailable: true
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      sellerProfile
    }
  });
});

const getSellerProfileById = asyncHandler(async (req, res) => {
  const sellerId = req.params.id;

  const sellerProfile = await Seller.findOne({ userId: sellerId })
    .populate('userId', 'username email fullName');

  if (!sellerProfile) {
    throw createError(404, 'Seller profile not found');
  }

  res.status(200).json({
    success: true,
    data: sellerProfile
  });
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId).select('+password');
  if (!user) {
    throw createError(404, 'User not found');
  }

  const { password } = req.body;
  if (password) {
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, 'Invalid password');
    }
  }
  
  if (user.role === 'seller') {
    await Seller.deleteOne({ userId: user._id });
  }

  await user.deleteOne();

  res.cookie('jwt', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.status(200).json({ message: 'User account successfully deleted' });
});

const uploadProfileImage = async (req, res) => {
  try {
    // Validate if file exists
    if (!req.file) {
      return res.status(400).json({ 
        message: 'No image file uploaded' 
      });
    }

    // Find the current user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    // Validate file size (e.g., limit to 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (req.file.size > MAX_FILE_SIZE) {
      await fs.unlink(req.file.path); // Remove temporary file
      return res.status(400).json({ 
        message: 'File size too large. Maximum 5MB allowed' 
      });
    }

    // Validate file type
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFileTypes.includes(req.file.mimetype)) {
      await fs.unlink(req.file.path); // Remove temporary file
      return res.status(400).json({ 
        message: 'Invalid file type. Only images are allowed' 
      });
    }

    // Upload to Cloudinary
    const uploadResult = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: `profile_images/${user._id}`, // Organize images by user ID
      public_id: `profile_${Date.now()}`, // Unique identifier
      transformation: [
        { width: 500, height: 500, crop: 'limit' }, // Resize image
        { quality: 'auto' } // Auto-optimize quality
      ]
    });

    // Remove temporary local file
    await fs.unlink(req.file.path);

    // Update user's profile image URL
    user.profileImage = uploadResult.secure_url;
    await user.save();

    // Respond with success and new image URL
    res.status(200).json({
      message: 'Profile image uploaded successfully',
      imageUrl: uploadResult.secure_url
    });

  } catch (error) {
    // Remove temporary file in case of any error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to remove temporary file', unlinkError);
      }
    }

    // Log the error for server-side tracking
    console.error('Profile Image Upload Error:', error);

    // Send appropriate error response
    res.status(500).json({ 
      message: 'Image upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  becomeSeller,
  getSellerProfileById,
  deleteUserAccount,
  uploadProfileImage
};