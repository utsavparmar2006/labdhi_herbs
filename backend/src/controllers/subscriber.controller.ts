import { Request, Response } from 'express';
import Subscriber from '../models/Subscriber.model';
import SiteSettings from '../models/SiteSettings.model';
import { sendEmail, verifyAndSendTestEmail } from '../utils/mailer';
import { sendDirectWhatsAppMessage } from '../utils/whatsappGateway';

// Helper to replace template tags safely
function replaceTemplateTags(template: string, vars: Record<string, string>): string {
  if (!template) return '';
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    result = result.replace(regex, value || '');
  }
  return result;
}

// Clean phone number to standard international format (defaults to India +91 if 10 digits)
function formatWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

const DEFAULT_WELCOME_EMAIL_TEXT = `Namaste {name} ji,

Welcome to the Labdhi Herbs family! We are truly delighted to have you join our Ayurvedic wellness community.

We handcraft 100% natural, chemical-free herbal formulations for hair, skin, and joint care rooted in authentic Gujarati botanical wisdom.

🎁 Here is your exclusive 10% OFF discount coupon for your first order:
Coupon Code: {couponCode}

Use this code at checkout to get an extra 10% discount on all formulations!
Shop our botanical collection: https://labdhiherbs.com/shop

If you need any guidance or have wellness questions, reply directly to this email or contact us at {adminPhone}.

Warm regards,
Team Labdhi Herbs
Surat, Gujarat`;

// Helper to transform human-readable plain text email into a branded luxury HTML email
function convertPlainTextToBrandedHtml(plainText: string, subject: string, couponCode: string): string {
  if (!plainText) return '';
  if (plainText.includes('<html') || plainText.includes('<body') || (plainText.includes('<div') && plainText.includes('style='))) {
    return plainText;
  }

  // Escape HTML entities to prevent script injection
  const escaped = plainText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert URLs into clickable links
  const linked = escaped.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" style="color: #1F3A2E; font-weight: bold; text-decoration: underline;" target="_blank">$1</a>'
  );

  // Convert line breaks and paragraphs
  const paragraphs = linked
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin: 0 0 14px 0; color: #333333; line-height: 1.7; font-size: 14px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F8F6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8F6F0; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #EFE9DD; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
              
              <!-- Brand Header -->
              <tr>
                <td style="background-color: #14261E; padding: 26px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">🌿 LABDHI HERBS</h1>
                  <p style="margin: 4px 0 0 0; color: #D4A373; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Authentic Ayurvedic Wellness</p>
                </td>
              </tr>

              <!-- Email Content Area -->
              <tr>
                <td style="padding: 32px 30px 24px 30px; background-color: #ffffff;">
                  ${paragraphs}
                  
                  ${
                    couponCode
                      ? `
                  <!-- Luxury Coupon Voucher Card -->
                  <div style="background-color: #14261E; border-radius: 14px; padding: 18px 24px; text-align: center; margin: 25px 0 20px 0;">
                    <p style="margin: 0 0 4px 0; color: #EFE9DD; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Your Exclusive 10% Discount Code</p>
                    <span style="display: inline-block; font-family: 'Courier New', Courier, monospace; font-size: 24px; font-weight: 800; color: #D4A373; letter-spacing: 3px; padding: 6px 14px; background: rgba(255,255,255,0.08); border-radius: 8px; border: 1px dashed #D4A373; margin-top: 4px;">${couponCode}</span>
                    <p style="margin: 6px 0 0 0; color: #EFE9DD; font-size: 11px;">Apply at checkout on labdhiherbs.com</p>
                  </div>
                  `
                      : ''
                  }

                  <div style="text-align: center; margin-top: 24px;">
                    <a href="https://labdhiherbs.com/shop" target="_blank" style="display: inline-block; background-color: #1F3A2E; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px;">Explore Botanical Formulations →</a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #F8F6F0; border-top: 1px solid #EFE9DD; padding: 20px 30px; text-align: center; color: #71846C; font-size: 11px; line-height: 1.5;">
                  <p style="margin: 0 0 4px 0; font-weight: 600; color: #14261E;">Labdhi Herbs Authentic Ayurveda</p>
                  <p style="margin: 0;">Surat, Gujarat, India • 100% Botanical Formulations</p>
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
 * Public Endpoint: Subscribe to newsletter with Name, Email & WhatsApp Number
 */
export async function subscribe(req: Request, res: Response) {
  try {
    const { name, email, phone, source } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your full name' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }
    if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit WhatsApp number' });
    }

    const trimmedName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const formattedPhone = formatWhatsAppNumber(cleanPhone);

    // Fetch site settings for auto-responder configuration
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    const config = settings.newsletterConfig || {
      adminNotificationEmail: settings.supportEmail || 'support@labdhiherbs.com',
      adminWhatsAppNumber: settings.whatsappNumber || '+919328349328',
      defaultCouponCode: 'WELCOME10',
      welcomeEmailSubject: '🌿 Welcome to Labdhi Herbs, {name}! Your 10% Discount Code: {couponCode}',
      welcomeEmailBody:
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F8F6F0; padding: 30px; border-radius: 16px;"><h2 style="color: #14261E;">🌿 Welcome to Labdhi Herbs, {name}!</h2><p>Here is your exclusive 10% OFF discount coupon: <strong>{couponCode}</strong></p></div>',
      whatsappMessageTemplate:
        '🌿 *Namaste {name} ji!*\n\nWelcome to the *Labdhi Herbs* family!\n\n🎁 Your exclusive 10% OFF coupon code: *{couponCode}*\n\nShop 100% natural Ayurvedic formulations: https://labdhiherbs.com/shop',
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPass: '',
      smtpSenderName: 'Labdhi Herbs',
      autoSendEmail: true,
      autoSendWhatsApp: true,
      notifyAdmin: true,
    };

    const couponCode = config.defaultCouponCode || 'WELCOME10';

    // Check if subscriber already exists
    let subscriber = await Subscriber.findOne({ email: cleanEmail });
    const isNewSubscriber = !subscriber;

    if (subscriber) {
      subscriber.name = trimmedName;
      subscriber.phone = cleanPhone;
      subscriber.status = 'active';
      subscriber.lastContactedAt = new Date();
      if (source) subscriber.source = source;
    } else {
      subscriber = new Subscriber({
        name: trimmedName,
        email: cleanEmail,
        phone: cleanPhone,
        source: source || 'footer_newsletter',
        status: 'active',
        discountCode: couponCode,
      });
    }

    // Prepare template placeholder variables
    const templateVars: Record<string, string> = {
      name: trimmedName,
      email: cleanEmail,
      phone: cleanPhone,
      couponCode: couponCode,
      companyName: settings.siteName || 'Labdhi Herbs',
      adminPhone: settings.supportPhone || '+91 93283 49328',
      adminEmail: settings.supportEmail || 'support@labdhiherbs.com',
    };

    const personalizedEmailSubject = replaceTemplateTags(
      config.welcomeEmailSubject || '🌿 Welcome to Labdhi Herbs, {name}! Your 10% Discount Code: {couponCode}',
      templateVars
    );
    const rawEmailBody = replaceTemplateTags(config.welcomeEmailBody || DEFAULT_WELCOME_EMAIL_TEXT, templateVars);
    const brandedEmailHtml = convertPlainTextToBrandedHtml(rawEmailBody, personalizedEmailSubject, couponCode);
    const personalizedWhatsappText = replaceTemplateTags(config.whatsappMessageTemplate || '', templateVars);

    // 1. Send / Dispatch Welcome Email to Customer
    let emailStatus: 'sent' | 'simulated' | 'failed' | 'disabled' = 'disabled';
    if (config.autoSendEmail) {
      const emailResult = await sendEmail({
        to: cleanEmail,
        subject: personalizedEmailSubject,
        html: brandedEmailHtml,
        fromName: config.smtpSenderName || 'Labdhi Herbs Authentic Ayurveda',
        smtpConfig: {
          host: config.smtpHost,
          port: config.smtpPort,
          user: config.smtpUser,
          pass: config.smtpPass,
          senderName: config.smtpSenderName,
        },
      });

      if (emailResult.success) {
        emailStatus = emailResult.simulated ? 'simulated' : 'sent';
      } else {
        emailStatus = 'failed';
      }
    }
    subscriber.emailStatus = emailStatus;

    // 2. Direct WhatsApp Dispatch (Server-side Gateway + Direct Link)
    const customerWhatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
      personalizedWhatsappText
    )}`;

    const adminFormattedPhone = formatWhatsAppNumber(config.adminWhatsAppNumber || '+919328349328');
    const directChatWithAdminUrl = `https://api.whatsapp.com/send?phone=${adminFormattedPhone}&text=${encodeURIComponent(
      `Hello Labdhi Herbs, I am ${trimmedName}. I just subscribed with code ${couponCode} and would like to know more about your formulations!`
    )}`;

    let whatsappStatus: 'sent' | 'pending' | 'failed' | 'disabled' = 'disabled';
    if (config.autoSendWhatsApp) {
      const waResult = await sendDirectWhatsAppMessage({
        phone: formattedPhone,
        message: personalizedWhatsappText,
        gatewayConfig: {
          provider: config.whatsappGatewayProvider,
          apiUrl: config.whatsappApiUrl,
          apiKey: config.whatsappApiKey,
          instanceId: config.whatsappInstanceId,
        },
      });
      whatsappStatus = waResult.status === 'sent' ? 'sent' : 'pending';
    }
    subscriber.whatsappStatus = whatsappStatus;
    await subscriber.save();

    // 3. Notify Admin of New Lead
    if (config.notifyAdmin && config.adminNotificationEmail) {
      sendEmail({
        to: config.adminNotificationEmail,
        subject: `🎯 New Lead Captured: ${trimmedName} (${cleanPhone})`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #EFE9DD; border-radius: 10px; max-width: 500px;">
            <h3 style="color: #14261E; margin-top: 0;">🎉 New Subscriber Joined Labdhi Herbs!</h3>
            <p><strong>Name:</strong> ${trimmedName}</p>
            <p><strong>Email:</strong> ${cleanEmail}</p>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/${formattedPhone}">${cleanPhone}</a></p>
            <p><strong>Source:</strong> ${subscriber.source}</p>
            <p><strong>Discount Assigned:</strong> ${couponCode}</p>
            <p style="margin-top: 20px;"><a href="https://wa.me/${formattedPhone}?text=${encodeURIComponent(
          `Namaste ${trimmedName} ji, thank you for subscribing to Labdhi Herbs!`
        )}" style="background: #25D366; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Chat with Lead on WhatsApp</a></p>
          </div>
        `,
        smtpConfig: {
          host: config.smtpHost,
          port: config.smtpPort,
          user: config.smtpUser,
          pass: config.smtpPass,
        },
      }).catch((e) => console.error('[Admin Notify Error]', e));
    }

    return res.status(200).json({
      success: true,
      isNewSubscriber,
      data: subscriber,
      couponCode,
      whatsappMessage: personalizedWhatsappText,
      customerWhatsappUrl,
      directChatWithAdminUrl,
      message: isNewSubscriber
        ? 'Welcome to the Labdhi Herbs family! Your discount code and welcome gift are ready.'
        : 'Welcome back! We have refreshed your exclusive discount code and details.',
    });
  } catch (err: any) {
    console.error('[Subscribe Controller Error]', err);
    return res.status(500).json({
      success: false,
      message: err?.message || 'Failed to complete subscription. Please try again.',
    });
  }
}

/**
 * Admin Endpoint: List subscribers with search, status filter & pagination
 */
export async function getAllSubscribers(req: Request, res: Response) {
  try {
    const { search = '', status = 'all', page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
      ];
    }

    const [subscribers, total] = await Promise.all([
      Subscriber.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Subscriber.countDocuments(filter),
    ]);

    // Calculate quick metrics
    const [totalActive, totalUnsubscribed] = await Promise.all([
      Subscriber.countDocuments({ status: 'active' }),
      Subscriber.countDocuments({ status: 'unsubscribed' }),
    ]);

    return res.status(200).json({
      success: true,
      data: subscribers,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
        totalActive,
        totalUnsubscribed,
      },
    });
  } catch (err: any) {
    console.error('[Get Subscribers Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscribers list' });
  }
}

/**
 * Admin Endpoint: Fetch newsletter configuration and message templates
 */
export async function getNewsletterSettings(req: Request, res: Response) {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    let configData = settings.newsletterConfig ? (settings.newsletterConfig as any).toObject ? (settings.newsletterConfig as any).toObject() : { ...settings.newsletterConfig } : {};

    // If existing saved body has old HTML code, provide the clean plain text to the admin!
    if (!configData.welcomeEmailBody || configData.welcomeEmailBody.includes('<div') || configData.welcomeEmailBody.includes('<html')) {
      configData.welcomeEmailBody = DEFAULT_WELCOME_EMAIL_TEXT;
    }

    return res.status(200).json({
      success: true,
      data: configData,
      companyProfile: {
        adminEmail: settings.profile?.adminEmail || settings.supportEmail || 'support@labdhiherbs.com',
        adminPhone: settings.profile?.adminPhone || settings.supportPhone || '+91 93283 49328',
        whatsappNumber: settings.whatsappNumber || '+919328349328',
      },
    });
  } catch (err: any) {
    console.error('[Get Newsletter Settings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to load newsletter settings' });
  }
}

/**
 * Admin Endpoint: Update newsletter configuration & message templates
 */
export async function updateNewsletterSettings(req: Request, res: Response) {
  try {
    const configUpdate = req.body;

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }

    const currentConfig = settings.newsletterConfig || ({} as any);

    settings.newsletterConfig = {
      ...currentConfig,
      ...configUpdate,
    };

    // If company admin email or phone are also passed, update main settings profile as well
    if (configUpdate.adminNotificationEmail) {
      settings.supportEmail = configUpdate.adminNotificationEmail;
    }
    if (configUpdate.adminWhatsAppNumber) {
      settings.whatsappNumber = configUpdate.adminWhatsAppNumber;
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      data: settings.newsletterConfig,
      message: 'Newsletter & message auto-responder settings saved successfully',
    });
  } catch (err: any) {
    console.error('[Update Newsletter Settings Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update newsletter settings' });
  }
}

/**
 * Admin Endpoint: Export all captured subscribers as CSV download
 */
export async function exportSubscribersCsv(req: Request, res: Response) {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });

    const headers = [
      'Name',
      'Email',
      'WhatsApp Phone',
      'Source',
      'Status',
      'Discount Code',
      'Email Status',
      'Subscribed Date',
    ];

    const rows = subscribers.map((s) => [
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${(s.phone || '').replace(/"/g, '""')}"`,
      `"${(s.source || '').replace(/"/g, '""')}"`,
      `"${s.status || 'active'}"`,
      `"${s.discountCode || ''}"`,
      `"${s.emailStatus || ''}"`,
      `"${new Date(s.createdAt).toLocaleDateString('en-IN')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="labdhi_herbs_subscribers_${Date.now()}.csv"`);
    return res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('[Export CSV Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to export subscribers CSV' });
  }
}

/**
 * Admin Endpoint: Resend welcome email or get personalized WhatsApp message
 */
export async function resendMessage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({ success: false, message: 'Subscriber not found' });
    }

    const settings = await SiteSettings.findOne();
    const config = settings?.newsletterConfig;

    const templateVars: Record<string, string> = {
      name: subscriber.name,
      email: subscriber.email,
      phone: subscriber.phone,
      couponCode: subscriber.discountCode || config?.defaultCouponCode || 'WELCOME10',
      companyName: settings?.siteName || 'Labdhi Herbs',
      adminPhone: settings?.supportPhone || '+91 93283 49328',
      adminEmail: settings?.supportEmail || 'support@labdhiherbs.com',
    };

    const personalizedSubject = replaceTemplateTags(
      config?.welcomeEmailSubject || '🌿 Special Offer from Labdhi Herbs for {name}!',
      templateVars
    );
    const rawBody = replaceTemplateTags(config?.welcomeEmailBody || DEFAULT_WELCOME_EMAIL_TEXT, templateVars);
    const brandedHtml = convertPlainTextToBrandedHtml(rawBody, personalizedSubject, subscriber.discountCode || config?.defaultCouponCode || 'WELCOME10');
    const personalizedWhatsapp = replaceTemplateTags(config?.whatsappMessageTemplate || '', templateVars);

    // Send email
    if (config?.smtpHost && config?.smtpUser) {
      await sendEmail({
        to: subscriber.email,
        subject: personalizedSubject,
        html: brandedHtml,
        fromName: config?.smtpSenderName,
        smtpConfig: {
          host: config?.smtpHost,
          port: config?.smtpPort,
          user: config?.smtpUser,
          pass: config?.smtpPass,
        },
      });
      subscriber.emailStatus = 'sent';
    }

    subscriber.lastContactedAt = new Date();
    await subscriber.save();

    const formattedPhone = formatWhatsAppNumber(subscriber.phone);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(
      personalizedWhatsapp
    )}`;

    return res.status(200).json({
      success: true,
      message: `Message refreshed for ${subscriber.name}`,
      whatsappUrl,
      whatsappMessage: personalizedWhatsapp,
    });
  } catch (err: any) {
    console.error('[Resend Message Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to re-dispatch message' });
  }
}

/**
 * Admin Endpoint: Delete a subscriber
 */
export async function deleteSubscriber(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await Subscriber.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Subscriber record not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscriber removed successfully',
    });
  } catch (err: any) {
    console.error('[Delete Subscriber Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete subscriber' });
  }
}

/**
 * Admin Endpoint: Test Email Server (SMTP) Connection
 */
export async function testEmailSettings(req: Request, res: Response) {
  try {
    const { toEmail, smtpConfig } = req.body;
    if (!toEmail || !toEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid destination email' });
    }

    const result = await verifyAndSendTestEmail(toEmail, smtpConfig);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('[Test Email Error]', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to send test email' });
  }
}

/**
 * Admin Endpoint: Test WhatsApp Gateway Dispatch
 */
export async function testWhatsAppGateway(req: Request, res: Response) {
  try {
    const { testPhone, message, gatewayConfig } = req.body;
    if (!testPhone) {
      return res.status(400).json({ success: false, message: 'Please provide a valid WhatsApp phone number' });
    }

    const result = await sendDirectWhatsAppMessage({
      phone: testPhone,
      message: message || '🌿 Test message from Labdhi Herbs WhatsApp Gateway.',
      gatewayConfig,
    });

    return res.status(result.success ? 200 : 400).json(result);
  } catch (err: any) {
    console.error('[Test WhatsApp Error]', err);
    return res.status(500).json({ success: false, message: err?.message || 'Failed to dispatch test WhatsApp' });
  }
}
