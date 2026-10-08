/**
 * Zero-Cost Geography & Currency Detection Utility
 * Uses native browser Intl API + Country Directory (100% Free, no paid APIs)
 */

export interface CountryInfo {
  code: string; // ISO 2-letter
  name: string;
  flag: string;
  dialCode: string;
  currency: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number; // 1 Foreign Unit = X INR (e.g. USD: 85 means 1 USD = 85 INR)
  isActive: boolean;
  isDefault?: boolean;
}

export const DEFAULT_CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', exchangeRate: 1, isActive: true, isDefault: true },
  { code: 'USD', symbol: '$', name: 'US Dollar', exchangeRate: 85, isActive: true, isDefault: false },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', exchangeRate: 23, isActive: true, isDefault: false },
  { code: 'GBP', symbol: '£', name: 'British Pound', exchangeRate: 110, isActive: true, isDefault: false },
  { code: 'EUR', symbol: '€', name: 'Euro', exchangeRate: 92, isActive: true, isDefault: false },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', exchangeRate: 62, isActive: true, isDefault: false },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', exchangeRate: 56, isActive: true, isDefault: false },
];

/**
 * Standard list of countries with dial codes, flags & default assigned currency
 */
export const GLOBAL_COUNTRIES: CountryInfo[] = [
  { code: 'IN', name: 'India', flag: '🇮🇳', dialCode: '+91', currency: 'INR' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1', currency: 'USD' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', currency: 'AED' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', currency: 'GBP' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1', currency: 'CAD' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61', currency: 'AUD' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', currency: 'AED' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', dialCode: '+968', currency: 'AED' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', dialCode: '+974', currency: 'AED' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', dialCode: '+965', currency: 'AED' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', dialCode: '+973', currency: 'AED' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49', currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33', currency: 'EUR' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39', currency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', currency: 'EUR' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', currency: 'EUR' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', dialCode: '+353', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', dialCode: '+32', currency: 'EUR' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', dialCode: '+43', currency: 'EUR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', dialCode: '+46', currency: 'EUR' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', dialCode: '+47', currency: 'EUR' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', dialCode: '+45', currency: 'EUR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', dialCode: '+65', currency: 'USD' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', currency: 'AUD' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', currency: 'USD' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27', currency: 'USD' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', dialCode: '+81', currency: 'USD' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', dialCode: '+66', currency: 'USD' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', currency: 'USD' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', dialCode: '+63', currency: 'USD' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', dialCode: '+852', currency: 'USD' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵', dialCode: '+977', currency: 'INR' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', currency: 'USD' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', currency: 'USD' },
  { code: 'MU', name: 'Mauritius', flag: '🇲🇺', dialCode: '+230', currency: 'USD' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254', currency: 'USD' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', dialCode: '+255', currency: 'USD' },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', dialCode: '+256', currency: 'USD' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', currency: 'USD' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', dialCode: '+20', currency: 'USD' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', dialCode: '+972', currency: 'USD' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', dialCode: '+90', currency: 'USD' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', dialCode: '+30', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', dialCode: '+351', currency: 'EUR' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', dialCode: '+48', currency: 'EUR' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', currency: 'EUR' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', dialCode: '+36', currency: 'EUR' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', dialCode: '+40', currency: 'EUR' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', dialCode: '+358', currency: 'EUR' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', dialCode: '+52', currency: 'USD' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', dialCode: '+55', currency: 'USD' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', dialCode: '+54', currency: 'USD' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', dialCode: '+56', currency: 'USD' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', dialCode: '+57', currency: 'USD' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', dialCode: '+51', currency: 'USD' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', dialCode: '+7', currency: 'USD' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', dialCode: '+82', currency: 'USD' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', currency: 'USD' },
  { code: 'OTHER', name: 'Other International Country', flag: '🌐', dialCode: '+', currency: 'USD' },
];

/**
 * Pre-indexed O(1) Lookup Maps for High-Performance Rendering
 */
export const COUNTRIES_BY_CODE = new Map<string, CountryInfo>(
  GLOBAL_COUNTRIES.map((c) => [c.code, c])
);

export const COUNTRIES_BY_NAME = new Map<string, CountryInfo>(
  GLOBAL_COUNTRIES.map((c) => [c.name.toLowerCase(), c])
);

/**
 * Detect customer country and currency using native browser timezone
 * 100% Free, zero network requests, instant O(1) execution
 */
export function detectLocalCountryAndCurrency(): { country: CountryInfo; currencyCode: string } {
  const indiaDefault = GLOBAL_COUNTRIES[0];
  if (typeof window === 'undefined') {
    return { country: indiaDefault, currencyCode: 'INR' };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // 1. India
    if (tz === 'Asia/Kolkata' || tz === 'Asia/Calcutta') {
      return { country: indiaDefault, currencyCode: 'INR' };
    }

    // 2. Middle East / UAE / Gulf
    if (tz.includes('Dubai') || tz.includes('Muscat')) {
      return { country: COUNTRIES_BY_CODE.get('AE') || indiaDefault, currencyCode: 'AED' };
    }
    if (tz.includes('Riyadh') || tz.includes('Qatar') || tz.includes('Kuwait') || tz.includes('Bahrain')) {
      return { country: COUNTRIES_BY_CODE.get('SA') || indiaDefault, currencyCode: 'AED' };
    }

    // 3. United Kingdom
    if (tz.includes('London') || tz.includes('Belfast')) {
      return { country: COUNTRIES_BY_CODE.get('GB') || indiaDefault, currencyCode: 'GBP' };
    }

    // 4. Canada
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal') || tz.includes('Edmonton') || tz.includes('Winnipeg')) {
      return { country: COUNTRIES_BY_CODE.get('CA') || indiaDefault, currencyCode: 'CAD' };
    }

    // 5. Australia
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth') || tz.includes('Adelaide')) {
      return { country: COUNTRIES_BY_CODE.get('AU') || indiaDefault, currencyCode: 'AUD' };
    }

    // 6. Europe
    if (
      tz.startsWith('Europe/') ||
      tz.includes('Berlin') ||
      tz.includes('Paris') ||
      tz.includes('Rome') ||
      tz.includes('Madrid') ||
      tz.includes('Amsterdam')
    ) {
      return { country: COUNTRIES_BY_CODE.get('DE') || indiaDefault, currencyCode: 'EUR' };
    }

    // 7. United States (America/*)
    if (tz.startsWith('America/')) {
      return { country: COUNTRIES_BY_CODE.get('US') || indiaDefault, currencyCode: 'USD' };
    }
  } catch (_) {
    // fallback
  }

  // Universal Default Fallback for all other global regions: USD
  const usFallback = COUNTRIES_BY_CODE.get('US') || indiaDefault;
  return { country: usFallback, currencyCode: 'USD' };
}
