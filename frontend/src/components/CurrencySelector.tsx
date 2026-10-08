'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/context/CurrencyContext';

const CURRENCY_FLAGS: Record<string, string> = {
  INR: '🇮🇳',
  USD: '🇺🇸',
  AED: '🇦🇪',
  GBP: '🇬🇧',
  EUR: '🇪🇺',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
};

interface CurrencySelectorProps {
  className?: string;
  compact?: boolean;
}

export default function CurrencySelector({ className = '', compact = false }: CurrencySelectorProps) {
  const { currentCurrency, currencies, setCurrencyCode } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const flag = CURRENCY_FLAGS[currentCurrency.code] || '🌐';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border border-stone-200/80 bg-white/90 text-stone-700 hover:text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-sm transition-all duration-150 backdrop-blur-sm cursor-pointer select-none ${
          compact ? 'text-[11px] px-2 py-0.5' : ''
        }`}
        title={`Select Currency (Currently: ${currentCurrency.name})`}
        aria-label="Currency Selector"
      >
        <span className="text-sm leading-none" role="img" aria-label={currentCurrency.code}>
          {flag}
        </span>
        <span className="tracking-tight">{currentCurrency.code}</span>
        <span className="text-stone-400 font-mono text-[10px]">({currentCurrency.symbol})</span>
        <svg
          className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 rounded-xl bg-white shadow-xl border border-stone-100 ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 bg-gradient-to-r from-emerald-50 to-stone-50 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
              Select Currency
            </span>
            <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-full font-medium">
              Global
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-stone-50">
            {currencies.map((curr) => {
              const isSelected = curr.code === currentCurrency.code;
              const currFlag = CURRENCY_FLAGS[curr.code] || '🌐';

              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => {
                    setCurrencyCode(curr.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/80 text-emerald-900 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{currFlag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-stone-800">
                        {curr.code} <span className="text-stone-400 font-mono text-[11px]">({curr.symbol})</span>
                      </span>
                      <span className="text-[10px] text-stone-400 leading-tight truncate max-w-[120px]">
                        {curr.name}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 bg-stone-50/80 border-t border-stone-100 text-[10px] text-stone-500 text-center flex items-center justify-center gap-1">
            <span>✈️</span>
            <span>Worldwide Shipping Available</span>
          </div>
        </div>
      )}
    </div>
  );
}
