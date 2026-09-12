import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// Supported Promotional Coupons
const VALID_COUPONS: Record<string, { type: 'percent' | 'flat'; value: number; minSubtotal: number }> = {
  HERBAL10: { type: 'percent', value: 10, minSubtotal: 0 },
  AYURVEDA15: { type: 'percent', value: 15, minSubtotal: 499 },
  WELCOME50: { type: 'flat', value: 50, minSubtotal: 299 },
};

const generateOrderNumber = (): string => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `LH-${dateStr}-${randomSuffix}`;
};

/**
 * @desc Create a new Customer Order
 * @route POST /api/v1/orders
 * @access Public (Supports guest & registered checkout)
 */
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customer,
      shippingAddress,
      items,
      paymentMethod = 'cod',
      couponCode = '',
      notes = '',
    } = req.body;

    if (!customer?.fullName || !customer?.phone || !customer?.email) {
      res.status(400).json({
        success: false,
        message: 'Customer name, 10-digit phone, and valid email are required',
      });
      return;
    }

    if (!shippingAddress?.address || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.pincode) {
      res.status(400).json({
        success: false,
        message: 'Complete shipping address including street, city, state, and pincode is required',
      });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Your shopping cart is empty. Please add items before checkout.',
      });
      return;
    }

    // Calculate subtotal from validated item prices
    let subtotal = 0;
    const formattedItems: IOrderItem[] = items.map((item: any) => {
      const unitPrice = Number(item.product?.price || item.price || 0);
      const qty = Math.max(1, Number(item.quantity || 1));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        product: {
          id: item.product?.id || item.productId || 'unknown',
          name: item.product?.name || item.name || 'Herbal Product',
          price: unitPrice,
          image: item.product?.image || item.image || '/uploads/logo/Main-logo-531.jpg',
          category: item.product?.category || item.category || 'Herbal Care',
        },
        quantity: qty,
        price: unitPrice,
        total: lineTotal,
      };
    });

    // Calculate Coupon Discount
    let discount = 0;
    const normalizedCoupon = String(couponCode).trim().toUpperCase();
    let couponRecord = null;

    if (normalizedCoupon) {
      try {
        couponRecord = await Coupon.findOne({ code: normalizedCoupon, status: 'active' });
        if (couponRecord) {
          const now = new Date();
          const isDateValid = (!couponRecord.startDate || couponRecord.startDate <= now) && (!couponRecord.endDate || couponRecord.endDate >= now);
          const isAmountValid = couponRecord.minimumRequirement !== 'amount' || subtotal >= couponRecord.minAmount;
          const isQuantityValid = couponRecord.minimumRequirement !== 'quantity' || items.length >= couponRecord.minQuantity;
          const isPaymentValid = !couponRecord.onlinePaymentOnly || paymentMethod === 'online';
          const isUsageValid = !couponRecord.limitTotalUsage || !couponRecord.totalUsageLimit || couponRecord.usageCount < couponRecord.totalUsageLimit;

          if (isDateValid && isAmountValid && isQuantityValid && isPaymentValid && isUsageValid) {
            if (couponRecord.type === 'percentage') {
              discount = Math.round((subtotal * couponRecord.value) / 100);
            } else if (couponRecord.type === 'fixed_amount') {
              discount = Math.min(couponRecord.value, subtotal);
            }
          }
        }
      } catch (err) {
        console.warn('Coupon database check warning:', err);
      }

      // Fallback to static rules if not found in DB
      if (discount === 0 && VALID_COUPONS[normalizedCoupon]) {
        const rule = VALID_COUPONS[normalizedCoupon];
        if (subtotal >= rule.minSubtotal) {
          if (rule.type === 'percent') {
            discount = Math.round((subtotal * rule.value) / 100);
          } else {
            discount = Math.min(rule.value, subtotal);
          }
        }
      }
    }

    const shipping = 0; // Free all-India delivery
    const tax = 0; // Inclusive of GST
    const total = Math.max(0, subtotal - discount + shipping);

    const orderId = generateOrderNumber();

    // Payment Info
    const isOnline = paymentMethod === 'online';
    const payment = {
      method: isOnline ? ('online' as const) : ('cod' as const),
      status: isOnline ? ('completed' as const) : ('pending' as const),
      transactionId: isOnline ? `TXN_${Date.now()}_${Math.floor(100 + Math.random() * 900)}` : '',
      paidAt: isOnline ? new Date() : undefined,
    };

    const userId = (req as any).user?._id || req.body.userId;

    const newOrder = await Order.create({
      orderId,
      ...(userId ? { user: userId } : {}),
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
      },
      shippingAddress: {
        fullName: shippingAddress.fullName || customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: shippingAddress.phone || customer.phone.trim(),
        address: shippingAddress.address.trim(),
        landmark: (shippingAddress.landmark || '').trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
      },
      items: formattedItems,
      pricing: {
        subtotal,
        discount,
        shipping,
        tax,
        total,
      },
      couponCode: discount > 0 ? normalizedCoupon : '',
      payment,
      orderStatus: 'placed',
      notes: (notes || '').trim(),
    });

    // Increment coupon usage count and record customer
    if (couponRecord && discount > 0) {
      try {
        couponRecord.usageCount = (couponRecord.usageCount || 0) + 1;
        if (userId && !couponRecord.usedBy?.includes(String(userId))) {
          couponRecord.usedBy.push(String(userId));
        }
        await couponRecord.save();
      } catch (cErr) {
        console.warn('Could not update coupon usage count:', cErr);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process order',
      error: error.message,
    });
  }
};

/**
 * @desc Get Single Order Details by Order ID or Mongo ID
 * @route GET /api/v1/orders/:id
 * @access Public (Customer order tracking & invoice)
 */
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findOne({
      $or: [
        { orderId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve order',
      error: error.message,
    });
  }
};

/**
 * @desc Get All Orders with stats & filters
 * @route GET /api/v1/orders
 * @access Private (Admin only)
 */
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    if (search) {
      const searchRegex = { $regex: String(search), $options: 'i' };
      filter.$or = [
        { orderId: searchRegex },
        { 'customer.fullName': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
        { 'shippingAddress.city': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.max(1, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount, statsAgg] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(filter),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: {
                $cond: [{ $in: ['$orderStatus', ['placed', 'confirmed', 'processing']] }, 1, 0],
              },
            },
            deliveredOrders: {
              $sum: {
                $cond: [{ $eq: ['$orderStatus', 'delivered'] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const stats = statsAgg[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      pendingOrders: 0,
      deliveredOrders: 0,
    };

    res.status(200).json({
      success: true,
      data: orders,
      stats,
      pagination: {
        totalOrders: totalCount,
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        limit: limitNum,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

/**
 * @desc Update Order Status
 * @route PATCH /api/v1/orders/:id/status
 * @access Private (Admin only)
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findOne({
      $or: [
        { orderId: id },
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
      ],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    if (status) {
      order.orderStatus = status;
    }

    if (paymentStatus) {
      order.payment.status = paymentStatus;
      if (paymentStatus === 'completed' && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }
    } else if (status === 'delivered' && order.payment.method === 'cod') {
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order ${order.orderId} status updated to ${order.orderStatus}`,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

/**
 * @desc Get Orders for logged-in Customer
 * @route GET /api/v1/orders/my-orders
 * @access Private (Customer)
 */
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized request - please sign in to view your orders',
      });
      return;
    }

    const queryConditions: any[] = [{ user: req.user._id }];
    if (req.user.email) {
      queryConditions.push({ 'customer.email': req.user.email.toLowerCase() });
    }
    if (req.user.phone) {
      queryConditions.push({ 'customer.phone': req.user.phone });
    }

    const orders = await Order.find({ $or: queryConditions }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your orders',
      error: error.message,
    });
  }
};
