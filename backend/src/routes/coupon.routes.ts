import { Router } from 'express';
import {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes for checkout
router.get('/', getCoupons);
router.post('/validate', validateCoupon);

// Admin-only management routes
router.get('/:id', verifyJWT, verifyAdmin, getCouponById);
router.post('/', verifyJWT, verifyAdmin, createCoupon);
router.put('/:id', verifyJWT, verifyAdmin, updateCoupon);
router.patch('/:id/status', verifyJWT, verifyAdmin, toggleCouponStatus);
router.delete('/:id', verifyJWT, verifyAdmin, deleteCoupon);

export default router;
