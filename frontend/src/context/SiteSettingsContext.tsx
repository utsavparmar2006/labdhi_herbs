'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface AdminProfileData {
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
}

export interface FaqItemData {
  _id?: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

export interface BannerData {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
}

export interface SiteSettingsData {
  // 1. Profile
  profile: AdminProfileData;

  // 2. About Us
  aboutUs: {
    content: string;
  };

  // 3–6. Legal Policies
  termsAndConditions: string;
  privacyPolicy: string;
  refundPolicy: string;
  shippingPolicy: string;

  // 7. FAQ
  faq: FaqItemData[];

  // 8. Copyrights
  copyrightText: string;
  copyrightYear: number;

  // 9. Logos
  logoLight: string;
  logoDark: string;
  favicon: string;

  // 10. Banners
  banners: BannerData[];

  // 11. Site Setting (General & SEO)
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
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

const DEFAULT_PROFILE: AdminProfileData = {
  adminName: 'admin',
  adminEmail: 'support@labdhiherbs.com',
  adminPhone: '+91 93283 49328',
  address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
  country: 'India',
  state: 'Gujarat',
  city: 'Surat',
  profileImage: '',
  facebook: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
  instagram: 'https://www.instagram.com/labdhiherbs/',
  youtube: '',
  twitter: '',
};

const DEFAULT_SETTINGS: SiteSettingsData = {
  profile: DEFAULT_PROFILE,
  aboutUs: {
    content:
      '<p>Labdhi Herbs was founded in Surat with a commitment to pure, chemical-free herbal formulations rooted in genuine Gujarati Ayurvedic heritage. Every formulation is handcrafted using 100% botanical ingredients at peak potency.</p>',
  },
  termsAndConditions:
    '<h2>Terms &amp; Conditions</h2><p>Welcome to Labdhi Herbs. By accessing or using our website and purchasing our Ayurvedic formulations, you agree to comply with and be bound by our terms and conditions.</p><h3>Orders and Deliveries</h3><p>All herbal preparations are dispatched from Surat, Gujarat within 24 to 48 business hours with verified tracking.</p>',
  privacyPolicy:
    '<h2>Privacy Policy</h2><p>Your privacy is of utmost importance to us. Labdhi Herbs collects only essential customer information required to process and dispatch your orders safely. We never sell or share your personal data with third-party marketers.</p>',
  refundPolicy:
    '<h2>Refund &amp; Cancellation Policy</h2><p>We stand behind the authentic quality of every botanical remedy. If you receive a damaged, leaked, or incorrect product, notify us within 48 hours of delivery at support@labdhiherbs.com with photos for immediate resolution or replacement.</p>',
  shippingPolicy:
    '<h2>Shipping Policy</h2><p>Labdhi Herbs delivers across all pin codes in India. Orders are processed from our Surat laboratory. Typical delivery timelines range between 3 to 7 business days depending on location.</p>',
  faq: [
    {
      question: 'Are Labdhi Herbs products 100% chemical-free?',
      answer:
        'Yes, all our formulations are crafted exclusively with pure botanical extracts, essential oils, and traditional herbs without parabens, mineral oils, or synthetic fragrances.',
      order: 1,
      isActive: true,
    },
    {
      question: 'Where are the products manufactured and dispatched from?',
      answer:
        'Every product is freshly formulated and dispatched directly from our dedicated workshop located in Surat, Gujarat.',
      order: 2,
      isActive: true,
    },
    {
      question: 'How long does delivery take across India?',
      answer:
        'Orders are packed and dispatched within 24 hours. Delivery typically takes 3–5 working days for metros and 5–7 working days for other locations.',
      order: 3,
      isActive: true,
    },
  ],
  copyrightText: 'Copyright 2026 © Labdhi Herbs. All rights reserved.',
  copyrightYear: 2026,
  logoLight: '',
  logoDark: '',
  favicon: '',
  banners: [
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
  siteName: 'Labdhi Herbs',
  siteTagline: 'Pure Ayurvedic Formulations',
  supportEmail: 'support@labdhiherbs.com',
  supportPhone: '+91 93283 49328',
  whatsappNumber: '+91 93283 49328',
  address: '40, Jay Ambe Society, Makkai Pool Rd, Adajan, Surat, Gujarat 395009',
  city: 'Surat',
  state: 'Gujarat',
  pincode: '395009',
  googleMapsLink: '',
  social: {
    facebook: 'https://www.facebook.com/Roopotkarsh-Vilepan-106128397412060/?ref=pages_you_manage',
    instagram: 'https://www.instagram.com/labdhiherbs/',
    youtube: '',
    twitter: '',
  },
  // Operations & System Configuration
  maintenanceMode: false,
  gstEnabled: true,
  igst: 18,
  cgst: 9,
  sgst: 9,
  userLoginEnabled: true,
  paymentMode: 'both',
  reviewManagementEnabled: true,
  blogManagementEnabled: true,
  metaTitle: 'Labdhi Herbs — Pure Ayurvedic & Herbal Wellness Formulations',
  metaDescription:
    '100% pure Ayurvedic formulations handcrafted in Surat, Gujarat. Chemical-free hair oils, face packs, and joint care remedies.',
  metaKeywords: 'Labdhi Herbs, Ayurvedic Hair Oil, Surat Gujarat, Herbal Face Pack',
};

interface SiteSettingsContextType {
  settings: SiteSettingsData;
  profile: AdminProfileData;
  loading: boolean;
  refetchSettings: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: DEFAULT_SETTINGS,
  profile: DEFAULT_PROFILE,
  loading: true,
  refetchSettings: async () => {},
});

const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API}/v1/site-settings`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        const activePhone = d.supportPhone || d.profile?.adminPhone || DEFAULT_PROFILE.adminPhone;
        const activeEmail = d.supportEmail || d.profile?.adminEmail || DEFAULT_PROFILE.adminEmail;
        const activeAddress = d.address || d.profile?.address || DEFAULT_PROFILE.address;
        const activeCity = d.city || d.profile?.city || DEFAULT_PROFILE.city;
        const activeState = d.state || d.profile?.state || DEFAULT_PROFILE.state;
        const activeLogo = d.logoLight || d.logoDark || '';

        const mergedProfile: AdminProfileData = {
          ...DEFAULT_PROFILE,
          ...(d.profile || {}),
          adminEmail: activeEmail,
          adminPhone: activePhone,
          address: activeAddress,
          city: activeCity,
          state: activeState,
          country: d.profile?.country || 'India',
          facebook: d.social?.facebook || d.profile?.facebook || DEFAULT_PROFILE.facebook,
          instagram: d.social?.instagram || d.profile?.instagram || DEFAULT_PROFILE.instagram,
          youtube: d.social?.youtube || d.profile?.youtube || '',
          twitter: d.social?.twitter || d.profile?.twitter || '',
        };

        setSettings({
          ...DEFAULT_SETTINGS,
          ...d,
          supportPhone: activePhone,
          supportEmail: activeEmail,
          whatsappNumber: d.whatsappNumber || activePhone,
          address: activeAddress,
          city: activeCity,
          state: activeState,
          logoLight: activeLogo,
          logoDark: activeLogo,
          aboutUs: d.aboutUs?.content ? d.aboutUs : DEFAULT_SETTINGS.aboutUs,
          termsAndConditions: d.termsAndConditions || DEFAULT_SETTINGS.termsAndConditions,
          privacyPolicy: d.privacyPolicy || DEFAULT_SETTINGS.privacyPolicy,
          refundPolicy: d.refundPolicy || DEFAULT_SETTINGS.refundPolicy,
          shippingPolicy: d.shippingPolicy || DEFAULT_SETTINGS.shippingPolicy,
          faq: Array.isArray(d.faq) && d.faq.length > 0 ? d.faq : DEFAULT_SETTINGS.faq,
          banners: Array.isArray(d.banners) && d.banners.length > 0 ? d.banners : DEFAULT_SETTINGS.banners,
          copyrightText: d.copyrightText || DEFAULT_SETTINGS.copyrightText,
          profile: mergedProfile,
        });
      }
    } catch (_) {
      // Offline fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    const handleUpdate = () => {
      fetchSettings();
    };
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        profile: settings.profile,
        loading,
        refetchSettings: fetchSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
