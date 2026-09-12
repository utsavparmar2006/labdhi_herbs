import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize base name and preserve extension
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_')
      .slice(0, 40);
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e4)}`;
    cb(null, `${cleanName}_${uniqueSuffix}${ext}`);
  },
});

// File filter: only images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /jpeg|jpg|png|webp|gif|svg|avif/;
  const isExtAllowed = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const isMimeAllowed = file.mimetype.startsWith('image/');

  if (isExtAllowed && isMimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, SVG, GIF, AVIF) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

// File filter: videos (MP4, WebM, OGG, MOV)
const videoFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = /mp4|webm|ogg|mov|m4v/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isExtAllowed = allowedExtensions.test(ext);
  const isMimeAllowed =
    file.mimetype.startsWith('video/') || file.mimetype === 'application/octet-stream';

  if (isExtAllowed || isMimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, OGG, MOV) are allowed'));
  }
};

const uploadVideo = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit for video hero
  fileFilter: videoFilter,
});

/**
 * @desc Upload single image from folder / file picker
 * @route POST /api/v1/upload/image
 * @access Private (Admin only)
 */
router.post(
  '/image',
  verifyJWT,
  verifyAdmin,
  upload.single('file'),
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file was provided in the request',
        });
        return;
      }

      // Base server URL (e.g. http://localhost:5000)
      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:5000';
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded file',
        error: error.message,
      });
    }
  }
);

/**
 * @desc Upload video file from folder / file picker (for Hero Banner)
 * @route POST /api/v1/upload/video
 * @access Private (Admin only)
 */
router.post(
  '/video',
  verifyJWT,
  verifyAdmin,
  uploadVideo.single('file'),
  (req: Request, res: Response): void => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No video file was provided in the request',
        });
        return;
      }

      const protocol = req.protocol;
      const host = req.get('host') || 'localhost:5000';
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Video uploaded successfully',
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to process uploaded video',
        error: error.message,
      });
    }
  }
);

/**
 * @desc Get Media Library files from upload folder
 * @route GET /api/v1/upload/media-library
 * @access Public / Admin
 */
router.get('/media-library', (_req: Request, res: Response): void => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      res.status(200).json({ success: true, files: [] });
      return;
    }

    const host = _req.get('host') || 'localhost:5000';
    const protocol = _req.protocol;

    const fileNames = fs.readdirSync(UPLOAD_DIR);
    const validExtensions = [
      '.jpg',
      '.jpeg',
      '.png',
      '.webp',
      '.svg',
      '.gif',
      '.avif',
      '.mp4',
      '.webm',
      '.ogg',
      '.mov',
      '.m4v',
    ];

    const files = fileNames
      .filter((filename) => {
        const ext = path.extname(filename).toLowerCase();
        return validExtensions.includes(ext);
      })
      .map((filename) => {
        const ext = path.extname(filename).toLowerCase();
        const isVideo = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'].includes(ext);
        const filePath = path.join(UPLOAD_DIR, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          url: `${protocol}://${host}/uploads/${filename}`,
          type: isVideo ? 'video' : 'image',
          size: stats.size,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    res.status(200).json({
      success: true,
      files,
      totalCount: files.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to read media library folder',
      error: error.message,
    });
  }
});

export default router;
