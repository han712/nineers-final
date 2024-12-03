// routes/reviewRoutes.js
import express from 'express';
import {
  createReview,
  getReviews,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

// Route for creating a review
router.post('/', createReview);

// Route for fetching reviews for a specific gig
router.get('/:gigId', getReviews);

// Route for deleting a review (implement logic in controller)
router.delete('/:id', deleteReview);

export default router;
