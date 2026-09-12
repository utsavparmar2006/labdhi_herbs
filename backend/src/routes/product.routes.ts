import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductFeatured,
} from '../controllers/product.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only protected routes
router.post('/', verifyJWT, verifyAdmin, createProduct);
router.put('/:id', verifyJWT, verifyAdmin, updateProduct);
router.patch('/:id/featured', verifyJWT, verifyAdmin, toggleProductFeatured);
router.delete('/:id', verifyJWT, verifyAdmin, deleteProduct);

export default router;
