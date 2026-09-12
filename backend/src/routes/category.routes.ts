import { Router } from 'express';
import {
  getCategories,
  getAdminCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  getAllSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../controllers/category.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/subcategories/all', getAllSubCategories);
router.get('/:id', getCategoryById);

// Admin-only Category routes
router.get('/admin/list', verifyJWT, verifyAdmin, getAdminCategories);
router.post('/', verifyJWT, verifyAdmin, createCategory);
router.put('/:id', verifyJWT, verifyAdmin, updateCategory);
router.patch('/:id/status', verifyJWT, verifyAdmin, toggleCategoryStatus);
router.delete('/:id', verifyJWT, verifyAdmin, deleteCategory);

// Admin-only Sub-Category dedicated routes
router.post('/:mainCategoryId/subcategories', verifyJWT, verifyAdmin, createSubCategory);
router.put('/:mainCategoryId/subcategories/:subCategoryId', verifyJWT, verifyAdmin, updateSubCategory);
router.delete('/:mainCategoryId/subcategories/:subCategoryId', verifyJWT, verifyAdmin, deleteSubCategory);

export default router;
