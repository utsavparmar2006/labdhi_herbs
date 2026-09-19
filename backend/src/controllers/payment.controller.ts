import { Request, Response } from 'express';
import { Order } from '../models/Order.model.js';
import {
  getRazorpayConfig,
  getRazorpayInstance,
  verifyRazorpaySignature,
} from '../config/razorpay.js';

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
        await Order.findOneAndUpdate(
          {
            $or: [
              { orderId: orderId },
              { _id: orderId.match(/^[0-9a-fA-F]{24}$/) ? orderId : null },
            ],
          },
          {
            'payment.status': 'failed',
            'payment.transactionId': razorpayPaymentId,
            'payment.razorpayOrderId': razorpayOrderId,
            'payment.razorpayPaymentId': razorpayPaymentId,
            'payment.razorpaySignature': razorpaySignature,
          }
        );
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
