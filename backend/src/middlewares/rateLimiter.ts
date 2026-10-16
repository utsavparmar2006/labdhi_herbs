import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Standard JSON response handler for rate limit violations
 */
const createRateLimitHandler = (message: string) => {
  return (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message,
      retryAfter: res.getHeader('Retry-After') || 60,
    });
  };
};

/**
 * 1. Global API Rate Limiter
 * Applies to all standard API routes to prevent volumetric DDoS and scraping bots.
 * Allows 400 requests per 15 minutes per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 400,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many requests from this network. Please wait a moment before trying again.'
  ),
  skip: (req) => {
    // Skip static assets or health checks
    return req.path === '/api/health' || req.path === '/';
  },
});

/**
 * 2. Authentication & Credential Protection Limiter
 * Protects login, registration, password resets against brute-force & credential stuffing.
 * Allows 15 attempts per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many login or account verification attempts. For your security, please try again in 15 minutes.'
  ),
});

/**
 * 3. Checkout & Order Creation Limiter
 * Protects order creation endpoint against bot checkouts, inventory locking, and order spam.
 * Allows 20 orders per 10 minutes per IP.
 */
export const orderLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many order attempts from your network. Please wait a few minutes before placing another order.'
  ),
});

/**
 * 4. Coupon Code Anti-Brute-Force Limiter
 * Prevents dictionary attacks and automated guessing of private promo codes.
 * Allows 25 validations per 10 minutes per IP.
 */
export const couponLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many promo code checks. Please wait 10 minutes before testing another coupon code.'
  ),
});

/**
 * 5. Public Submissions Limiter (Reviews & Newsletter Subscriptions)
 * Prevents automated form spamming and database flooding.
 * Allows 10 submissions per 15 minutes per IP.
 */
export const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: createRateLimitHandler(
    'Too many submissions. Please wait 15 minutes before submitting again.'
  ),
});
