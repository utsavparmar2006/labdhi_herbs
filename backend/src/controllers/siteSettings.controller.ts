import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings.model.js';

/**
 * Get site settings (creates default if none exists)
 */
export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update full site settings (admin only)
 */
export const updateSiteSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.status(200).json({ success: true, message: 'Site settings updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update profile section
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const profileData = req.body;
    const updateObj: any = { profile: profileData };

    // Sync corresponding top-level site fields for convenience
    if (profileData.adminPhone) {
      updateObj.supportPhone = profileData.adminPhone;
    }
    if (profileData.adminEmail) {
      updateObj.supportEmail = profileData.adminEmail;
    }
    if (profileData.address) {
      updateObj.address = profileData.address;
    }
    if (profileData.city) {
      updateObj.city = profileData.city;
    }
    if (profileData.state) {
      updateObj.state = profileData.state;
    }
    if (profileData.facebook || profileData.instagram || profileData.youtube || profileData.twitter) {
      updateObj.social = {
        facebook: profileData.facebook || '',
        instagram: profileData.instagram || '',
        youtube: profileData.youtube || '',
        twitter: profileData.twitter || '',
      };
    }

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: updateObj },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update About Us content
 */
export const updateAboutUs = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { aboutUs: req.body } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'About Us updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update a legal policy section
 */
export const updateLegalPolicy = async (req: Request, res: Response) => {
  const { section } = req.params; // e.g. 'termsAndConditions', 'privacyPolicy', etc.
  const validSections = ['termsAndConditions', 'privacyPolicy', 'refundPolicy', 'shippingPolicy'];
  if (!validSections.includes(section)) {
    return res.status(400).json({ success: false, message: 'Invalid section name' });
  }
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { [section]: req.body.content } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: `${section} updated successfully`, data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update FAQ list
 */
export const updateFaq = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { faq: req.body } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'FAQ updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update copyright
 */
export const updateCopyright = async (req: Request, res: Response) => {
  try {
    const { copyrightText, copyrightYear } = req.body;
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { copyrightText, copyrightYear } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Copyright updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update logos & favicon
 */
export const updateLogos = async (req: Request, res: Response) => {
  try {
    const { logoLight, logoDark, favicon } = req.body;
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { logoLight, logoDark, favicon } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Logos updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update banners list
 */
export const updateBanners = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: { banners: req.body } },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Banners updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Update general site settings
 */
export const updateGeneralSettings = async (req: Request, res: Response) => {
  try {
    const {
      siteName,
      siteTagline,
      supportEmail,
      supportPhone,
      whatsappNumber,
      address,
      city,
      state,
      pincode,
      googleMapsLink,
      social,
      metaTitle,
      metaDescription,
      metaKeywords,
      maintenanceMode,
      gstEnabled,
      igst,
      cgst,
      sgst,
      userLoginEnabled,
      paymentMode,
      reviewManagementEnabled,
      blogManagementEnabled,
    } = req.body;

    const updateData: any = {
      siteName,
      siteTagline,
      supportEmail,
      supportPhone,
      whatsappNumber,
      address,
      city,
      state,
      pincode,
      googleMapsLink,
      social,
      metaTitle,
      metaDescription,
      metaKeywords,
    };

    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (gstEnabled !== undefined) updateData.gstEnabled = gstEnabled;
    if (igst !== undefined) updateData.igst = Number(igst);
    if (cgst !== undefined) updateData.cgst = Number(cgst);
    if (sgst !== undefined) updateData.sgst = Number(sgst);
    if (userLoginEnabled !== undefined) updateData.userLoginEnabled = userLoginEnabled;
    if (paymentMode !== undefined) updateData.paymentMode = paymentMode;
    if (reviewManagementEnabled !== undefined) updateData.reviewManagementEnabled = reviewManagementEnabled;
    if (blogManagementEnabled !== undefined) updateData.blogManagementEnabled = blogManagementEnabled;

    // Two-way sync with profile fields for full consistency across all components
    if (supportPhone) updateData['profile.adminPhone'] = supportPhone;
    if (supportEmail) updateData['profile.adminEmail'] = supportEmail;
    if (address) updateData['profile.address'] = address;
    if (city) updateData['profile.city'] = city;
    if (state) updateData['profile.state'] = state;
    if (social) {
      if (social.facebook !== undefined) updateData['profile.facebook'] = social.facebook;
      if (social.instagram !== undefined) updateData['profile.instagram'] = social.instagram;
      if (social.youtube !== undefined) updateData['profile.youtube'] = social.youtube;
      if (social.twitter !== undefined) updateData['profile.twitter'] = social.twitter;
    }

    const settings = await SiteSettings.findOneAndUpdate(
      {},
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Site settings updated successfully', data: settings });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Seed initial site settings if not present
 */
export const seedSiteSettings = async () => {
  try {
    const existing = await SiteSettings.findOne();
    if (!existing) {
      await SiteSettings.create({});
      console.log('✅ Default site settings seeded');
    }
  } catch (error) {
    console.error('❌ Error seeding site settings:', error);
  }
};
