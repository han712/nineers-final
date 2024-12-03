import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
// Base validator middleware
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      await Promise.all(validations.map(validation => validation.run(req)));
      
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }));

      return res.status(400).json({
        success: false,
        errors: extractedErrors
      });
    } catch (error) {
      next(error);
    }
  };
};

// Common validation rules that can be reused
const commonValidations = {
  password: body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must include: uppercase, lowercase, number, and special character'),

  email: body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom((value) => {
      const blockedDomains = ['tempmail.com', 'throwaway.com'];
      const domain = value.split('@')[1];
      if (blockedDomains.includes(domain)) {
        throw new Error('This email domain is not allowed');
      }
      return true;
    }),

  username: body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores')
    .custom((value) => {
      if (value.toLowerCase().includes('admin')) {
        throw new Error('Username cannot contain the word "admin"');
      }
      return true;
    }),

  languages: body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array')
    .custom((languages) => {
      if (languages.length > 10) {
        throw new Error('Maximum 10 languages allowed');
      }
      return true;
    })
};

// Authentication validations
const registerValidation = validate([
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isString().withMessage('Full name must be a valid string')
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  commonValidations.username,
  commonValidations.email,
  commonValidations.password
  
]);

const loginValidation = validate([
  commonValidations.email,
  body('password').notEmpty().withMessage('Password is required')
]);

const SellerProfileIdValidation = validate([
  param('id')
    .notEmpty().withMessage('Seller ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid seller ID format');
      }
      return true;
    })
]);
// Seller-specific validations
const sellerProfileValidation = validate([
  commonValidations.sellerSkills,
  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 1000 }).withMessage('Description must be between 50 and 1000 characters')
    .trim(),
  body('hourlyRate')
    .notEmpty().withMessage('Hourly rate is required')
    .isFloat({ min: 1, max: 1000 }).withMessage('Hourly rate must be between 1 and 1000')
    .custom((value) => {
      if (value % 0.5 !== 0) {
        throw new Error('Hourly rate must be in increments of 0.50');
      }
      return true;
    }),
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  commonValidations.languages
]);

// Service (gig) validations
const serviceValidation = validate([
  body('title')
    .notEmpty().withMessage('Service title is required')
    .trim()
    .isLength({ min: 10, max: 100 }).withMessage('Title must be between 10 and 100 characters'),
  body('description')
    .notEmpty().withMessage('Service description is required')
    .trim()
    .isLength({ min: 50, max: 2000 }).withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string'),
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 5, max: 10000 }).withMessage('Price must be between $5 and $10,000'),
  body('deliveryTime')
    .notEmpty().withMessage('Delivery time is required')
    .isInt({ min: 1, max: 90 }).withMessage('Delivery time must be between 1 and 90 days'),
  body('revisions')
    .optional()
    .isInt({ min: 0, max: 10 }).withMessage('Revisions must be between 0 and 10'),
  body('tags')
    .optional()
    .isArray({ min: 1, max: 10 }).withMessage('Tags must be an array with 1-10 items')
    .custom((tags) => {
      if (tags.some((tag) => typeof tag !== 'string' || tag.trim().length === 0)) {
        throw new Error('Each tag must be a non-empty string');
      }
      return true;
    })
]);
const becomeSellerValidation = validate([
  body('skills')
    .notEmpty().withMessage('Skills are required')
    .isArray({ min: 1 }).withMessage('At least one skill is required')
    .custom((skills) => {
      if (skills.some(skill => typeof skill !== 'string' || skill.trim().length === 0)) {
        throw new Error('Skills must be non-empty strings');
      }
      if (skills.length > 20) {
        throw new Error('Maximum 20 skills allowed');
      }
      return true;
    }),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 50, max: 1000 }).withMessage('Description must be between 50 and 1000 characters'),

  body('hourlyRate')
    .notEmpty().withMessage('Hourly rate is required')
    .isFloat({ min: 1, max: 1000 }).withMessage('Hourly rate must be between 1 and 1000')
    .custom((value) => {
      if (value % 0.5 !== 0) {
        throw new Error('Hourly rate must be in increments of 0.50');
      }
      return true;
    }),

  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),

  body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array')
    .custom((languages) => {
      if (languages.length > 10) {
        throw new Error('Maximum 10 languages allowed');
      }
      return true;
    })
]);


// Review validation
const reviewValidation = validate([
  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment')
    .notEmpty().withMessage('Review comment is required')
    .trim()
    .isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
]);

// Search and filter validations
const searchValidation = validate([
  query('category').optional().isString(),
  query('priceRange')
    .optional()
    .matches(/^\d+-\d+$/).withMessage('Price range format should be min-max (e.g., 10-50)')
    .custom((value) => {
      const [min, max] = value.split('-').map(Number);
      if (min >= max) throw new Error('Minimum price must be less than maximum price');
      return true;
    }),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
]);


const profileUpdateValidation = validate([
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Full name can only contain letters and spaces'),
  commonValidations.username.optional(),
  commonValidations.email.optional(),
  body('currentPassword')
    .if(body('password').exists())
    .notEmpty().withMessage('Current password is required when updating password'),
  commonValidations.password.optional(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Location must not exceed 100 characters')
]);



export {
  validate,
  profileUpdateValidation,
  registerValidation,
  loginValidation,
  becomeSellerValidation,
  sellerProfileValidation,
  serviceValidation,
  reviewValidation,
  searchValidation,
  SellerProfileIdValidation
};