import { Router } from 'express';
import {
  getSiteSettings,
  updateSiteSettings,
  updateProfile,
  updateAboutUs,
  updateLegalPolicy,
  updateFaq,
  updateCopyright,
  updateLogos,
  updateBanners,
  updateGeneralSettings,
} from '../controllers/siteSettings.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public read access (for customer-facing footer, legal pages, etc.)
router.get('/', getSiteSettings);

// Admin-only write access
router.put('/', verifyJWT, verifyAdmin, updateSiteSettings);
router.put('/profile', verifyJWT, verifyAdmin, updateProfile);
router.put('/about', verifyJWT, verifyAdmin, updateAboutUs);
router.put('/policy/:section', verifyJWT, verifyAdmin, updateLegalPolicy);
router.put('/faq', verifyJWT, verifyAdmin, updateFaq);
router.put('/copyright', verifyJWT, verifyAdmin, updateCopyright);
router.put('/logos', verifyJWT, verifyAdmin, updateLogos);
router.put('/banners', verifyJWT, verifyAdmin, updateBanners);
router.put('/general', verifyJWT, verifyAdmin, updateGeneralSettings);

export default router;
