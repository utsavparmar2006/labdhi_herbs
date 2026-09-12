import { Router } from 'express';
import {
  getStories,
  getAdminStories,
  createStory,
  updateStory,
  toggleStoryStatus,
  deleteStory,
} from '../controllers/story.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public Routes (Storefront)
router.get('/', getStories);

// Private Admin Routes
router.get('/admin/all', verifyJWT, verifyAdmin, getAdminStories);
router.post('/', verifyJWT, verifyAdmin, createStory);
router.put('/:id', verifyJWT, verifyAdmin, updateStory);
router.patch('/:id/status', verifyJWT, verifyAdmin, toggleStoryStatus);
router.delete('/:id', verifyJWT, verifyAdmin, deleteStory);

export default router;
