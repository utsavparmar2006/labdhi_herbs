import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import healthRoutes from './routes/health.routes.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import homepageRoutes from './routes/homepage.routes.js';
import categoryRoutes from './routes/category.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import productRoutes from './routes/product.routes.js';
import storyRoutes from './routes/story.routes.js';
import blogRoutes from './routes/blog.routes.js';
import orderRoutes from './routes/order.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import siteSettingsRoutes from './routes/siteSettings.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import subscriberRoutes from './routes/subscriber.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app: Application = express();

// Security HTTP Headers with cross-origin resource sharing for uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing (CORS)
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Static uploads folder for serving uploaded images
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// HTTP Request Logger
app.use(morgan('dev'));

// Body & Cookie Parser Middleware with explicit limits (Industry Standard Protection)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// API Routes
app.use('/api', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/homepage-config', homepageRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/public/categories', categoryRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/public/products', productRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/public/stories', storyRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/public/blogs', blogRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/public/orders', orderRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/public/coupons', couponRoutes);
app.use('/api/v1/site-settings', siteSettingsRoutes);
app.use('/api/public/site-settings', siteSettingsRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/public/payment', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/public/reviews', reviewRoutes);
app.use('/api/v1/subscribers', subscriberRoutes);
app.use('/api/public/subscribers', subscriberRoutes);

// Root Route welcome message
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Labdhi Herbs API Server',
    healthCheck: '/api/health',
    authEndpoints: {
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      refreshToken: 'POST /api/v1/auth/refresh-token',
      logout: 'POST /api/v1/auth/logout',
      me: 'GET /api/v1/auth/me',
    },
    userEndpoints: {
      stats: 'GET /api/v1/users/stats',
      list: 'GET /api/v1/users',
      details: 'GET /api/v1/users/:id',
      update: 'PUT /api/v1/users/:id',
      toggleStatus: 'PATCH /api/v1/users/:id/status',
      delete: 'DELETE /api/v1/users/:id',
    },
    version: '1.0.0',
  });
});

// 404 Handler for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Route Not Found`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
