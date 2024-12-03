import jwt from 'jsonwebtoken';
import { createError } from '../utils/createError.js';
import User from '../models/userModel.js';
import asyncHandler from './asyncHandler.js';

const authenticate = asyncHandler(async ( req, res, next) => {

  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};
const protect = async (req, res, next) => {
  try {
      // Verify token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
          return res.status(401).json({ message: 'Not authorized, no token' });
      }

      // Verify the token and get user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request object
      req.user = await User.findById(decoded.id).select('-password');
      next();
  } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'You do not have permission to perform this action'));
    }
    next();
  };
};
export {
  authenticate,
  authorizeAdmin,
  protect,
  restrictTo
};

