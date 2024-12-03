// routes/gigRoutes.js
import express from 'express';
import gigController from '../controllers/gigController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
// import reviewRouter from '../routes/reviewRoute.js';

const router = express.Router();

// Re-route into review router
// router.use('/:gigId/reviews', reviewRouter);

// Public routes
router.get('/', gigController.getGigs);
router.get('/:id', gigController.getGig);
router.get('/seller/:userId', gigController.getSellerGigs);

// Protected routes (require login)
router.use(protect);

// Seller only routes
router.use(restrictTo('seller'));
router
  .route('/')
  .post(gigController.createGig);

router
  .route('/:id')
  .patch(gigController.updateGig)
  .delete(gigController.deleteGig);
  
router.patch(
  '/:id/toggle-status', gigController.toggleGigStatus);

export default router;