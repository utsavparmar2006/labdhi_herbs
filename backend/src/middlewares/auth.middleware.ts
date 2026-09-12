import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const verifyJWT = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request - Access Token missing',
      });
      return;
    }

    const secret = process.env.ACCESS_TOKEN_SECRET || 'fallback_access_token_secret_2026';
    const decoded = jwt.verify(token, secret) as { _id: string; email: string };

    const user = await User.findById(decoded._id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid Access Token - User does not exist',
      });
      return;
    }

    if (user.status === 'inactive') {
      res.status(403).json({
        success: false,
        message: 'Account disabled - Your account access has been suspended',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized request - Token invalid or expired',
    });
  }
};

export const verifyAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden - Administrator access required',
    });
    return;
  }
  next();
};
