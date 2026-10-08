'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useSiteSettings, CurrencyConfigItem } from './SiteSettingsContext';
import {
  CountryInfo,
  GLOBAL_COUNTRIES,
  COUNTRIES_BY_CODE,
  DEFAULT_CURRENCIES,
  detectLocalCountryAndCurrency,
} from '@/utils/geoCurrency';

// High-speed static formatters to avoid re-instantiating Intl objects on every render
const inrStaticFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const foreignStaticFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

interface CurrencyContextType {
  currentCurrency: CurrencyConfigItem;
  currencies: CurrencyConfigItem[];
  setCurrencyCode: (code: string) => void;
  customerCountry: CountryInfo;
  setCustomerCountry: (country: CountryInfo) => void;
  formatPrice: (inrAmount: number, options?: { showCode?: boolean }) => string;
  convertPrice: (inrAmount: number) => { amount: number; formatted: string; symbol: string; code: string };
  isLoaded: boolean;
}

const DEFAULT_INR_CURRENCY: CurrencyConfigItem = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
  exchangeRate: 1,
  isActive: true,
  isDefault: true,
};

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: DEFAULT_INR_CURRENCY,
  currencies: DEFAULT_CURRENCIES,
  setCurrencyCode: () => {},
  customerCountry: GLOBAL_COUNTRIES[0],
  setCustomerCountry: () => {},
  formatPrice: (inrAmount: number) => `₹${Math.round(inrAmount).toLocaleString('en-IN')}`,
  convertPrice: (inrAmount: number) => ({
    amount: inrAmount,
    formatted: `₹${Math.round(inrAmount).toLocaleString('en-IN')}`,
    symbol: '₹',
    code: 'INR',
  }),
  isLoaded: false,
});

const STORAGE_KEY = 'labdhi_customer_currency';
const COUNTRY_STORAGE_KEY = 'labdhi_customer_country';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSiteSettings();

  // Combine site settings currencies with default currencies
  const availableCurrencies: CurrencyConfigItem[] = useMemo(() => {
    if (settings.currencies && settings.currencies.length > 0) {
      return settings.currencies.filter((c) => c.isActive !== false);
    }
    return DEFAULT_CURRENCIES.filter((c) => c.isActive !== false);
  }, [settings.currencies]);

  const [currentCurrencyCode, setCurrentCurrencyCode] = useState<string>('INR');
  const [customerCountry, setCustomerCountryState] = useState<CountryInfo>(GLOBAL_COUNTRIES[0]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize geo-detection and storage hydration
  useEffect(() => {
    try {
      const savedCode = localStorage.getItem(STORAGE_KEY);
      const savedCountryCode = localStorage.getItem(COUNTRY_STORAGE_KEY);

      if (savedCode) {
        setCurrentCurrencyCode(savedCode);
        if (savedCountryCode) {
          const matchedCountry = COUNTRIES_BY_CODE.get(savedCountryCode);
          if (matchedCountry) {
            setCustomerCountryState(matchedCountry);
          }
        }
      } else {
        // Zero-Cost Automatic Geo-Detection via native Intl
        const detected = detectLocalCountryAndCurrency();
        setCustomerCountryState(detected.country);
        setCurrentCurrencyCode(detected.currencyCode);
      }
    } catch (_) {
      // Fallback to INR
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const currentCurrency = useMemo(() => {
    const found = availableCurrencies.find((c) => c.code === currentCurrencyCode);
    if (found) return found;

    // Default currency or INR
    const defaultCurr = availableCurrencies.find((c) => c.isDefault) || availableCurrencies[0];
    return defaultCurr || DEFAULT_INR_CURRENCY;
  }, [availableCurrencies, currentCurrencyCode]);

  const setCurrencyCode = useCallback((code: string) => {
    setCurrentCurrencyCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (_) {}
  }, []);

  const setCustomerCountry = useCallback((country: CountryInfo) => {
    setCustomerCountryState(country);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country.code);
    } catch (_) {}
  }, []);

  // Format INR price into the currently active currency (Ultra-Fast via pre-warmed Intl formatters)
  const formatPrice = useCallback(
    (inrAmount: number, options?: { showCode?: boolean }): string => {
      const val = Number(inrAmount) || 0;
      if (val === 0) {
        return `${currentCurrency.symbol}0`;
      }

      if (currentCurrency.code === 'INR') {
        const formatted = inrStaticFormatter.format(Math.round(val));
        return options?.showCode ? `₹${formatted} INR` : `₹${formatted}`;
      }

      // Foreign Currency calculation: inrAmount / exchangeRate (e.g. 850 INR / 85 = 10.00 USD)
      const rate = currentCurrency.exchangeRate > 0 ? currentCurrency.exchangeRate : 1;
      const converted = val / rate;
      const formatted = foreignStaticFormatter.format(converted);

      if (options?.showCode) {
        return `${currentCurrency.symbol}${formatted} ${currentCurrency.code}`;
      }
      return `${currentCurrency.symbol}${formatted}`;
    },
    [currentCurrency]
  );

  const convertPrice = useCallback(
    (inrAmount: number) => {
      const val = Number(inrAmount) || 0;
      const rate = currentCurrency.exchangeRate > 0 ? currentCurrency.exchangeRate : 1;
      const converted = currentCurrency.code === 'INR' ? Math.round(val) : Number((val / rate).toFixed(2));
      return {
        amount: converted,
        formatted: formatPrice(val),
        symbol: currentCurrency.symbol,
        code: currentCurrency.code,
      };
    },
    [currentCurrency, formatPrice]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        currencies: availableCurrencies,
        setCurrencyCode,
        customerCountry,
        setCustomerCountry,
        formatPrice,
        convertPrice,
        isLoaded,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
