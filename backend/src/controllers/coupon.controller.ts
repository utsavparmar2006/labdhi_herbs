import { Request, Response } from 'express';
import { Coupon, ICoupon } from '../models/Coupon.model.js';

/**
 * Seed initial default coupons if none exist
 */
export const seedDefaultCoupons = async () => {
  // Auto-seeding disabled so deleted coupons never re-appear on restart
  return;
};

/**
 * @desc Get all coupons with search & filters
 * @route GET /api/v1/coupons
 * @access Public (filtered) / Admin
 */
export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, showOnlyPublic } = req.query;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (showOnlyPublic === 'true') {
      query.status = 'active';
      query.showInList = true;
      query.startDate = { $lte: new Date() };
      query.endDate = { $gte: new Date() };
    }

    if (search) {
      query.code = { $regex: String(search).trim(), $options: 'i' };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve coupons',
      error: error.message,
    });
  }
};

/**
 * @desc Get single coupon by ID
 * @route GET /api/v1/coupons/:id
 * @access Admin
 */
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve coupon',
      error: error.message,
    });
  }
};

/**
 * @desc Create a new coupon
 * @route POST /api/v1/coupons
 * @access Admin
 */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code,
      type = 'percentage',
      value = 0,
      minimumRequirement = 'none',
      minAmount = 0,
      minQuantity = 0,
      onlinePaymentOnly = false,
      limitTotalUsage = false,
      totalUsageLimit = 0,
      limitPerCustomer = false,
      startDate,
      endDate,
      status = 'active',
      showInList = true,
    } = req.body;

    if (!code || !code.trim()) {
      res.status(400).json({ success: false, message: 'Coupon code is required' });
      return;
    }

    if (!endDate) {
      res.status(400).json({ success: false, message: 'End expiry date is required' });
      return;
    }

    const normalizedCode = code.trim().toUpperCase();

    // Check duplicate
    const existing = await Coupon.findOne({ code: normalizedCode });
    if (existing) {
      res.status(400).json({ success: false, message: `Coupon '${normalizedCode}' already exists` });
      return;
    }

    const coupon = await Coupon.create({
      code: normalizedCode,
      type,
      value: Number(value),
      minimumRequirement,
      minAmount: Number(minAmount),
      minQuantity: Number(minQuantity),
      onlinePaymentOnly: Boolean(onlinePaymentOnly),
      limitTotalUsage: Boolean(limitTotalUsage),
      totalUsageLimit: Number(totalUsageLimit),
      limitPerCustomer: Boolean(limitPerCustomer),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      status,
      showInList: Boolean(showInList),
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message,
    });
  }
};

/**
 * @desc Update an existing coupon
 * @route PUT /api/v1/coupons/:id
 * @access Admin
 */
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minimumRequirement,
      minAmount,
      minQuantity,
      onlinePaymentOnly,
      limitTotalUsage,
      totalUsageLimit,
      limitPerCustomer,
      startDate,
      endDate,
      status,
      showInList,
    } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    if (code) {
      const normalizedCode = code.trim().toUpperCase();
      const duplicate = await Coupon.findOne({ code: normalizedCode, _id: { $ne: id } });
      if (duplicate) {
        res.status(400).json({ success: false, message: `Coupon '${normalizedCode}' already in use` });
        return;
      }
      coupon.code = normalizedCode;
    }

    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = Number(value);
    if (minimumRequirement !== undefined) coupon.minimumRequirement = minimumRequirement;
    if (minAmount !== undefined) coupon.minAmount = Number(minAmount);
    if (minQuantity !== undefined) coupon.minQuantity = Number(minQuantity);
    if (onlinePaymentOnly !== undefined) coupon.onlinePaymentOnly = Boolean(onlinePaymentOnly);
    if (limitTotalUsage !== undefined) coupon.limitTotalUsage = Boolean(limitTotalUsage);
    if (totalUsageLimit !== undefined) coupon.totalUsageLimit = Number(totalUsageLimit);
    if (limitPerCustomer !== undefined) coupon.limitPerCustomer = Boolean(limitPerCustomer);
    if (startDate) coupon.startDate = new Date(startDate);
    if (endDate) coupon.endDate = new Date(endDate);
    if (status !== undefined) coupon.status = status;
    if (showInList !== undefined) coupon.showInList = Boolean(showInList);

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message,
    });
  }
};

/**
 * @desc Quick toggle coupon active/inactive status
 * @route PATCH /api/v1/coupons/:id/status
 * @access Admin
 */
export const toggleCouponStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    coupon.status = coupon.status === 'active' ? 'inactive' : 'active';
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon status updated to ${coupon.status}`,
      data: coupon,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle status',
      error: error.message,
    });
  }
};

/**
 * @desc Delete coupon
 * @route DELETE /api/v1/coupons/:id
 * @access Admin
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} deleted successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message,
    });
  }
};

/**
 * @desc Public validation endpoint for customer checkout
 * @route POST /api/v1/coupons/validate
 * @access Public
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal = 0, itemsCount = 0, paymentMethod = 'cod', userId = '' } = req.body;

    if (!code || !code.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a coupon code' });
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: `Coupon code '${normalizedCode}' is invalid or does not exist`,
      });
      return;
    }

    if (coupon.status !== 'active') {
      res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' is currently inactive`,
      });
      return;
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' has not started yet`,
      });
      return;
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' has expired`,
      });
      return;
    }

    // Minimum requirement validation
    if (coupon.minimumRequirement === 'amount' && subtotal < coupon.minAmount) {
      res.status(400).json({
        success: false,
        message: `Coupon requires a minimum cart subtotal of ₹${coupon.minAmount}`,
      });
      return;
    }

    if (coupon.minimumRequirement === 'quantity' && itemsCount < coupon.minQuantity) {
      res.status(400).json({
        success: false,
        message: `Coupon requires a minimum quantity of ${coupon.minQuantity} items in your bag`,
      });
      return;
    }

    // Online payment only restriction
    if (coupon.onlinePaymentOnly && paymentMethod === 'cod') {
      res.status(400).json({
        success: false,
        message: `Coupon '${normalizedCode}' is only applicable for Prepaid / Online Payments`,
      });
      return;
    }

    // Usage limits
    if (coupon.limitTotalUsage && coupon.totalUsageLimit && coupon.usageCount >= coupon.totalUsageLimit) {
      res.status(400).json({
        success: false,
        message: `Coupon code '${normalizedCode}' has reached its maximum usage limit`,
      });
      return;
    }

    if (coupon.limitPerCustomer && userId && coupon.usedBy?.includes(userId)) {
      res.status(400).json({
        success: false,
        message: `You have already redeemed coupon '${normalizedCode}' on a previous order`,
      });
      return;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = Math.round((Number(subtotal) * Number(coupon.value)) / 100);
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = Math.min(Number(coupon.value), Number(subtotal));
    } else if (coupon.type === 'free_shipping') {
      discountAmount = 0; // standard delivery is free across India
    }

    const description =
      coupon.type === 'percentage'
        ? `${coupon.value}% OFF on your order`
        : coupon.type === 'fixed_amount'
        ? `₹${coupon.value} FLAT OFF`
        : 'Free Express Shipping';

    res.status(200).json({
      success: true,
      valid: true,
      data: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        description,
        onlinePaymentOnly: coupon.onlinePaymentOnly,
      },
      message: `Coupon '${coupon.code}' applied successfully! Saved ₹${discountAmount}`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message,
    });
  }
};
