import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayInstance: Razorpay | null = null;

export const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  return {
    keyId,
    keySecret,
    isConfigured: Boolean(keyId && keySecret && !keyId.includes('YourKeyId')),
  };
};

export const getRazorpayInstance = (): Razorpay => {
  const { keyId, keySecret, isConfigured } = getRazorpayConfig();

  if (!isConfigured) {
    throw new Error(
      'Razorpay Test Keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env'
    );
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
};

export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) return false;

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Validates Razorpay Webhook HMAC-SHA256 digital signature
 * Compares incoming x-razorpay-signature with hash of raw request payload
 */
export const verifyRazorpayWebhookSignature = (
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): boolean => {
  if (!webhookSecret || !signature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.error('[Razorpay Webhook] Signature verification error:', err);
    return false;
  }
};

