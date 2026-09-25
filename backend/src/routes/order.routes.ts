import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
  trackOrderByNumber,
} from '../controllers/order.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer authenticated routes
router.get('/my-orders', verifyJWT, getMyOrders);

// Protected route: require user login to create order
router.post('/', verifyJWT, createOrder);
router.get('/track/:orderId', trackOrderByNumber);
router.get('/:id', getOrderById);

// Admin routes for order tracking and status transitions
router.get('/', verifyJWT, verifyAdmin, getAllOrders);
router.patch('/:id/status', verifyJWT, verifyAdmin, updateOrderStatus);
router.put('/:id/status', verifyJWT, verifyAdmin, updateOrderStatus);

export default router;
