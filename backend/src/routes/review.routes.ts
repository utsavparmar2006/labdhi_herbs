import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { optimizeImageFile } from '../utils/mediaOptimizer.js';
import {
  getProductReviews,
  createReview,
  voteHelpful,
  getAdminReviews,
  updateReviewStatus,
  replyToReview,
  deleteReview,
} from '../controllers/review.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';
import { submissionLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Ensure uploads/reviews directory exists
const REVIEW_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'reviews');
if (!fs.existsSync(REVIEW_UPLOAD_DIR)) {
  fs.mkdirSync(REVIEW_UPLOAD_DIR, { recursive: true });
}

// Multer storage for customer review photos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(REVIEW_UPLOAD_DIR)) {
      fs.mkdirSync(REVIEW_UPLOAD_DIR, { recursive: true });
    }
    cb(null, REVIEW_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `review_${cleanName}_${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = /jpeg|jpg|png|webp|avif/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype.startsWith('image/');
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, AVIF) are allowed'));
  }
};

const uploadReviewPhotos = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB per image
  fileFilter,
});

// Middleware to optimize review photos and serve /uploads/reviews URL correctly
const fixReviewPhotosUrl = async (req: any, _res: any, next: any) => {
  if (req.files && Array.isArray(req.files)) {
    try {
      for (const file of req.files) {
        // Compress review photo without cropping (1200px max, quality 82)
        const opt = await optimizeImageFile(file.path, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 82,
        });
        file.path = opt.optimizedPath;
        file.filename = `reviews/${opt.filename}`;
        file.mimetype = opt.mimetype;
        file.size = opt.size;
      }
    } catch {
      // Non-blocking fallback
    }
  }
  next();
};

/* ============================================================
   PUBLIC ENDPOINTS (Accessible to any visitor / guest / user)
   ============================================================ */

// 1. Get approved reviews & aggregate statistics for a product
router.get('/product/:productId', getProductReviews);

// 2. Submit a customer review with up to 5 photos (Protected against automated spam)
router.post(
  '/product/:productId',
  submissionLimiter,
  uploadReviewPhotos.array('images', 5),
  fixReviewPhotosUrl,
  createReview
);

// 3. Upvote review as helpful
router.post('/:reviewId/helpful', voteHelpful);

/* ============================================================
   ADMIN MODERATION ENDPOINTS (Protected with verifyJWT & verifyAdmin)
   ============================================================ */

router.get('/admin', verifyJWT, verifyAdmin, getAdminReviews);
router.patch('/admin/:id/status', verifyJWT, verifyAdmin, updateReviewStatus);
router.post('/admin/:id/reply', verifyJWT, verifyAdmin, replyToReview);
router.delete('/admin/:id', verifyJWT, verifyAdmin, deleteReview);

export default router;
