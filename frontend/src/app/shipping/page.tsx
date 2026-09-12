'use client';

import React from 'react';
import PolicyPageLayout from '../../components/PolicyPageLayout';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function ShippingPage() {
  const { settings } = useSiteSettings();

  return (
    <PolicyPageLayout
      title="Shipping & Delivery Policy"
      badge="Express Dispatch"
      subtitle="Information on shipping timelines, carrier partners, tracking, and delivery across India."
      contentHtml={settings.shippingPolicy}
    />
  );
}
