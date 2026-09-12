'use client';

import React from 'react';
import { CartProvider } from '../context/CartContext';
import { SiteSettingsProvider } from '../context/SiteSettingsContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <CartProvider>{children}</CartProvider>
    </SiteSettingsProvider>
  );
}
