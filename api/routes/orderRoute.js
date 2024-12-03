// // routes/orderRoutes.js
// import express from 'express';
// import orderController from '../controllers/orderController.js';
// import { protect } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // All order routes require authentication
// router.use(protect);

// router.post('/gig/:gigId', orderController.createOrder);
// router.get('/buyer', orderController.getBuyerOrders);
// router.get('/seller', orderController.getSellerOrders);
// router.patch('/:id/status', orderController.updateOrderStatus);
// router.patch('/:id/cancel', orderController.cancelOrder);
// router.patch('/:id/deliver', orderController.deliverOrder);

// export default router;