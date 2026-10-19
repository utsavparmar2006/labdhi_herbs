import { Request, Response } from 'express';
import { Cart, ICartItem } from '../models/Cart.model.js';
import { Product } from '../models/Product.model.js';
import { sendEmail } from '../utils/mailer.js';
import { taskQueue } from '../utils/taskQueue.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

/**
 * @desc Sync Cart state from client (debounced on cart modifications or checkout step)
 * @route POST /api/v1/cart/sync
 * @access Public (Accepts optional auth)
 */
export const syncCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { guestId, items = [], customer, status } = req.body;
    const userId = req.user?._id;

    if (!guestId && !userId) {
      res.status(400).json({ success: false, message: 'guestId or authentication required' });
      return;
    }

    // Authoritative price calculation
    const formattedItems: ICartItem[] = (items || []).map((item: any) => {
      const unitPrice = Number(item.product?.price || item.price || 0);
      const qty = Math.max(1, Number(item.quantity || 1));
      return {
        product: {
          id: String(item.product?.id || item.productId || item.id || ''),
          name: String(item.product?.name || item.name || 'Herbal Product'),
          price: unitPrice,
          image: String(item.product?.image || item.image || ''),
          category: String(item.product?.category || item.category || 'Herbal Care'),
        },
        quantity: qty,
        price: unitPrice,
        total: unitPrice * qty,
      };
    });

    const subtotal = formattedItems.reduce((acc, curr) => acc + curr.total, 0);

    const query: any = {};
    if (userId) {
      query.$or = [{ user: userId }, ...(guestId ? [{ guestId }] : [])];
    } else {
      query.guestId = guestId;
    }

    // Only update if not already converted
    query.status = { $ne: 'converted' };

    let cart = await Cart.findOne(query);

    if (!cart) {
      cart = new Cart({
        user: userId || undefined,
        guestId: guestId || undefined,
        items: formattedItems,
        subtotal,
        customer: {
          fullName: customer?.fullName?.trim() || '',
          email: customer?.email?.trim().toLowerCase() || '',
          phone: customer?.phone?.trim() || '',
        },
        status: status === 'converted' ? 'converted' : 'active',
        lastActivityAt: new Date(),
      });
    } else {
      if (userId && !cart.user) {
        cart.user = userId;
      }
      cart.items = formattedItems;
      cart.subtotal = subtotal;
      if (customer?.fullName) cart.customer = { ...cart.customer, fullName: customer.fullName.trim() };
      if (customer?.email) cart.customer = { ...cart.customer, email: customer.email.trim().toLowerCase() };
      if (customer?.phone) cart.customer = { ...cart.customer, phone: customer.phone.trim() };

      if (status === 'converted') {
        cart.status = 'converted';
      } else if (cart.status !== 'converted') {
        cart.status = 'active';
      }

      cart.lastActivityAt = new Date();
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart synchronized successfully',
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to synchronize cart',
      error: error.message,
    });
  }
};

/**
 * @desc Get Active Cart
 * @route GET /api/v1/cart
 * @access Public (Accepts optional auth)
 */
export const getActiveCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const guestId = req.query.guestId as string;
    const userId = req.user?._id;

    if (!guestId && !userId) {
      res.status(200).json({ success: true, data: null });
      return;
    }

    const query: any = { status: 'active' };
    if (userId) {
      query.$or = [{ user: userId }, ...(guestId ? [{ guestId }] : [])];
    } else {
      query.guestId = guestId;
    }

    const cart = await Cart.findOne(query).sort({ updatedAt: -1 }).lean();

    res.status(200).json({
      success: true,
      data: cart || null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve cart',
      error: error.message,
    });
  }
};

/**
 * @desc Get Abandoned Carts with Analytics
 * @route GET /api/v1/cart/abandoned
 * @access Admin only
 */
export const getAbandonedCarts = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Threshold: Carts inactive for > 30 minutes are considered abandoned
    const abandonedThreshold = new Date(Date.now() - 30 * 60 * 1000);

    // Auto-advance active carts older than 30 mins with items to 'abandoned'
    await Cart.updateMany(
      {
        status: 'active',
        lastActivityAt: { $lt: abandonedThreshold },
        'items.0': { $exists: true },
      },
      {
        $set: {
          status: 'abandoned',
          abandonedAt: new Date(),
        },
      }
    );

    const [abandonedCarts, totalAbandonedCount, totalLostRevenue, totalRecoveredCount] =
      await Promise.all([
        Cart.find({ status: 'abandoned' })
          .sort({ lastActivityAt: -1 })
          .limit(100)
          .lean(),
        Cart.countDocuments({ status: 'abandoned' }),
        Cart.aggregate([
          { $match: { status: 'abandoned' } },
          { $group: { _id: null, total: { $sum: '$subtotal' } } },
        ]),
        Cart.countDocuments({ status: 'converted', recoveryRemindersCount: { $gt: 0 } }),
      ]);

    const lostRevenue = totalLostRevenue[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        carts: abandonedCarts,
        stats: {
          totalAbandoned: totalAbandonedCount,
          lostRevenue,
          totalRecovered: totalRecoveredCount,
          recoveryRate:
            totalAbandonedCount > 0
              ? Math.round((totalRecoveredCount / (totalAbandonedCount + totalRecoveredCount)) * 100)
              : 0,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load abandoned carts',
      error: error.message,
    });
  }
};

/**
 * @desc Trigger Abandoned Cart Recovery Reminder Email
 * @route POST /api/v1/cart/abandoned/:id/remind
 * @access Admin only
 */
export const sendCartRecoveryReminder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { discountCode = 'HERBAL10', customMessage = '' } = req.body;

    const cart = await Cart.findById(id);

    if (!cart) {
      res.status(404).json({ success: false, message: 'Cart record not found' });
      return;
    }

    const customerEmail = cart.customer?.email;
    const customerName = cart.customer?.fullName || 'Valued Customer';

    if (!customerEmail) {
      res.status(400).json({
        success: false,
        message: 'No email address registered with this abandoned cart',
      });
      return;
    }

    // Items list HTML
    const itemsHtml = cart.items
      .map(
        (item) => `
      <tr style="border-bottom: 1px solid #efe9dd;">
        <td style="padding: 10px 0; font-weight: 500; color: #2C2A29;">${item.product.name} (x${item.quantity})</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #3A4D39;">₹${item.total}</td>
      </tr>
    `
      )
      .join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #EFE9DD; border-radius: 8px; overflow: hidden;">
        <div style="background: #3A4D39; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Labdhi Herbs</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Pure Ayurvedic Wellness</p>
        </div>
        <div style="padding: 30px; color: #2C2A29;">
          <h2 style="color: #3A4D39; margin-top: 0;">Namaste ${customerName}, did you forget something?</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #555;">
            We noticed you left some pure, natural Ayurvedic formulations in your shopping cart.
            ${customMessage ? `<br/><br/><em>"${customMessage}"</em>` : ''}
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 2px solid #3A4D39; color: #3A4D39; font-size: 13px; text-transform: uppercase;">
                <th style="padding: 8px 0; text-align: left;">Formulation</th>
                <th style="padding: 8px 0; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; font-size: 16px;">Cart Subtotal:</td>
                <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 16px; color: #3A4D39;">₹${cart.subtotal}</td>
              </tr>
            </tfoot>
          </table>

          <div style="background: #F8F6F0; border: 1px dashed #3A4D39; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #555;">Use special recovery coupon at checkout:</p>
            <span style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #3A4D39; background: #ffffff; padding: 6px 16px; border-radius: 4px; border: 1px solid #3A4D39; display: inline-block;">${discountCode}</span>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://labdhiherbs.com/checkout" style="background: #3A4D39; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
              Complete Your Order Now
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 13px; color: #888; text-align: center;">
            Need help? Reply directly to this email or WhatsApp us at +91 97277 88880.
          </p>
        </div>
      </div>
    `;

    // Enqueue email via task queue so HTTP request completes instantly
    taskQueue.enqueue('CUSTOM_ASYNC_TASK', {
      handler: async () => {
        await sendEmail({
          to: customerEmail,
          subject: `${customerName}, your herbal cart is waiting (+ Special Discount inside!)`,
          html: htmlContent,
        });
      },
    });

    cart.recoveryRemindersCount = (cart.recoveryRemindersCount || 0) + 1;
    cart.lastReminderSentAt = new Date();
    cart.recoveryCoupon = discountCode;
    await cart.save();

    res.status(200).json({
      success: true,
      message: `Recovery reminder dispatched to ${customerEmail}`,
      data: cart,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to send recovery reminder',
      error: error.message,
    });
  }
};
