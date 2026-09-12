import { Router } from 'express';
import {
  getBlogs,
  getBlogById,
  getAdminBlogs,
  createBlog,
  updateBlog,
  toggleBlogStatus,
  toggleBlogHomeStatus,
  deleteBlog,
} from '../controllers/blog.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes (Storefront)
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Private Admin Routes
router.get('/admin/all', verifyJWT, verifyAdmin, getAdminBlogs);
router.post('/', verifyJWT, verifyAdmin, createBlog);
router.put('/:id', verifyJWT, verifyAdmin, updateBlog);
router.patch('/:id/status', verifyJWT, verifyAdmin, toggleBlogStatus);
router.patch('/:id/home', verifyJWT, verifyAdmin, toggleBlogHomeStatus);
router.delete('/:id', verifyJWT, verifyAdmin, deleteBlog);

export default router;
