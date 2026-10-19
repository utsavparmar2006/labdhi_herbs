import { Router } from 'express';
import {
  syncCart,
  getActiveCart,
  getAbandonedCarts,
  sendCartRecoveryReminder,
} from '../controllers/cart.controller.js';
import { verifyJWT, verifyAdmin, verifyJWTOptional } from '../middlewares/auth.middleware.js';

const router = Router();

// Public / Customer cart routes
router.post('/sync', verifyJWTOptional, syncCart);
router.get('/', verifyJWTOptional, getActiveCart);

// Admin-only abandoned cart management
router.get('/abandoned', verifyJWT, verifyAdmin, getAbandonedCarts);
router.post('/abandoned/:id/remind', verifyJWT, verifyAdmin, sendCartRecoveryReminder);

export default router;
