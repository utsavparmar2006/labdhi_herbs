import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * @desc    Get summary statistics for User Management
 * @route   GET /api/v1/users/stats
 * @access  Private/Admin
 */
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const onlineUsers = await User.countDocuments({ isOnline: true });

    // New users registered this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = await User.countDocuments({
      createdAt: { $gte: firstDayOfMonth },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        adminUsers,
        onlineUsers,
        newThisMonth,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new user / admin account from admin panel
 * @route   POST /api/v1/users
 * @access  Private/Admin
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, password, role, status } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields',
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
      return;
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: role || 'user',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'New user account created successfully',
      data: {
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          status: newUser.status,
          isOnline: newUser.isOnline,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated, searchable, filtered list of users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || '';
    const status = (req.query.status as string) || '';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          totalUsers,
          currentPage: page,
          totalPages,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single user details by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user details (name, email, phone, role, status)
 * @route   PUT /api/v1/users/:id
 * @access  Private/Admin
 */
export const updateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, role, status } = req.body;
    const targetUserId = req.params.id;

    const user = await User.findById(targetUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Prevent demoting self from admin role
    if (req.user?._id.toString() === targetUserId && role && role !== 'admin') {
      res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin status',
      });
      return;
    }

    // Prevent deactivating self
    if (req.user?._id.toString() === targetUserId && status === 'inactive') {
      res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
      return;
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active/inactive status
 * @route   PATCH /api/v1/users/:id/status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetUserId = req.params.id;

    if (req.user?._id.toString() === targetUserId) {
      res.status(400).json({
        success: false,
        message: 'You cannot change your own active status',
      });
      return;
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    user.status = user.status === 'active' ? 'inactive' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: {
        _id: user._id,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const targetUserId = req.params.id;

    if (req.user?._id.toString() === targetUserId) {
      res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
      return;
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Check if target user is last remaining admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete the last remaining administrator',
        });
        return;
      }
    }

    await User.findByIdAndDelete(targetUserId);

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
      data: { id: targetUserId },
    });
  } catch (error) {
    next(error);
  }
};
