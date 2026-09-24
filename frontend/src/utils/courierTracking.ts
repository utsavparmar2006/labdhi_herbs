export interface CourierProvider {
  id: string;
  name: string;
  badge: string;
  category: 'post' | 'local_courier' | 'express';
  tag: string;
  placeholder: string;
  trackingUrl: (trackId: string) => string;
}

export const COURIER_PROVIDERS: CourierProvider[] = [
  {
    id: 'india_post',
    name: 'India Post / Speed Post',
    badge: '📮 Postal',
    category: 'post',
    tag: 'Standard / COD Orders',
    placeholder: 'e.g. EJ123456789IN or CK987654321IN',
    trackingUrl: (trackId: string) =>
      `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?id=${encodeURIComponent(
        trackId
      )}`,
  },
  {
    id: 'tirupati',
    name: 'Shree Tirupati Courier',
    badge: '📦 Gujarat Local',
    category: 'local_courier',
    tag: 'Online Paid / Fast Delivery',
    placeholder: 'e.g. 1029384756',
    trackingUrl: (trackId: string) =>
      `https://shreetirupaticourier.net/Tracking.aspx?awb=${encodeURIComponent(trackId)}`,
  },
  {
    id: 'maruti',
    name: 'Shree Maruti Courier',
    badge: '🏎️ Gujarat Local',
    category: 'local_courier',
    tag: 'Online Paid / Express Local',
    placeholder: 'e.g. SMC123456789',
    trackingUrl: (trackId: string) =>
      `https://www.shreemaruticourier.com/track-your-shipment/?tracking_no=${encodeURIComponent(trackId)}`,
  },
  {
    id: 'dtdc',
    name: 'DTDC Express',
    badge: '🚚 National Express',
    category: 'express',
    tag: 'Online Paid / Nationwide',
    placeholder: 'e.g. D12345678 or B98765432',
    trackingUrl: (trackId: string) =>
      `https://www.dtdc.in/tracking/shipment-tracking.asp?trNo=${encodeURIComponent(trackId)}`,
  },
  {
    id: 'delhivery',
    name: 'Delhivery',
    badge: '✈️ National Express',
    category: 'express',
    tag: 'Fast Surface / Air',
    placeholder: 'e.g. 1283948291029',
    trackingUrl: (trackId: string) =>
      `https://www.delhivery.com/track/package/${encodeURIComponent(trackId)}`,
  },
  {
    id: 'bluedart',
    name: 'Blue Dart Express',
    badge: '🏢 Premium Air',
    category: 'express',
    tag: 'Metro / Air Express',
    placeholder: 'e.g. 987654321',
    trackingUrl: (trackId: string) =>
      `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(trackId)}`,
  },
  {
    id: 'anjani',
    name: 'Anjani Courier',
    badge: '📦 Regional',
    category: 'local_courier',
    tag: 'Gujarat / Western India',
    placeholder: 'e.g. 504938210',
    trackingUrl: (trackId: string) =>
      `http://www.anjanicourier.com/track.aspx?awb=${encodeURIComponent(trackId)}`,
  },
  {
    id: 'other',
    name: 'Other Courier Partner',
    badge: '🏷️ Custom',
    category: 'local_courier',
    tag: 'Direct Consignment',
    placeholder: 'Enter consignment / tracking receipt number',
    trackingUrl: (trackId: string) =>
      `https://trackcourier.io/track-and-trace/${encodeURIComponent(trackId)}`,
  },
];

/**
 * Resolves the live courier tracking link from courier name and tracking ID
 */
export function getDirectTrackingUrl(deliveryName?: string, deliveryTrackId?: string): string {
  if (!deliveryTrackId || !deliveryTrackId.trim()) return '';

  const cleanTrackId = deliveryTrackId.trim();
  const nameLower = (deliveryName || '').toLowerCase();

  // Match known courier patterns
  if (
    nameLower.includes('post') ||
    nameLower.includes('speed') ||
    nameLower.includes('dak') ||
    cleanTrackId.toUpperCase().endsWith('IN')
  ) {
    return `https://www.indiapost.gov.in/_layouts/15/dpt.cept.tracking/trackconsignment.aspx?id=${encodeURIComponent(
      cleanTrackId
    )}`;
  }

  if (nameLower.includes('tirupati')) {
    return `https://shreetirupaticourier.net/Tracking.aspx?awb=${encodeURIComponent(cleanTrackId)}`;
  }

  if (nameLower.includes('maruti')) {
    return `https://www.shreemaruticourier.com/track-your-shipment/?tracking_no=${encodeURIComponent(cleanTrackId)}`;
  }

  if (nameLower.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp?trNo=${encodeURIComponent(cleanTrackId)}`;
  }

  if (nameLower.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${encodeURIComponent(cleanTrackId)}`;
  }

  if (nameLower.includes('blue') || nameLower.includes('dart')) {
    return `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(cleanTrackId)}`;
  }

  if (nameLower.includes('anjani')) {
    return `http://www.anjanicourier.com/track.aspx?awb=${encodeURIComponent(cleanTrackId)}`;
  }

  // Universal tracker fallback for other local couriers
  return `https://trackcourier.io/track-and-trace/${encodeURIComponent(cleanTrackId)}`;
}

/**
 * Generates an automated WhatsApp dispatch message for the customer
 */
export function buildDispatchWhatsAppUrl(params: {
  phone: string;
  customerName: string;
  orderId: string;
  deliveryName: string;
  deliveryTrackId: string;
}): string {
  const digits = params.phone.replace(/\D/g, '');
  const cleanPhone = digits.length === 10 ? `91${digits}` : digits;

  const trackingLink = `https://labdhiherbs.com/track-order?id=${params.orderId}`;

  const message = `🌿 *Namaste ${params.customerName} ji!*\n\nGood news! Aapka *Labdhi Herbs* order *#${params.orderId}* dispatch ho gaya hai! 🎉\n\n📦 *Delivery Partner:* ${params.deliveryName || 'Postal / Express'}\n🔖 *Tracking / AWB No:* ${params.deliveryTrackId}\n\n🔍 *Live Order Tracking:* ${trackingLink}\n\nAuthentic Ayurvedic wellness chunne ke liye dhanyawad!\n\n_Labdhi Herbs, Surat, Gujarat_`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}
