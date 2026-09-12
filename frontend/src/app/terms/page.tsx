'use client';

import React from 'react';
import PolicyPageLayout from '../../components/PolicyPageLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function TermsPage() {
  const { settings } = useSiteSettings();

  return (
    <PolicyPageLayout
      title="Terms & Conditions"
      badge="Legal Assurance"
      subtitle="Guidelines, terms, and purchase conditions governing Labdhi Herbs authentic herbal formulations."
      contentHtml={settings.termsAndConditions}
    />
  );
}
