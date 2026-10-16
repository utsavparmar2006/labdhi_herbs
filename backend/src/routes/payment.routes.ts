import { Router } from 'express';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
} from '../controllers/payment.controller.js';

const router = Router();

router.get('/razorpay/key', getRazorpayKey);
router.post('/razorpay/create-order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Authoritative Server-to-Server Razorpay Webhook
router.post('/razorpay/webhook', handleRazorpayWebhook);

export default router;
