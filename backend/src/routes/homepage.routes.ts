import { Router } from 'express';
import {
  getHomePageConfig,
  updateHomePageConfig,
} from '../controllers/homepage.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route to fetch configuration for header & hero
router.get('/', getHomePageConfig);

// Protected admin-only route to update configuration
router.put('/', verifyJWT, verifyAdmin, updateHomePageConfig);

export default router;
