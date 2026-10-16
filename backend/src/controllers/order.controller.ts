import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Order, IOrderItem } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import { Coupon } from '../models/Coupon.model.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { getRazorpayConfig, getRazorpayInstance } from '../config/razorpay.js';
import { calculateGstInclusive, sendOrderInvoiceEmail } from '../utils/orderInvoiceTemplate.js';
import SiteSettings from '../models/SiteSettings.model.js';

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
 * @access Private (Requires customer authentication)
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id || (req as any).user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Please sign in or register to place your order.',
      });
      return;
    }
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

    // Authoritative Server-Side Product Lookup & Price Verification (Anti-Tampering)
    const productSlugsOrIds = items
      .map((i: any) => String(i.product?.id || i.productId || i.id || '').trim())
      .filter(Boolean);

    const dbProductMap = new Map<string, any>();
    if (productSlugsOrIds.length > 0) {
      try {
        const objectIds = productSlugsOrIds.filter((id) => mongoose.isValidObjectId(id));
        const foundProducts = await Product.find({
          $or: [
            { id: { $in: productSlugsOrIds } },
            ...(objectIds.length > 0 ? [{ _id: { $in: objectIds } }] : []),
          ],
        }).lean();

        foundProducts.forEach((p: any) => {
          if (p.id) dbProductMap.set(String(p.id).toLowerCase(), p);
          if (p._id) dbProductMap.set(String(p._id), p);
        });
      } catch (dbErr) {
        console.warn('[Order Price Validation] Product lookup fallback:', dbErr);
      }
    }

    // Calculate subtotal from authoritative verified item prices
    let subtotal = 0;
    const formattedItems: IOrderItem[] = items.map((item: any) => {
      const slugKey = String(item.product?.id || item.productId || item.id || '').trim().toLowerCase();
      const matchedDbProduct = dbProductMap.get(slugKey);

      // Protect against client price manipulation: Use verified DB price if product exists
      const unitPrice = matchedDbProduct
        ? Number(matchedDbProduct.price)
        : Number(item.product?.price || item.price || 0);

      const qty = Math.max(1, Number(item.quantity || 1));
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      return {
        product: {
          id: matchedDbProduct?.id || item.product?.id || item.productId || 'unknown',
          name: matchedDbProduct?.name || item.product?.name || item.name || 'Herbal Product',
          price: unitPrice,
          image: matchedDbProduct?.image || item.product?.image || item.image || '/uploads/logo/Main-logo-531.jpg',
          category: matchedDbProduct?.category || item.product?.category || item.category || 'Herbal Care',
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

    // Retrieve site settings for dynamic delivery charges & inclusive GST
    let siteSettings: any = null;
    try {
      siteSettings = await SiteSettings.findOne().lean();
    } catch (sErr) {
      console.warn('SiteSettings lookup warning:', sErr);
    }

    // Determine destination country & calculate delivery fee
    const customerCountry = (shippingAddress?.country || 'India').trim();
    const isIndia = customerCountry.toLowerCase() === 'india';

    // International orders MUST be prepaid (COD is strictly domestic)
    if (!isIndia && paymentMethod === 'cod') {
      res.status(400).json({
        success: false,
        message: 'Cash on Delivery (COD) is available for domestic Indian deliveries only. Please select Online Payment for international shipments.',
      });
      return;
    }

    let shipping = 0;
    const isFreeShippingCoupon = couponRecord?.type === 'free_shipping';

    if (isFreeShippingCoupon) {
      shipping = 0;
    } else if (isIndia) {
      // Domestic India: Gujarat vs Outside Gujarat
      const customerState = (shippingAddress?.state || 'Gujarat').trim().toLowerCase();
      const isGujarat = customerState === 'gujarat';

      const deliveryConfig = siteSettings?.deliveryCharges || {
        enabled: true,
        gujaratCharge: 50,
        outsideGujaratCharge: 100,
        freeDeliveryThreshold: 0,
      };

      if (deliveryConfig.enabled !== false) {
        const freeThreshold = Number(deliveryConfig.freeDeliveryThreshold) || 0;
        if (freeThreshold > 0 && subtotal >= freeThreshold) {
          shipping = 0;
        } else {
          const gujaratFee = Number(deliveryConfig.gujaratCharge ?? 50);
          const outsideFee = Number(deliveryConfig.outsideGujaratCharge ?? 100);
          shipping = isGujarat ? gujaratFee : outsideFee;
        }
      } else {
        shipping = 0;
      }
    } else {
      // International Destination: Zone matching & default fallback
      const intlConfig = siteSettings?.internationalShipping || {
        enabled: true,
        defaultCharge: 2200,
        defaultFreeThreshold: 0,
        zones: [
          {
            id: 'middle-east',
            name: 'Middle East & Gulf',
            countries: ['United Arab Emirates', 'Saudi Arabia', 'Oman', 'Qatar', 'Kuwait', 'Bahrain'],
            deliveryCharge: 1200,
            freeDeliveryThreshold: 0,
            isActive: true,
          },
          {
            id: 'north-america',
            name: 'USA & Canada',
            countries: ['United States', 'Canada'],
            deliveryCharge: 1800,
            freeDeliveryThreshold: 0,
            isActive: true,
          },
          {
            id: 'europe-uk',
            name: 'UK & Europe',
            countries: ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Switzerland'],
            deliveryCharge: 1700,
            freeDeliveryThreshold: 0,
            isActive: true,
          },
          {
            id: 'australasia',
            name: 'Australia & New Zealand',
            countries: ['Australia', 'New Zealand', 'Singapore'],
            deliveryCharge: 1700,
            freeDeliveryThreshold: 0,
            isActive: true,
          },
        ],
      };
      if (intlConfig.enabled !== false) {
        const matchedZone = intlConfig.zones?.find((z: any) =>
          z.isActive !== false &&
          Array.isArray(z.countries) &&
          z.countries.some((c: string) => c.toLowerCase() === customerCountry.toLowerCase())
        );

        if (matchedZone) {
          const zoneFreeThreshold = Number(matchedZone.freeDeliveryThreshold) || 0;
          if (zoneFreeThreshold > 0 && subtotal >= zoneFreeThreshold) {
            shipping = 0;
          } else {
            shipping = Number(matchedZone.deliveryCharge ?? 1500);
          }
        } else {
          const defaultFree = Number(intlConfig.defaultFreeThreshold) || 0;
          if (defaultFree > 0 && subtotal >= defaultFree) {
            shipping = 0;
          } else {
            shipping = Number(intlConfig.defaultCharge ?? 2200);
          }
        }
      } else {
        shipping = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);

    const gstCalc = calculateGstInclusive({
      amount: total,
      state: isIndia ? (shippingAddress?.state || 'Gujarat') : 'Outside India',
      gstEnabled: isIndia && siteSettings?.gstEnabled !== false,
      igstRate: siteSettings?.igst ?? 18,
      cgstRate: siteSettings?.cgst ?? 9,
      sgstRate: siteSettings?.sgst ?? 9,
    });

    const tax = gstCalc.totalGst;
    const sgst = gstCalc.sgst;
    const cgst = gstCalc.cgst;

    const orderId = generateOrderNumber();

    // Payment Info
    const isOnline = paymentMethod === 'online';
    const payment = {
      method: isOnline ? ('online' as const) : ('cod' as const),
      status: 'pending' as const,
      transactionId: '',
      paidAt: undefined,
    };

    // Determine authoritative currency & exchange rate matching customer geography
    let resolvedCurrency = String(req.body.currency || '').trim().toUpperCase();
    let resolvedExchangeRate = Number(req.body.exchangeRate) || 0;

    const currencyConfigs = siteSettings?.currencies || [
      { code: 'INR', exchangeRate: 1 },
      { code: 'USD', exchangeRate: 85 },
      { code: 'EUR', exchangeRate: 92 },
      { code: 'GBP', exchangeRate: 110 },
      { code: 'AED', exchangeRate: 23 },
      { code: 'CAD', exchangeRate: 62 },
      { code: 'AUD', exchangeRate: 56 },
    ];

    if (!resolvedCurrency || (resolvedCurrency === 'INR' && !isIndia)) {
      const lowerCountry = customerCountry.toLowerCase();
      if (['united states', 'usa', 'us'].includes(lowerCountry)) {
        resolvedCurrency = 'USD';
      } else if (['united kingdom', 'uk', 'great britain'].includes(lowerCountry)) {
        resolvedCurrency = 'GBP';
      } else if (
        [
          'germany', 'france', 'italy', 'spain', 'netherlands', 'switzerland',
          'austria', 'belgium', 'ireland', 'sweden', 'norway', 'denmark',
          'portugal', 'greece', 'poland', 'finland', 'czech republic', 'hungary', 'romania'
        ].includes(lowerCountry)
      ) {
        resolvedCurrency = 'EUR';
      } else if (['united arab emirates', 'uae', 'dubai', 'saudi arabia', 'oman', 'qatar', 'kuwait', 'bahrain'].includes(lowerCountry)) {
        resolvedCurrency = 'AED';
      } else if (['canada'].includes(lowerCountry)) {
        resolvedCurrency = 'CAD';
      } else if (['australia', 'new zealand'].includes(lowerCountry)) {
        resolvedCurrency = 'AUD';
      } else if (!isIndia) {
        resolvedCurrency = 'USD';
      } else {
        resolvedCurrency = 'INR';
      }
    }

    if (resolvedExchangeRate <= 0 || (resolvedCurrency !== 'INR' && resolvedExchangeRate === 1)) {
      const matchedCurr = currencyConfigs.find((c: any) => c.code === resolvedCurrency);
      resolvedExchangeRate = matchedCurr?.exchangeRate && Number(matchedCurr.exchangeRate) > 0 ? Number(matchedCurr.exchangeRate) : 1;
    }

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
        country: customerCountry,
      },
      items: formattedItems,
      pricing: {
        subtotal,
        discount,
        shipping,
        tax,
        sgst,
        cgst,
        igst: gstCalc.igst,
        taxableAmount: gstCalc.taxableAmount,
        total,
      },
      couponCode: discount > 0 ? normalizedCoupon : '',
      payment,
      currency: resolvedCurrency,
      exchangeRate: resolvedExchangeRate,
      deliveryName: '',
      deliveryTrackId: '',
      orderStatus: 'pending',
      notes: (notes || '').trim(),
    });

    // Auto-sync customer phone & address to user profile
    if (req.user) {
      let shouldSaveUser = false;
      if (!req.user.phone && customer.phone) {
        req.user.phone = customer.phone.trim();
        shouldSaveUser = true;
      }
      if (!req.user.address && shippingAddress.address) {
        req.user.address = shippingAddress.address.trim();
        req.user.city = shippingAddress.city.trim();
        req.user.state = shippingAddress.state.trim();
        req.user.pincode = shippingAddress.pincode.trim();
        shouldSaveUser = true;
      }
      if (shouldSaveUser) {
        await req.user.save().catch(() => {});
      }
    }

    // Handle Razorpay Order Generation for Online Payment
    let razorpayData = null;
    if (isOnline) {
      const config = getRazorpayConfig();
      if (config.isConfigured) {
        try {
          const razorpay = getRazorpayInstance();
          const rzpOrder = await razorpay.orders.create({
            amount: Math.round(total * 100),
            currency: 'INR',
            receipt: `rcpt_${orderId}`.slice(0, 40),
            notes: {
              orderId,
              customerName: customer.fullName.trim(),
            },
          });

          newOrder.payment.razorpayOrderId = rzpOrder.id;
          await newOrder.save();

          razorpayData = {
            id: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            keyId: config.keyId,
          };
        } catch (rzpErr: any) {
          console.warn('Razorpay order creation warning:', rzpErr.message || rzpErr);
        }
      }
    }

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

    // For COD orders, dispatch order confirmation invoice email immediately
    if (!isOnline) {
      sendOrderInvoiceEmail(newOrder).catch((e) =>
        console.error('[Order Invoice Email COD Error]', e?.message || e)
      );
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      data: newOrder,
      razorpay: razorpayData,
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
    }).lean();

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
      const s = String(status).toLowerCase();
      if (s === 'pending' || s === '0' || s === 'placed') {
        filter.orderStatus = { $in: ['pending', 'placed', '0'] };
      } else if (s === 'accepted' || s === '1' || s === 'confirmed') {
        filter.orderStatus = { $in: ['accepted', 'confirmed', '1'] };
      } else if (s === 'dispatched' || s === '2' || s === 'shipped' || s === 'processing') {
        filter.orderStatus = { $in: ['dispatched', 'shipped', 'processing', '2'] };
      } else if (s === 'in_transit' || s === 'transit') {
        filter.orderStatus = { $in: ['in_transit', 'transit'] };
      } else if (s === 'returned_by_customer' || s === '3') {
        filter.orderStatus = { $in: ['returned_by_customer', '3'] };
      } else if (s === 'cancelled_by_seller' || s === '4' || s === 'cancelled') {
        filter.orderStatus = { $in: ['cancelled_by_seller', 'cancelled', '4'] };
      } else if (s === 'return_received' || s === '5') {
        filter.orderStatus = { $in: ['return_received', '5'] };
      } else if (s === 'delivered') {
        filter.orderStatus = 'delivered';
      } else {
        filter.orderStatus = status;
      }
    }

    if (search) {
      const searchStr = String(search).trim();
      const isDigitsOnly = /^[0-9+]{6,15}$/.test(searchStr);
      const isOrderId = /^LH/i.test(searchStr);

      if (isOrderId) {
        // Fast index-backed Order ID lookup
        filter.orderId = { $regex: `^${searchStr}`, $options: 'i' };
      } else if (isDigitsOnly) {
        // Fast index-backed Phone number / Tracking ID lookup
        filter.$or = [
          { 'customer.phone': { $regex: searchStr } },
          { deliveryTrackId: { $regex: `^${searchStr}`, $options: 'i' } },
        ];
      } else {
        const searchRegex = { $regex: searchStr, $options: 'i' };
        filter.$or = [
          { orderId: searchRegex },
          { deliveryTrackId: searchRegex },
          { deliveryName: searchRegex },
          { 'customer.fullName': searchRegex },
          { 'customer.email': searchRegex },
          { 'customer.phone': searchRegex },
          { 'shippingAddress.city': searchRegex },
        ];
      }
    }

    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.max(1, parseInt(String(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount, statsAgg] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(filter),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$pricing.total' },
            totalOrders: { $sum: 1 },
            pendingOrders: {
              $sum: {
                $cond: [{ $in: ['$orderStatus', ['pending', 'placed', '0', 'processing']] }, 1, 0],
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

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      data: orders,
      stats,
      pagination: {
        totalOrders: totalCount,
        currentPage: pageNum,
        totalPages,
        limit: limitNum,
        hasMore: pageNum < totalPages,
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
 * @desc Update Order Status, Delivery Courier & Tracking Info
 * @route PATCH /api/v1/orders/:id/status
 * @access Private (Admin only)
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, deliveryName, deliveryTrackId } = req.body;

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

    if (deliveryName !== undefined) {
      order.deliveryName = String(deliveryName).trim();
    }

    if (deliveryTrackId !== undefined) {
      order.deliveryTrackId = String(deliveryTrackId).trim();
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
      message: `Order ${order.orderId} updated successfully`,
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
 * @desc Track Order by Order ID (Public Customer Tracking Portal)
 * @route GET /api/v1/orders/track/:orderId
 * @access Public
 */
export const trackOrderByNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required',
      });
      return;
    }

    const cleanId = String(orderId).trim();
    const order = await Order.findOne({
      $or: [
        { orderId: cleanId },
        { orderId: new RegExp(`^${cleanId}$`, 'i') },
        { deliveryTrackId: cleanId },
        { deliveryTrackId: new RegExp(`^${cleanId}$`, 'i') },
        { _id: cleanId.match(/^[0-9a-fA-F]{24}$/) ? cleanId : null },
      ],
    }).lean();

    if (!order) {
      res.status(404).json({
        success: false,
        message: `No order found for ID "${cleanId}". Please check your order confirmation details.`,
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
      message: 'Failed to track order',
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

    const userObjectId = req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';

    // Strict Industry Standard Identity-Bound Ownership:
    // 1. Fetch orders placed directly by this authenticated account session (user === userObjectId)
    // 2. Or unassigned legacy orders (where user is null/undefined) matching this user's verified registered email
    // 3. NEVER match orders that belong to another distinct user account, even if contact details match
    const queryFilter: any = {
      $or: [
        { user: userObjectId },
        ...(userEmail
          ? [
              {
                user: { $in: [null, undefined] },
                'customer.email': userEmail,
              },
            ]
          : []),
      ],
    };

    const orders = await Order.find(queryFilter).sort({ createdAt: -1 }).lean();

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
