import { Router } from 'express';
import {
  getUserStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Protect all routes with JWT Authentication & Admin Permission check
router.use(verifyJWT);
router.use(verifyAdmin);

router.get('/stats', getUserStats);
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
