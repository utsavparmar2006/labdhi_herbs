/**
 * Labdhi Herbs - Order Invoice & Inclusive GST Calculation Engine
 */

import { sendEmail } from './mailer.js';
import SiteSettings from '../models/SiteSettings.model.js';

export interface GstCalculationResult {
  isGujarat: boolean;
  gstRate: number;
  taxableAmount: number;
  totalGst: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

/**
 * Calculates backward inclusive GST from total MRP/selling price.
 * Product prices on the site are already inclusive of GST.
 */
export function calculateGstInclusive(params: {
  amount: number;
  state?: string;
  gstEnabled?: boolean;
  igstRate?: number;
  cgstRate?: number;
  sgstRate?: number;
}): GstCalculationResult {
  const {
    amount = 0,
    state = 'Gujarat',
    gstEnabled = true,
    igstRate = 18,
    cgstRate = 9,
    sgstRate = 9,
  } = params;

  if (!gstEnabled || amount <= 0) {
    return {
      isGujarat: true,
      gstRate: 0,
      taxableAmount: amount,
      totalGst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalAmount: amount,
    };
  }

  const isGujarat = /gujarat/i.test(state.trim());
  const effectiveGstRate = isGujarat ? Number(cgstRate) + Number(sgstRate) : Number(igstRate);

  // Backward formula: Taxable = Gross / (1 + Rate / 100)
  const taxableAmount = Math.round((amount / (1 + effectiveGstRate / 100)) * 100) / 100;
  const totalGst = Math.round((amount - taxableAmount) * 100) / 100;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isGujarat) {
    cgst = Math.round((totalGst / 2) * 100) / 100;
    sgst = Math.round((totalGst - cgst) * 100) / 100; // avoid floating penny discrepancies
    igst = 0;
  } else {
    igst = totalGst;
    cgst = 0;
    sgst = 0;
  }

  return {
    isGujarat,
    gstRate: effectiveGstRate,
    taxableAmount,
    totalGst,
    cgst,
    sgst,
    igst,
    totalAmount: amount,
  };
}

/**
 * Generates responsive, premium HTML email bill for order confirmation
 */
export function generateOrderInvoiceHtml(params: {
  order: any;
  siteSettings?: any;
}): string {
  const { order, siteSettings } = params;

  const orderId = order.orderId || 'ORD-00000';
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const customerName = order.customer?.fullName || order.shippingAddress?.fullName || 'Valued Patron';
  const customerEmail = order.customer?.email || '';
  const customerPhone = order.customer?.phone || order.shippingAddress?.phone || '';

  const address = order.shippingAddress || {};
  const formattedAddress = [
    address.address,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const paymentMethodLabel =
    order.payment?.status === 'completed'
      ? 'Paid Online (Razorpay)'
      : order.payment?.method === 'online'
      ? 'Online Payment'
      : 'Cash on Delivery (COD)';

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.pricing?.subtotal || 0);
  const discount = Number(order.pricing?.discount || 0);
  const total = Number(order.pricing?.total || 0);

  // Inclusive GST calculation
  const gstBreakdown = calculateGstInclusive({
    amount: total,
    state: address.state || 'Gujarat',
    gstEnabled: siteSettings?.gstEnabled !== false,
    igstRate: siteSettings?.igst ?? 18,
    cgstRate: siteSettings?.cgst ?? 9,
    sgstRate: siteSettings?.sgst ?? 9,
  });

  const supportPhone = siteSettings?.supportPhone || siteSettings?.profile?.adminPhone || '+91 93283 49328';
  const supportEmail = siteSettings?.supportEmail || siteSettings?.profile?.adminEmail || 'support@labdhiherbs.com';
  const storeAddress = siteSettings?.address || siteSettings?.profile?.address || '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009';

  const rowsHtml = items
    .map((item: any, idx: number) => {
      const name = item.product?.name || item.name || 'Herbal Product';
      const qty = item.quantity || 1;
      const unitPrice = item.price || 0;
      const lineTotal = item.total || unitPrice * qty;

      return `
        <tr style="border-bottom: 1px solid #EFE9DD;">
          <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: center;">${idx + 1}</td>
          <td style="padding: 12px 10px; font-size: 13px; color: #1e293b;">
            <strong style="color: #14261E; display: block; font-size: 13px;">${name}</strong>
            <span style="font-size: 11px; color: #B58A5A;">100% Pure Botanical Extract</span>
          </td>
          <td style="padding: 12px 10px; font-size: 13px; color: #1e293b; text-align: center; font-weight: 600;">${qty}</td>
          <td style="padding: 12px 10px; font-size: 13px; color: #64748b; text-align: right;">₹${unitPrice.toFixed(2)}</td>
          <td style="padding: 12px 10px; font-size: 13px; color: #14261E; font-weight: bold; text-align: right;">₹${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation & Invoice - ${orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F1EA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1A201C; line-height: 1.5;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F1EA; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #EFE9DD;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #14261E; padding: 32px 28px; text-align: center;">
              <div style="font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #ffffff; letter-spacing: 0.5px;">
                Labdhi Herbs
              </div>
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #D4A373; margin-top: 4px; font-weight: 600;">
                Pure Gujarati Ayurvedic Formulations
              </div>
              <div style="display: inline-block; margin-top: 18px; padding: 6px 16px; background-color: rgba(212, 163, 115, 0.15); border: 1px solid #D4A373; border-radius: 20px; color: #ffffff; font-size: 12px; font-weight: 600;">
                ✓ Order Confirmed • Tax Invoice
              </div>
            </td>
          </tr>

          <!-- Greeting & Order Overview -->
          <tr>
            <td style="padding: 28px 28px 16px 28px;">
              <h2 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 20px; color: #14261E;">
                Namaste ${customerName} ji,
              </h2>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #475569; line-height: 1.6;">
                Thank you for choosing <strong>Labdhi Herbs</strong>. Your order has been placed successfully and is being prepared with pure botanical extracts at our Surat workshop.
              </p>

              <!-- Order Summary Meta Grid -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8F6F0; border-radius: 12px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid #EFE9DD;">
                <tr>
                  <td width="50%" style="font-size: 12px; color: #64748b; padding-bottom: 6px;">
                    Order Number: <strong style="color: #14261E; font-family: monospace; font-size: 13px;">#${orderId}</strong>
                  </td>
                  <td width="50%" style="font-size: 12px; color: #64748b; text-align: right; padding-bottom: 6px;">
                    Order Date: <strong style="color: #14261E;">${orderDate}</strong>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="font-size: 12px; color: #64748b;">
                    Payment Mode: <strong style="color: #14261E;">${paymentMethodLabel}</strong>
                  </td>
                  <td width="50%" style="font-size: 12px; color: #64748b; text-align: right;">
                    Delivery: <strong style="color: #15803d;">Free Express Shipping</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Address Section (Seller & Buyer) -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Billed From -->
                  <td width="48%" valign="top" style="background-color: #FAFAF7; border: 1px solid #EFE9DD; border-radius: 10px; padding: 14px;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 6px;">
                      Billed From (Seller)
                    </div>
                    <div style="font-size: 13px; font-weight: bold; color: #14261E;">Labdhi Herbs</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5; margin-top: 3px;">
                      ${storeAddress}<br>
                      Phone: ${supportPhone}<br>
                      Email: ${supportEmail}
                    </div>
                  </td>
                  <td width="4%"></td>
                  <!-- Shipped & Billed To -->
                  <td width="48%" valign="top" style="background-color: #FAFAF7; border: 1px solid #EFE9DD; border-radius: 10px; padding: 14px;">
                    <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 6px;">
                      Shipped &amp; Billed To
                    </div>
                    <div style="font-size: 13px; font-weight: bold; color: #14261E;">${customerName}</div>
                    <div style="font-size: 11px; color: #64748b; line-height: 1.5; margin-top: 3px;">
                      ${formattedAddress}<br>
                      Phone: ${customerPhone}<br>
                      Email: ${customerEmail}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Order Items Table -->
          <tr>
            <td style="padding: 0 28px 20px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: 1px solid #EFE9DD; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #14261E; color: #ffffff;">
                    <th style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; width: 30px; text-align: center;">#</th>
                    <th style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left;">Product</th>
                    <th style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; width: 50px;">Qty</th>
                    <th style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; width: 75px;">Rate (₹)</th>
                    <th style="padding: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; width: 85px;">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Price & Inclusive GST Breakdown -->
          <tr>
            <td style="padding: 0 28px 28px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="45%" valign="top" style="font-size: 11px; color: #64748b; line-height: 1.5;">
                    <strong style="color: #14261E; display: block; margin-bottom: 4px;">Important Note on GST:</strong>
                    All product prices shown above are <strong>inclusive of GST</strong>. The tax breakdown below specifies the exact taxable value and taxes calculated according to statutory Indian GST norms.
                  </td>
                  <td width="10%"></td>
                  <td width="45%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px;">
                      <tr>
                        <td style="padding: 4px 0; color: #64748b;">Items Total (MRP incl.):</td>
                        <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #1e293b;">₹${subtotal.toFixed(2)}</td>
                      </tr>
                      ${
                        discount > 0
                          ? `
                        <tr>
                          <td style="padding: 4px 0; color: #15803d; font-weight: 600;">Coupon Discount:</td>
                          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: #15803d;">- ₹${discount.toFixed(2)}</td>
                        </tr>
                      `
                          : ''
                      }
                      <tr style="border-top: 1px dashed #EFE9DD;">
                        <td style="padding: 6px 0 4px 0; color: #64748b;">Taxable Base Value:</td>
                        <td style="padding: 6px 0 4px 0; text-align: right; color: #475569;">₹${gstBreakdown.taxableAmount.toFixed(2)}</td>
                      </tr>
                      ${
                        gstBreakdown.isGujarat
                          ? `
                        <tr>
                          <td style="padding: 3px 0; color: #64748b;">CGST (${((siteSettings?.cgst ?? 9)).toFixed(1)}%):</td>
                          <td style="padding: 3px 0; text-align: right; color: #475569;">₹${gstBreakdown.cgst.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 3px 0; color: #64748b;">SGST (${((siteSettings?.sgst ?? 9)).toFixed(1)}%):</td>
                          <td style="padding: 3px 0; text-align: right; color: #475569;">₹${gstBreakdown.sgst.toFixed(2)}</td>
                        </tr>
                      `
                          : `
                        <tr>
                          <td style="padding: 3px 0; color: #64748b;">IGST (${((siteSettings?.igst ?? 18)).toFixed(1)}%):</td>
                          <td style="padding: 3px 0; text-align: right; color: #475569;">₹${gstBreakdown.igst.toFixed(2)}</td>
                        </tr>
                      `
                      }
                      <tr>
                        <td style="padding: 3px 0; color: #64748b;">Delivery / Shipping:</td>
                        <td style="padding: 3px 0; text-align: right; color: #15803d; font-weight: 600;">FREE</td>
                      </tr>
                      <tr style="border-top: 2px solid #14261E;">
                        <td style="padding: 10px 0 4px 0; font-size: 14px; font-weight: bold; color: #14261E;">Grand Total:</td>
                        <td style="padding: 10px 0 4px 0; text-align: right; font-size: 16px; font-weight: bold; color: #14261E;">₹${total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer & Support Notice -->
          <tr>
            <td style="background-color: #F8F6F0; border-top: 1px solid #EFE9DD; padding: 22px 28px; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #14261E;">
                Need help or guidance with using your herbal formulations?
              </p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">
                Connect directly with our Surat Ayurvedic workshop via WhatsApp or Phone: <strong style="color: #14261E;">${supportPhone}</strong> or Email: <strong style="color: #14261E;">${supportEmail}</strong>
              </p>
              <p style="margin: 0; font-size: 10px; color: #94a3b8;">
                © ${new Date().getFullYear()} Labdhi Herbs. All rights reserved. • This is a computer-generated tax invoice.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

/**
 * Automatically dispatches the order confirmation invoice email to customer (and Bcc/copies admin)
 */
export async function sendOrderInvoiceEmail(order: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!order) return { success: false, error: 'No order provided' };

    const recipientEmail = order.customer?.email || order.shippingAddress?.email;
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn(`[Order Email] No valid recipient email address for Order #${order.orderId}`);
      return { success: false, error: 'No recipient email' };
    }

    const settings = (await SiteSettings.findOne().lean()) as any;

    // Check if order emails are disabled
    if (settings?.smtpConfig?.enableOrderEmails === false) {
      console.log(`[Order Email] Order confirmation emails are disabled in admin settings for #${order.orderId}`);
      return { success: true };
    }

    const html = generateOrderInvoiceHtml({ order, siteSettings: settings });
    const senderName = settings?.smtpConfig?.senderName || 'Labdhi Herbs Authentic Ayurveda';
    const subject = `🌿 Order Confirmed #${order.orderId} - Labdhi Herbs Tax Invoice`;

    const result = await sendEmail({
      to: recipientEmail,
      subject,
      html,
      fromName: senderName,
    });

    console.log(`[Order Email] Dispatched to ${recipientEmail} for Order #${order.orderId} (Simulated: ${result.simulated})`);

    // Also notify admin email if configured
    const adminEmail = settings?.smtpConfig?.senderEmail || settings?.profile?.adminEmail;
    if (adminEmail && adminEmail !== recipientEmail && adminEmail.includes('@')) {
      sendEmail({
        to: adminEmail,
        subject: `[Admin Alert] New Order #${order.orderId} Received - ₹${order.pricing?.total || 0}`,
        html,
        fromName: senderName,
      }).catch(() => {});
    }

    return result;
  } catch (err: any) {
    console.error('[Order Email Error]', err?.message || err);
    return { success: false, error: err?.message };
  }
}

