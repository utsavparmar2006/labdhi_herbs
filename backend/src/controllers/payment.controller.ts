import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import { Product } from '../models/Product.model.js';
import {
  getRazorpayConfig,
  getRazorpayInstance,
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from '../config/razorpay.js';
import { taskQueue } from '../utils/taskQueue.js';
import { cache } from '../utils/cache.js';

/**
 * @desc Get Public Razorpay Key ID & Status
 * @route GET /api/v1/payment/razorpay/key
 * @access Public
 */
export const getRazorpayKey = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = getRazorpayConfig();
    res.status(200).json({
      success: true,
      keyId: config.keyId,
      isConfigured: config.isConfigured,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment configuration',
      error: error.message,
    });
  }
};

/**
 * @desc Create Razorpay Order
 * @route POST /api/v1/payment/razorpay/create-order
 * @access Public
 */
export const createRazorpayOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, currency = 'INR', receipt, orderId } = req.body;
    const config = getRazorpayConfig();

    if (!config.isConfigured) {
      res.status(503).json({
        success: false,
        message:
          'Razorpay payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env',
      });
      return;
    }

    let payableAmount = Number(amount);
    let orderDoc: any = null;

    if (orderId) {
      orderDoc = await Order.findOne({
        $or: [
          { orderId: orderId },
          { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
        ],
      });

      if (orderDoc) {
        payableAmount = Number(orderDoc.pricing?.total || payableAmount);
      }
    }

    if (!payableAmount || payableAmount <= 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid payable amount for order creation',
      });
      return;
    }

    const amountInPaise = Math.round(payableAmount * 100);
    const receiptId = receipt || (orderDoc ? `rcpt_${orderDoc.orderId}` : `rcpt_${Date.now()}`);

    const razorpay = getRazorpayInstance();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency.toUpperCase(),
      receipt: receiptId.slice(0, 40),
      notes: {
        orderId: orderDoc ? orderDoc.orderId : '',
        customerName: orderDoc?.customer?.fullName || '',
      },
    });

    if (orderDoc) {
      orderDoc.payment.razorpayOrderId = razorpayOrder.id;
      await orderDoc.save();
    }

    res.status(200).json({
      success: true,
      data: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        keyId: config.keyId,
      },
    });
  } catch (error: any) {
    const errorDetails =
      error?.error?.description ||
      error?.message ||
      (typeof error === 'string' ? error : JSON.stringify(error));

    res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay payment order',
      error: errorDetails,
    });
  }
};

/**
 * @desc Verify Razorpay Payment Signature
 * @route POST /api/v1/payment/razorpay/verify
 * @access Public
 */
export const verifyRazorpayPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      res.status(400).json({
        success: false,
        message: 'Missing required Razorpay payment verification parameters',
      });
      return;
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      if (orderId) {
        const failedOrder = await Order.findOneAndUpdate(
          {
            $or: [
              { orderId: orderId },
              { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
            ],
            'payment.status': { $ne: 'completed' },
          },
          {
            'payment.status': 'failed',
            'payment.transactionId': razorpayPaymentId,
            'payment.razorpayOrderId': razorpayOrderId,
            'payment.razorpayPaymentId': razorpayPaymentId,
            'payment.razorpaySignature': razorpaySignature,
          },
          { new: true }
        );

        // Auto-restore inventory so stock is never artificially locked
        if (failedOrder && Array.isArray(failedOrder.items)) {
          for (const item of failedOrder.items) {
            const slugKey = String(item.product?.id || '').trim().toLowerCase();
            if (slugKey) {
              await Product.findOneAndUpdate(
                { $or: [{ id: slugKey }, { name: item.product?.name }] },
                { $inc: { stockQuantity: item.quantity }, $set: { inStock: true } }
              );
            }
          }
          await cache.delByPattern('products:*');
        }
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid digital signature',
      });
      return;
    }

    // Update order upon verified payment
    let updatedOrder = null;
    if (orderId) {
      updatedOrder = await Order.findOneAndUpdate(
        {
          $or: [
            { orderId: orderId },
            { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
          ],
        },
        {
          'payment.method': 'online',
          'payment.status': 'completed',
          'payment.transactionId': razorpayPaymentId,
          'payment.razorpayOrderId': razorpayOrderId,
          'payment.razorpayPaymentId': razorpayPaymentId,
          'payment.razorpaySignature': razorpaySignature,
          'payment.paidAt': new Date(),
          orderStatus: 'accepted', // Automatically advance to accepted when paid
        },
        { new: true }
      );

      // Enqueue order confirmation invoice email in background worker
      if (updatedOrder) {
        taskQueue.enqueue('EMAIL_ORDER_INVOICE', updatedOrder);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Razorpay payment verified and captured successfully',
      data: updatedOrder,
      payment: {
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId,
        status: 'completed',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify Razorpay payment',
      error: error.message,
    });
  }
};

/**
 * @desc Razorpay Webhook Handler (Authoritative Server-to-Server Payment Reconciliation)
 * @route POST /api/v1/payment/razorpay/webhook
 * @access Public (Guarded with HMAC-SHA256 signature verification)
 */
export const handleRazorpayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';

    if (!signature) {
      console.warn('[Razorpay Webhook] Rejected: Missing x-razorpay-signature header from IP:', req.ip);
      res.status(400).json({ success: false, message: 'Missing webhook signature header' });
      return;
    }

    // Verify digital signature against raw body buffer or JSON payload
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.warn('[Razorpay Webhook] Security Alert: Invalid webhook signature detected from IP:', req.ip);
      res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      return;
    }

    const { event, payload } = req.body;
    console.log(`[Razorpay Webhook] Validated event received: "${event}"`);

    // 1. Payment Success Events: payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayPaymentId = paymentEntity?.id;
      const razorpayOrderId = paymentEntity?.order_id;
      const internalOrderId = paymentEntity?.notes?.orderId;

      if (!razorpayOrderId && !internalOrderId) {
        console.warn('[Razorpay Webhook] No order identifiers present in event payload');
        res.status(200).json({ success: true, message: 'No matching order identifier found' });
        return;
      }

      // Locate corresponding order in MongoDB
      const order = await Order.findOne({
        $or: [
          ...(internalOrderId ? [{ orderId: internalOrderId }] : []),
          ...(razorpayOrderId ? [{ 'payment.razorpayOrderId': razorpayOrderId }] : []),
        ],
      });

      if (!order) {
        console.warn(`[Razorpay Webhook] Order not found for Razorpay Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId}`);
        res.status(200).json({ success: true, message: 'Order not found in database' });
        return;
      }

      // Idempotency: If already completed, skip duplicate work & prevent duplicate emails
      if (order.payment?.status === 'completed') {
        console.log(`[Razorpay Webhook] Order #${order.orderId} already completed. Duplicate webhook skipped.`);
        res.status(200).json({ success: true, message: 'Order already completed' });
        return;
      }

      // Mark order as paid & advance to accepted status
      order.payment = {
        ...order.payment,
        method: 'online',
        status: 'completed',
        transactionId: razorpayPaymentId,
        razorpayPaymentId: razorpayPaymentId,
        razorpayOrderId: razorpayOrderId || order.payment?.razorpayOrderId,
        paidAt: paymentEntity?.created_at ? new Date(paymentEntity.created_at * 1000) : new Date(),
      };
      order.orderStatus = 'accepted';
      await order.save();

      console.log(`[Razorpay Webhook] ✓ Successfully confirmed Order #${order.orderId} via server-to-server webhook.`);

      // Auto-dispatch confirmation invoice email to customer and admin via background worker
      taskQueue.enqueue('EMAIL_ORDER_INVOICE', order);

      res.status(200).json({ success: true, message: 'Order confirmed successfully via webhook' });
      return;
    }

    // 2. Payment Failure Event: payment.failed
    if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const internalOrderId = paymentEntity?.notes?.orderId;

      const order = await Order.findOne({
        $or: [
          ...(internalOrderId ? [{ orderId: internalOrderId }] : []),
          ...(razorpayOrderId ? [{ 'payment.razorpayOrderId': razorpayOrderId }] : []),
        ],
      });

      if (order && order.payment?.status !== 'completed') {
        order.payment.status = 'failed';
        order.payment.transactionId = paymentEntity?.id || '';
        await order.save();

        // Restore inventory if stock was locked on order creation
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            const slugKey = String(item.product?.id || '').trim().toLowerCase();
            if (slugKey) {
              await Product.findOneAndUpdate(
                { $or: [{ id: slugKey }, { name: item.product?.name }] },
                { $inc: { stockQuantity: item.quantity }, $set: { inStock: true } }
              );
            }
          }
          await cache.delByPattern('products:*');
        }
        console.log(`[Razorpay Webhook] Recorded payment failure and restocked items for Order #${order.orderId}`);
      }

      res.status(200).json({ success: true, message: 'Payment failure recorded' });
      return;
    }

    // Acknowledge other event types (e.g. refund.created, refund.processed)
    res.status(200).json({ success: true, message: `Event ${event} acknowledged` });
  } catch (error: any) {
    console.error('[Razorpay Webhook Handler Error]', error);
    res.status(500).json({ success: false, message: 'Webhook processing error', error: error.message });
  }
};

/**
 * @desc 1-Click Automated Razorpay Refund for Online Orders
 * @route POST /api/v1/payment/razorpay/refund
 * @access Private (Admin only)
 */
export const createRazorpayRefund = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId, amount, reason = 'Customer Cancellation / Admin Approved Refund', restoreStock = true } = req.body;

    if (!orderId) {
      res.status(400).json({
        success: false,
        message: 'Order ID is required to process refund',
      });
      return;
    }

    const order = await Order.findOne({
      $or: [
        { orderId },
        { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
      ],
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    // Validation: Only completed online orders can be refunded via Razorpay
    if (order.payment?.method !== 'online') {
      res.status(400).json({
        success: false,
        message: 'Only online prepaid orders can be refunded via Razorpay gateway.',
      });
      return;
    }

    if (order.payment?.status !== 'completed') {
      res.status(400).json({
        success: false,
        message: `Order payment status is "${order.payment?.status}". Only completed payments can be refunded.`,
      });
      return;
    }

    const paymentId = order.payment?.razorpayPaymentId || order.payment?.transactionId;
    if (!paymentId) {
      res.status(400).json({
        success: false,
        message: 'Missing Razorpay Payment ID on this order record.',
      });
      return;
    }

    // Determine refundable amount (in rupees and paise)
    const orderTotal = Number(order.pricing?.total || 0);
    const refundRupees = Number(amount) > 0 ? Number(amount) : orderTotal;
    const amountInPaise = Math.round(refundRupees * 100);

    const config = getRazorpayConfig();
    if (!config.isConfigured) {
      res.status(503).json({
        success: false,
        message: 'Razorpay keys not configured on server.',
      });
      return;
    }

    const razorpay = getRazorpayInstance();

    // Call Razorpay Refund API
    const refundResponse: any = await (razorpay.payments as any).refund(paymentId, {
      amount: amountInPaise,
      notes: {
        orderId: order.orderId,
        reason: String(reason).slice(0, 250),
      },
    });

    // Update Order payment and status
    order.payment.status = 'refunded';
    order.payment.refundId = refundResponse.id;
    order.payment.refundAmount = refundRupees;
    order.payment.refundedAt = new Date();
    order.payment.refundReason = reason;

    if (!['cancelled_by_seller', 'returned_by_customer', 'return_received'].includes(order.orderStatus)) {
      order.orderStatus = 'cancelled_by_seller';
    }

    await order.save();

    // Restore stock if requested
    if (restoreStock && Array.isArray(order.items)) {
      for (const item of order.items) {
        const slugKey = String(item.product?.id || '').trim().toLowerCase();
        if (slugKey) {
          await Product.findOneAndUpdate(
            { $or: [{ id: slugKey }, { name: item.product?.name }] },
            { $inc: { stockQuantity: item.quantity }, $set: { inStock: true } }
          );
        }
      }
      await cache.delByPattern('products:*');
    }

    console.log(`[Razorpay Refund] ✓ Successfully issued refund ${refundResponse.id} for Order #${order.orderId} (₹${refundRupees})`);

    res.status(200).json({
      success: true,
      message: `Successfully processed refund of ₹${refundRupees} via Razorpay (Refund ID: ${refundResponse.id})`,
      data: {
        refundId: refundResponse.id,
        amount: refundRupees,
        paymentId,
        order,
      },
    });
  } catch (error: any) {
    console.error('[Razorpay Refund Error]', error);
    const errorMessage =
      error?.error?.description ||
      error?.message ||
      (typeof error === 'string' ? error : 'Failed to process Razorpay refund');

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error?.message || errorMessage,
    });
  }
};

