import { Router } from 'express';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  createRazorpayRefund,
} from '../controllers/payment.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/razorpay/key', getRazorpayKey);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Authoritative Server-to-Server Razorpay Webhook
router.post('/razorpay/webhook', handleRazorpayWebhook);

// Admin-only Razorpay Refund route
router.post('/razorpay/refund', verifyJWT, verifyAdmin, createRazorpayRefund);

export default router;