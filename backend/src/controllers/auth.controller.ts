import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Helper function to generate Access & Refresh tokens and save Refresh Token to DB
const generateAccessAndRefreshTokens = async (
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Cookie options for secure HTTP-only cookies
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
});

/**
 * @desc    Register a new user account
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Account with this email already exists',
      });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: 'user',
    });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );

    const cookieOptions = getCookieOptions();

    res
      .status(201)
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        success: true,
        message: 'Account created successfully!',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user & return Access & Refresh Tokens
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
      return;
    }

    // Find user with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    user.lastLoginAt = new Date();
    user.isOnline = true;
    await user.save();

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id.toString()
    );

    const cookieOptions = getCookieOptions();

    res
      .status(200)
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        success: true,
        message: 'Login successful!',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt,
          },
          accessToken,
        },
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Refresh Access Token using Refresh Token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public
 */
export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized - Refresh Token missing',
      });
      return;
    }

    const secret =
      process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_token_secret_2026';

    const decoded = jwt.verify(incomingRefreshToken, secret) as { _id: string };

    const user = await User.findById(decoded._id).select('+refreshToken');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid Refresh Token - User does not exist',
      });
      return;
    }

    if (incomingRefreshToken !== user.refreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh Token expired or already used',
      });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id.toString());

    const cookieOptions = getCookieOptions();

    res
      .status(200)
      .cookie('accessToken', accessToken, {
        ...cookieOptions,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .cookie('refreshToken', newRefreshToken, {
        ...cookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
      })
      .json({
        success: true,
        message: 'Access Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired Refresh Token',
    });
  }
};

/**
 * @desc    Logout user & invalidate refresh token
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            isOnline: false,
          },
          $unset: {
            refreshToken: 1,
          },
        },
        { new: true }
      );
    }

    const cookieOptions = getCookieOptions();

    res
      .status(200)
      .clearCookie('accessToken', cookieOptions)
      .clearCookie('refreshToken', cookieOptions)
      .json({
        success: true,
        message: 'Logged out successfully',
      });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current logged-in user profile
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
      return;
    }

    const { name, phone, address, city, state, pincode } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long',
      });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User account not found',
      });
      return;
    }

    user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (city !== undefined) user.city = city.trim();
    if (state !== undefined) user.state = state.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change current logged-in user password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changeUserPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request',
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: 'New password is required',
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
      return;
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    if (currentPassword) {
      const isMatch = await user.isPasswordCorrect(currentPassword);
      if (!isMatch) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }
    } else if (user.role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'Current password is required',
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
