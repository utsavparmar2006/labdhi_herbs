import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getMyOrders,
} from '../controllers/order.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Customer authenticated routes
router.get('/my-orders', verifyJWT, getMyOrders);

// Public routes for checkout and receipt
router.post('/', createOrder);
router.get('/:id', getOrderById);

// Admin routes for order tracking and status transitions
router.get('/', verifyJWT, verifyAdmin, getAllOrders);
router.patch('/:id/status', verifyJWT, verifyAdmin, updateOrderStatus);

export default router;
