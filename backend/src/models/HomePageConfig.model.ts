import mongoose, { Document, Schema } from 'mongoose';

export interface IHomePageConfig extends Document {
  announcementBar: {
    enabled: boolean;
    phone: string;
    email: string;
    locationText: string;
    badgeText: string;
    messages: string[];
  };
  heroSection: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    description: string;
    primaryBtnText: string;
    primaryBtnLink: string;
    secondaryBtnText: string;
    secondaryBtnLink: string;
    videoUrl: string;
    posterUrl: string;
  };
  updatedAt: Date;
  createdAt: Date;
}

const HomePageConfigSchema: Schema = new Schema(
  {
    announcementBar: {
      enabled: { type: Boolean, default: true },
      phone: { type: String, default: '+91 93283 49328' },
      email: { type: String, default: 'support@labdhiherbs.com' },
      locationText: { type: String, default: 'Surat, Gujarat' },
      badgeText: { type: String, default: '100% Authentic' },
      messages: {
        type: [String],
        default: [
          '🌿 Pure Herbal Formulations • Free Shipping Across India',
          '🚚 Express Fast Dispatch Direct from Surat Workshop',
          '✨ Special Offer: 10% Extra Discount on First Order',
        ],
      },
    },
    heroSection: {
      eyebrow: { type: String, default: 'NATURAL • HERBAL • AYURVEDIC WELLNESS' },
      headline: { type: String, default: 'Pure Ayurvedic Formulations' },
      subheadline: { type: String, default: 'for Natural Healing & Glow' },
      description: {
        type: String,
        default:
          'Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Experience deep nourishment, skin vitality, and holistic wellness rooted in ancient wisdom.',
      },
      primaryBtnText: { type: String, default: 'Explore Herbal Shop' },
      primaryBtnLink: { type: String, default: '/shop' },
      secondaryBtnText: { type: String, default: 'Watch Stories' },
      secondaryBtnLink: { type: String, default: '/gallery' },
      videoUrl: {
        type: String,
        default: '/videos/Create_a_premium_cinematic_bra.mp4',
      },
      posterUrl: {
        type: String,
        default:
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920',
      },
    },
  },
  { timestamps: true }
);

export const HomePageConfig = mongoose.model<IHomePageConfig>(
  'HomePageConfig',
  HomePageConfigSchema
);
