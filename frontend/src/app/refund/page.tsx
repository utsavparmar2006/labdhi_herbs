'use client';

import React from 'react';
import PolicyPageLayout from '../../components/PolicyPageLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function RefundPage() {
  const { settings } = useSiteSettings();

  return (
    <PolicyPageLayout
      title="Refund & Cancellation Policy"
      badge="Customer Protection"
      subtitle="Details regarding replacements, cancellations, and refunds for authentic botanical purchases."
      contentHtml={settings.refundPolicy}
    />
  );
}
