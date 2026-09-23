import { Router } from 'express';
import {
  subscribe,
  getAllSubscribers,
  getNewsletterSettings,
  updateNewsletterSettings,
  exportSubscribersCsv,
  resendMessage,
  deleteSubscriber,
  testEmailSettings,
  testWhatsAppGateway,
} from '../controllers/subscriber.controller.js';
import { verifyJWT, verifyAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Public route: Customer lead capture & subscription
router.post('/subscribe', subscribe);

// Admin protected routes: Management, Configuration, Export
router.get('/', verifyJWT, verifyAdmin, getAllSubscribers);
router.get('/settings', verifyJWT, verifyAdmin, getNewsletterSettings);
router.put('/settings', verifyJWT, verifyAdmin, updateNewsletterSettings);
router.post('/settings/test-email', verifyJWT, verifyAdmin, testEmailSettings);
router.post('/settings/test-whatsapp', verifyJWT, verifyAdmin, testWhatsAppGateway);
router.get('/export', verifyJWT, verifyAdmin, exportSubscribersCsv);
router.post('/:id/resend', verifyJWT, verifyAdmin, resendMessage);
router.delete('/:id', verifyJWT, verifyAdmin, deleteSubscriber);

export default router;
