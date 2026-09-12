import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  // Profile Section (matching older website profile module)
  profile: {
    adminName: string;
    adminEmail: string;
    adminPhone: string;
    address: string;
    country: string;
    state: string;
    city: string;
    profileImage: string;
    facebook: string;
    instagram: string;
    youtube: string;
    twitter: string;
  };
  // About Us
  aboutUs: {
    content: string;
  };
  // Legal & Policy Content (rich text)
  termsAndConditions: string;
  privacyPolicy: string;
  refundPolicy: string;
  shippingPolicy: string;
  // FAQ
  faq: {
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
  }[];
  // Copyright
  copyrightText: string;
  copyrightYear: number;
  // Logo
  logoLight: string;    // light background logo URL
  logoDark: string;     // dark background logo URL
  favicon: string;
  // Banners
  banners: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    link: string;
    isActive: boolean;
    order: number;
  }[];
  // Site Settings (General)
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  supportPhone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsLink: string;
  // Social Media
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  // Operations & System Configuration (matching older website Site Setting)
  maintenanceMode: boolean;
  gstEnabled: boolean;
  igst: number;
  cgst: number;
  sgst: number;
  userLoginEnabled: boolean;
  paymentMode: string;
  reviewManagementEnabled: boolean;
  blogManagementEnabled: boolean;
  // SEO defaults
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  updatedAt: Date;
  createdAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    profile: {
      adminName: { type: String, default: 'admin' },
      adminEmail: { type: String, default: 'support@labdhiherbs.com' },
      adminPhone: { type: String, default: '+91 93283 49328' },
      address: {
        type: String,
        default: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
      },
      country: { type: String, default: 'India' },
      state: { type: String, default: 'Gujarat' },
      city: { type: String, default: 'Surat' },
      profileImage: { type: String, default: '' },
      facebook: {
        type: String,
        default: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
      },
      instagram: {
        type: String,
        default: 'https://www.instagram.com/labdhiherbs/',
      },
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
    },
    aboutUs: {
      content: {
        type: String,
        default:
          'Labdhi Herbs is a Surat-based Ayurvedic brand crafting 100% chemical-free hair, skin, and joint care formulations using time-tested botanical ingredients.',
      },
    },
    termsAndConditions: {
      type: String,
      default:
        '<h2>Terms and Conditions</h2><p>Welcome to Labdhi Herbs. By accessing our website and purchasing our products, you agree to the following terms...</p>',
    },
    privacyPolicy: {
      type: String,
      default:
        '<h2>Privacy Policy</h2><p>At Labdhi Herbs, we are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data...</p>',
    },
    refundPolicy: {
      type: String,
      default:
        '<h2>Refund Policy</h2><p>We want you to be completely satisfied with your purchase. If you are not satisfied, we offer a hassle-free return and refund process...</p>',
    },
    shippingPolicy: {
      type: String,
      default:
        '<h2>Shipping Policy</h2><p>We dispatch all orders within 1–2 business days from our Surat workshop. Standard delivery takes 5–7 business days across India...</p>',
    },
    faq: {
      type: [
        {
          question: { type: String, required: true },
          answer: { type: String, required: true },
          order: { type: Number, default: 0 },
          isActive: { type: Boolean, default: true },
        },
      ],
      default: [
        {
          question: 'Are Labdhi Herbs products 100% natural?',
          answer: 'Yes, all our products are crafted from 100% natural botanical extracts with no artificial chemicals, parabens, or synthetic additives.',
          order: 1,
          isActive: true,
        },
        {
          question: 'How long does shipping take?',
          answer: 'We dispatch all orders within 1–2 business days. Standard delivery typically takes 5–7 business days across India.',
          order: 2,
          isActive: true,
        },
        {
          question: 'Can I return or exchange a product?',
          answer: 'Yes, we offer a 7-day return policy for damaged or incorrect items. Please contact our support team with your order details.',
          order: 3,
          isActive: true,
        },
        {
          question: 'Are the products suitable for sensitive skin?',
          answer: 'Our formulations are gentle and designed for all skin types including sensitive skin. We recommend doing a patch test before first use.',
          order: 4,
          isActive: true,
        },
      ],
    },
    copyrightText: { type: String, default: '© 2025 Labdhi Herbs. All rights reserved.' },
    copyrightYear: { type: Number, default: 2025 },
    logoLight: { type: String, default: '/uploads/logo/Main-logo-531.jpg' },
    logoDark: { type: String, default: '/uploads/logo/Main-logo-531.jpg' },
    favicon: { type: String, default: '/favicon.ico' },
    banners: {
      type: [
        {
          id: { type: String, default: () => Math.random().toString(36).substr(2, 9) },
          title: { type: String, required: true },
          subtitle: { type: String, default: '' },
          image: { type: String, required: true },
          link: { type: String, default: '/shop' },
          isActive: { type: Boolean, default: true },
          order: { type: Number, default: 0 },
        },
      ],
      default: [
        {
          id: 'banner-1',
          title: '100% Pure Botanical Formulations',
          subtitle: 'Handcrafted in Surat, Gujarat',
          image: 'https://labdhiherbs.com/uploads/banners/banner-7127.jpg',
          link: '/shop',
          isActive: true,
          order: 1,
        },
        {
          id: 'banner-2',
          title: 'Authentic Ayurvedic Hair & Skin Care',
          subtitle: 'Zero Chemicals, Pure Potency',
          image: 'https://labdhiherbs.com/uploads/banners/banner-9838.jpg',
          link: '/shop',
          isActive: true,
          order: 2,
        },
        {
          id: 'banner-3',
          title: 'Pain Relief & Herbal Balms',
          subtitle: 'Time-tested Gujarati Herbal Wisdom',
          image: 'https://labdhiherbs.com/uploads/banners/banner-2050.jpg',
          link: '/shop',
          isActive: true,
          order: 3,
        },
      ],
    },
    siteName: { type: String, default: 'Labdhi Herbs' },
    siteTagline: { type: String, default: 'Pure Ayurvedic Formulations from Surat, Gujarat' },
    supportEmail: { type: String, default: 'support@labdhiherbs.com' },
    supportPhone: { type: String, default: '+91 93283 49328' },
    whatsappNumber: { type: String, default: '+919328349328' },
    address: { type: String, default: 'Labdhi Herbs Workshop, Surat' },
    city: { type: String, default: 'Surat' },
    state: { type: String, default: 'Gujarat' },
    pincode: { type: String, default: '395001' },
    googleMapsLink: { type: String, default: '' },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    // Operations & System Configuration
    maintenanceMode: { type: Boolean, default: false },
    gstEnabled: { type: Boolean, default: true },
    igst: { type: Number, default: 18 },
    cgst: { type: Number, default: 9 },
    sgst: { type: Number, default: 9 },
    userLoginEnabled: { type: Boolean, default: true },
    paymentMode: { type: String, default: 'both' },
    reviewManagementEnabled: { type: Boolean, default: true },
    blogManagementEnabled: { type: Boolean, default: true },
    metaTitle: { type: String, default: 'Labdhi Herbs – Pure Ayurvedic Formulations from Surat' },
    metaDescription: {
      type: String,
      default:
        'Discover Labdhi Herbs – 100% natural hair, skin, and joint care formulations handcrafted in Surat, Gujarat with pure botanical extracts.',
    },
    metaKeywords: {
      type: String,
      default: 'Ayurvedic herbs, herbal products, natural skincare, hair care, joint care, Surat, Gujarat',
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings = mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
export default SiteSettings;
