'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { ChevronDown, Globe } from 'lucide-react';

const CURRENCY_FLAGS: Record<string, string> = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AED: '🇦🇪',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
};

const getCurrencyFlag = (code: string): string => CURRENCY_FLAGS[code.toUpperCase()] || '🌐';

interface CurrencySelectorProps {
  variant?: 'header' | 'topbar' | 'mobile' | 'checkout';
  className?: string;
}

export default function CurrencySelector({
  variant = 'header',
  className = '',
}: CurrencySelectorProps) {
  const {
    activeCurrency,
    availableCurrencies,
    setCurrency,
    detectedCountry,
    isLoading,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (isLoading || !activeCurrency) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/40 border border-[#EFE9DD] animate-pulse text-xs text-slate-400">
        <Globe className="w-3.5 h-3.5" />
        <span>INR ₹</span>
      </div>
    );
  }

  // Visual variants
  if (variant === 'topbar') {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select Currency"
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold text-[#D4A373] hover:text-white hover:bg-white/10 transition-colors cursor-pointer select-none"
        >
          <span className="text-xs leading-none">{getCurrencyFlag(activeCurrency.code)}</span>
          <span>{activeCurrency.code}</span>
          <span className="text-white/60">({activeCurrency.symbol})</span>
          <ChevronDown className={`w-3 h-3 text-[#D4A373] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-56 bg-white text-[#1A201C] rounded-2xl shadow-2xl border border-[#EFE9DD] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 border-b border-[#EFE9DD]/70 mb-1">
              <p className="text-[10px] font-bold tracking-wider uppercase text-[#71846C]">Select Currency</p>
              {detectedCountry && (
                <p className="text-[10px] text-slate-500">Detected: {detectedCountry.name}</p>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {availableCurrencies.map((c) => {
                const isSelected = c.code === activeCurrency.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCurrency(c.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F3A2E] text-white font-bold'
                        : 'text-slate-700 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base leading-none">{getCurrencyFlag(c.code)}</span>
                      <span>{c.code} - {c.name}</span>
                    </span>
                    <span className={`font-semibold ${isSelected ? 'text-[#D4A373]' : 'text-slate-500'}`}>
                      {c.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'mobile') {
    return (
      <div className={`w-full ${className}`}>
        <label className="block text-xs font-bold text-[#1F3A2E] uppercase tracking-wider mb-1.5">
          Select Currency
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableCurrencies.map((c) => {
            const isSelected = c.code === activeCurrency.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1F3A2E] bg-[#1F3A2E] text-white shadow-sm'
                    : 'border-[#EFE9DD] bg-white text-slate-700 hover:bg-[#F8F6F0]'
                }`}
              >
                <span className="text-lg mb-0.5">{getCurrencyFlag(c.code)}</span>
                <span className="font-bold">{c.code}</span>
                <span className="text-[10px] opacity-80">{c.symbol}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default 'header' / standard pill variant
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Currency"
        className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/90 hover:bg-[#EFE9DD] text-[#1A201C] hover:text-[#1F3A2E] border border-[#EFE9DD] transition-all cursor-pointer shadow-xs font-semibold text-xs select-none"
      >
        <span className="text-sm leading-none">{getCurrencyFlag(activeCurrency.code)}</span>
        <span className="tracking-wide font-bold">{activeCurrency.code}</span>
        <span className="text-slate-500 font-normal">({activeCurrency.symbol})</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-[#1A201C] rounded-2xl shadow-xl border border-[#EFE9DD] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-4 py-2 border-b border-[#EFE9DD] mb-1">
            <p className="text-[11px] font-bold tracking-wider uppercase text-[#1F3A2E]">
              Select Country & Currency
            </p>
            {detectedCountry && (
              <p className="text-[10px] text-slate-500 mt-0.5">
                Location: {detectedCountry.flag} {detectedCountry.name}
              </p>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {availableCurrencies.map((c) => {
              const isSelected = c.code === activeCurrency.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F3A2E] text-white font-bold'
                      : 'text-slate-700 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{getCurrencyFlag(c.code)}</span>
                    <span>
                      <span className="font-bold">{c.code}</span>
                      <span className="text-[11px] opacity-80 block">{c.name}</span>
                    </span>
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-[#D4A373]' : 'bg-slate-100 text-slate-600'}`}>
                    {c.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
