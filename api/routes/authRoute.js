import express from 'express';
import { validationResult } from 'express-validator';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  deleteUserAccount,
} from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  loginValidation,
  profileUpdateValidation,
  registerValidation
  
} from '../middleware/userValidation.js';

const router = express.Router();

/**
 * Public Routes
 */

router.post('/register', registerValidation, registerUser, (req, res) => {
  const errors = validationResult(req);
  if (!errors.empty()) {
    return res.status(400).json({ errors: errors.array() });  
  }
});

router.post('/login',loginValidation, loginUser);
router.get('/logout', logoutUser);

/**
 * Protected Routes (requires authentication)
 */

router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/profile', protect ,getCurrentUser);
router.get('/profile/:id', getCurrentUser);

router.put('/profile',protect, profileUpdateValidation, updateUserProfile);
router.put('/profile/:id', updateUserProfile);


router.delete('/delete-account', deleteUserAccount);

export default router;