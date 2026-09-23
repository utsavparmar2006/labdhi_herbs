import nodemailer from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  smtpConfig?: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    senderName?: string;
  };
}

export function createMailerTransport(config?: {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}) {
  const user = config?.user || process.env.SMTP_USER;
  const pass = config?.pass || process.env.SMTP_PASS;
  let host = config?.host || process.env.SMTP_HOST;
  let port = Number(config?.port || process.env.SMTP_PORT) || 587;

  if (!user || !pass) {
    return null;
  }

  // If user is a Gmail address and no custom host provided, use Gmail service
  if ((!host || host === 'smtp.gmail.com') && user.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass, // Gmail App Password (16 characters)
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Otherwise use generic SMTP
  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port || 587,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

export async function sendEmail({
  to,
  subject,
  html,
  fromName = 'Labdhi Herbs Authentic Ayurveda',
  smtpConfig,
}: SendMailOptions): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  try {
    const user = smtpConfig?.user || process.env.SMTP_USER;
    const sender = smtpConfig?.senderName || fromName;

    const transporter = createMailerTransport(smtpConfig);

    // If SMTP credentials are fully provided, deliver via actual SMTP transport
    if (transporter && user) {
      const info = await transporter.sendMail({
        from: `"${sender}" <${user}>`,
        to,
        subject,
        html,
      });

      console.log(`[Email Service - Real SMTP Sent] To: ${to} | ID: ${info.messageId}`);
      return { success: true, simulated: false, messageId: info.messageId };
    }

    // Graceful simulation: SMTP is not configured yet in .env/admin settings
    console.log(`[Email Service - Simulated] To: ${to} | Subject: "${subject}" | Reason: SMTP user/pass not configured`);
    return { success: true, simulated: true };
  } catch (err: any) {
    console.error('[Email Service Error]', err?.message || err);
    return { success: false, error: err?.message || 'Failed to dispatch email' };
  }
}

/**
 * Verify SMTP connection and send a test email
 */
export async function verifyAndSendTestEmail(
  toEmail: string,
  smtpConfig: {
    host?: string;
    port?: number;
    user?: string;
    pass?: string;
    senderName?: string;
  }
): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const transporter = createMailerTransport(smtpConfig);
    if (!transporter) {
      return {
        success: false,
        message: 'Please provide Email / User and Password / App Password in SMTP settings.',
      };
    }

    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"${smtpConfig.senderName || 'Labdhi Herbs'}" <${smtpConfig.user}>`,
      to: toEmail,
      subject: '🌿 Labdhi Herbs - Test Email Notification',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 25px; background: #F8F6F0; border-radius: 12px; border: 1px solid #EFE9DD;">
          <h2 style="color: #14261E;">✅ Email Server Connected Successfully!</h2>
          <p>This is a test email from your <strong>Labdhi Herbs</strong> admin panel.</p>
          <p>Your automatic customer welcome emails and discount codes will now be delivered live to inboxes.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: `Test email successfully delivered to ${toEmail} (ID: ${info.messageId})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'SMTP Authentication failed. Please check your credentials.',
      error: err?.message,
    };
  }
}
