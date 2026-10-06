import { Router } from 'express';
import { translateTextHandler } from '../controllers/translate.controller.js';

const router = Router();

// POST /api/translate or /api/v1/translate
router.post('/', translateTextHandler);

export default router;
