import { Request, Response } from 'express';
import { HomePageConfig } from '../models/HomePageConfig.model.js';

// Default initial config values
const DEFAULT_CONFIG = {
  announcementBar: {
    enabled: true,
    phone: '+91 93283 49328',
    email: 'support@labdhiherbs.com',
    locationText: 'Surat, Gujarat',
    badgeText: '100% Authentic',
    messages: [
      '🌿 Pure Herbal Formulations • Free Shipping Across India',
      '🚚 Express Fast Dispatch Direct from Surat Workshop',
      '✨ Special Offer: 10% Extra Discount on First Order',
    ],
  },
  heroSection: {
    eyebrow: 'NATURAL • HERBAL • AYURVEDIC WELLNESS',
    headline: 'Pure Ayurvedic Formulations',
    subheadline: 'for Natural Healing & Glow',
    description:
      'Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Experience deep nourishment, skin vitality, and holistic wellness rooted in ancient wisdom.',
    primaryBtnText: 'Explore Herbal Shop',
    primaryBtnLink: '/shop',
    secondaryBtnText: 'Watch Stories',
    secondaryBtnLink: '/gallery',
    videoUrl: '/videos/Create_a_premium_cinematic_bra.mp4',
    posterUrl:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1920',
  },
};

/**
 * @desc Get current Home Page Configuration
 * @route GET /api/v1/homepage-config
 * @access Public
 */
export const getHomePageConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    let config = await HomePageConfig.findOne();

    if (!config) {
      config = await HomePageConfig.create(DEFAULT_CONFIG);
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homepage configuration',
      error: error.message,
    });
  }
};

/**
 * @desc Update Home Page Configuration (Hero line / Announcement Bar & Hero Section)
 * @route PUT /api/v1/homepage-config
 * @access Private (Admin only)
 */
export const updateHomePageConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { announcementBar, heroSection } = req.body;

    let config = await HomePageConfig.findOne();

    if (!config) {
      config = new HomePageConfig(DEFAULT_CONFIG);
    }

    if (announcementBar) {
      if (typeof announcementBar.enabled === 'boolean') {
        config.announcementBar.enabled = announcementBar.enabled;
      }
      if (announcementBar.phone !== undefined) {
        config.announcementBar.phone = announcementBar.phone;
      }
      if (announcementBar.email !== undefined) {
        config.announcementBar.email = announcementBar.email;
      }
      if (announcementBar.locationText !== undefined) {
        config.announcementBar.locationText = announcementBar.locationText;
      }
      if (announcementBar.badgeText !== undefined) {
        config.announcementBar.badgeText = announcementBar.badgeText;
      }
      if (Array.isArray(announcementBar.messages)) {
        config.announcementBar.messages = announcementBar.messages;
      }
    }

    if (heroSection) {
      if (heroSection.eyebrow !== undefined) {
        config.heroSection.eyebrow = heroSection.eyebrow;
      }
      if (heroSection.headline !== undefined) {
        config.heroSection.headline = heroSection.headline;
      }
      if (heroSection.subheadline !== undefined) {
        config.heroSection.subheadline = heroSection.subheadline;
      }
      if (heroSection.description !== undefined) {
        config.heroSection.description = heroSection.description;
      }
      if (heroSection.primaryBtnText !== undefined) {
        config.heroSection.primaryBtnText = heroSection.primaryBtnText;
      }
      if (heroSection.primaryBtnLink !== undefined) {
        config.heroSection.primaryBtnLink = heroSection.primaryBtnLink;
      }
      if (heroSection.secondaryBtnText !== undefined) {
        config.heroSection.secondaryBtnText = heroSection.secondaryBtnText;
      }
      if (heroSection.secondaryBtnLink !== undefined) {
        config.heroSection.secondaryBtnLink = heroSection.secondaryBtnLink;
      }
      if (heroSection.videoUrl !== undefined) {
        config.heroSection.videoUrl = heroSection.videoUrl;
      }
      if (heroSection.posterUrl !== undefined) {
        config.heroSection.posterUrl = heroSection.posterUrl;
      }
    }

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Home page configuration updated successfully',
      data: config,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update homepage configuration',
      error: error.message,
    });
  }
};
