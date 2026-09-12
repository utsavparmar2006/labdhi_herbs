'use client';

import React from 'react';
import PolicyPageLayout from '../../components/PolicyPageLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function PrivacyPage() {
  const { settings } = useSiteSettings();

  return (
    <PolicyPageLayout
      title="Privacy Policy"
      badge="Data Protection"
      subtitle="How Labdhi Herbs collects, protects, and handles your personal information with absolute confidentiality."
      contentHtml={settings.privacyPolicy}
    />
  );
}
