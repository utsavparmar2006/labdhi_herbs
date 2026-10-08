'use client';

import React, { useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import { SiteSettingsProvider } from '../context/SiteSettingsContext';
import { CurrencyProvider } from '../context/CurrencyContext';

/**
 * Automatically wipes any legacy Google Translate browser cookies
 * so that Home, Shop, and other store pages remain 100% in pure English.
 */
function CookieCleanupManager() {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const domain = window.location.hostname;
      document.cookie = 'googtrans=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = `googtrans=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      if (domain.startsWith('www.')) {
        document.cookie = `googtrans=; Path=/; Domain=${domain.substring(4)}; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }
  }, []);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SiteSettingsProvider>
      <CurrencyProvider>
        <CartProvider>
          <CookieCleanupManager />
          {children}
        </CartProvider>
      </CurrencyProvider>
    </SiteSettingsProvider>
  );
}
