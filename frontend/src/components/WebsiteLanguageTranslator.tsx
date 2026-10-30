'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Check, ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ALL_LANGUAGES,
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
  LanguageItem,
  findLanguage,
} from '../utils/languages';

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

interface WebsiteLanguageTranslatorProps {
  variant?: 'header' | 'topbar' | 'mobile';
  className?: string;
}

export default function WebsiteLanguageTranslator({
  variant = 'header',
  className = '',
}: WebsiteLanguageTranslatorProps) {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Read existing language cookie on load
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^|;)\s*googtrans=([^;]+)/);
      if (match && match[2]) {
        const parts = match[2].split('/');
        const code = parts[parts.length - 1];
        if (code) setSelectedLang(code);
      }
    }

    if (typeof window !== 'undefined' && !window.googleTranslateElementInit) {
      window.googleTranslateElementInit = function () {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              autoDisplay: false,
            },
            'google_translate_element'
          );
        }
      };

      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Filtered languages based on search query
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    return ALL_LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Change website language
  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setIsOpen(false);
    setSearchQuery('');

    if (typeof document === 'undefined') return;

    if (code === 'en') {
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
      window.location.reload();
      return;
    }

    const cookieValue = `/en/${code}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/;`;

    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const currentOption = findLanguage(selectedLang);

  // Helper render language row
  const renderLanguageButton = (lang: LanguageItem) => {
    const isSelected = selectedLang === lang.code;
    return (
      <button
        key={lang.code}
        onClick={() => handleSelectLanguage(lang.code)}
        className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer rounded-xl ${
          isSelected
            ? 'bg-[#1F3A2E] text-white font-bold shadow-xs'
            : 'hover:bg-[#F8F6F0] text-slate-700'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className={`w-5 h-5 rounded-full text-[9px] font-bold uppercase flex items-center justify-center shrink-0 ${
              isSelected
                ? 'bg-[#D4A373] text-[#1F3A2E]'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {lang.code.slice(0, 2)}
          </span>
          <div className="truncate">
            <span className="font-semibold block leading-tight text-xs truncate">
              {lang.nativeName}
            </span>
            <span
              className={`text-[10px] block truncate ${
                isSelected ? 'text-emerald-200' : 'text-slate-400'
              }`}
            >
              {lang.name}
            </span>
          </div>
        </div>
        {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373] shrink-0" />}
      </button>
    );
  };

  // =========================================================================
  // MOBILE VARIANT: For inside the mobile drawer
  // =========================================================================
  if (variant === 'mobile') {
    return (
      <div className={`w-full notranslate ${className}`} translate="no">
        <div className="p-3 rounded-2xl bg-white border border-[#EFE9DD] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1F3A2E] flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#B58A5A]" />
              <span>Select Website Language</span>
            </span>
            <span className="text-[11px] font-bold text-[#B58A5A] bg-[#F8F6F0] px-2 py-0.5 rounded-lg border border-[#EFE9DD]">
              {currentOption.nativeName}
            </span>
          </div>

          {/* Search box for mobile */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 100+ languages..."
              className="w-full pl-8 pr-7 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Languages list */}
          <div
            className="max-h-56 overflow-y-auto overscroll-contain space-y-1 custom-scrollbar pr-1"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {filteredLanguages ? (
              filteredLanguages.length > 0 ? (
                filteredLanguages.map(renderLanguageButton)
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No language found for &quot;{searchQuery}&quot;
                </div>
              )
            ) : (
              <>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-1 pb-0.5">
                  ⭐ Popular &amp; Indian Languages
                </div>
                {INDIAN_LANGUAGES.map(renderLanguageButton)}
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2 pb-0.5">
                  🌐 All World Languages (100+)
                </div>
                {INTERNATIONAL_LANGUAGES.map(renderLanguageButton)}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TOPBAR VARIANT: Compact pill for announcement bar
  // =========================================================================
  if (variant === 'topbar') {
    return (
      <div className={`relative inline-block notranslate ${className}`} ref={dropdownRef} translate="no">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-[#D4A373] transition-colors cursor-pointer border border-[#D4A373]/30"
        >
          <Globe className="w-3 h-3 text-[#D4A373]" />
          <span>{currentOption.nativeName}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
              />
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="fixed inset-x-3 top-12 max-w-[340px] mx-auto sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:absolute sm:w-72 sm:max-w-none bg-white text-slate-800 rounded-2xl shadow-2xl border border-[#EFE9DD] p-2 z-50 overflow-hidden"
              >
              {/* Search Header */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 100+ languages..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] text-xs focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Scrollable list */}
              <div
                className="max-h-64 overflow-y-auto overscroll-contain space-y-1 custom-scrollbar pr-1"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {filteredLanguages ? (
                  filteredLanguages.length > 0 ? (
                    filteredLanguages.map(renderLanguageButton)
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      No language found for &quot;{searchQuery}&quot;
                    </div>
                  )
                ) : (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
                      ⭐ Popular Indian Languages
                    </div>
                    {INDIAN_LANGUAGES.map(renderLanguageButton)}
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2 py-0.5">
                      🌐 All World Languages (100+)
                    </div>
                    {INTERNATIONAL_LANGUAGES.map(renderLanguageButton)}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // HEADER VARIANT (DEFAULT): Clean, responsive-optimized pill on the side
  // =========================================================================
  return (
    <div className={`relative inline-block notranslate ${className}`} ref={dropdownRef} translate="no">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-[38px] sm:h-[44px] px-2.5 sm:px-3.5 rounded-2xl bg-white/80 hover:bg-[#EFE9DD] border border-[#EFE9DD] text-[#1A201C] hover:text-[#1F3A2E] text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shrink-0"
        title="Change Website Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#B58A5A] shrink-0" />
        {/* On mobile: show compact code (EN, GU, HI); on desktop: show full native name */}
        <span className="hidden sm:inline font-semibold">{currentOption.nativeName}</span>
        <span className="sm:hidden font-bold uppercase text-[11px] text-[#1F3A2E]">{currentOption.code.slice(0, 2)}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile dimmed backdrop to focus dialog and prevent outside touch bleed */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
            />

            {/* Dropdown Card: Fixed & centered on mobile, attached absolute on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-x-3 top-20 max-w-[360px] mx-auto sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:absolute sm:w-80 sm:max-w-none bg-white rounded-2xl shadow-2xl border border-[#EFE9DD] p-2.5 z-50 overflow-hidden"
            >
              {/* Header Title with Close Button */}
              <div className="px-1.5 py-1 flex items-center justify-between border-b border-[#EFE9DD] pb-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#B58A5A]" />
                  <span>Select Language ({ALL_LANGUAGES.length}+)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full truncate max-w-[90px] sm:max-w-[120px]">
                    {currentOption.nativeName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Search Filter Box */}
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search language / ભાષા શોધો..."
                  className="w-full pl-8 pr-7 py-2 rounded-xl border border-[#EFE9DD] bg-[#F8F6F0] text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1F3A2E] placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Scrollable Language List */}
              <div
                className="max-h-72 overflow-y-auto overscroll-contain space-y-1 custom-scrollbar pr-1"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {filteredLanguages ? (
                  filteredLanguages.length > 0 ? (
                    <>
                      <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-0.5">
                        Found {filteredLanguages.length} Results
                      </div>
                      {filteredLanguages.map(renderLanguageButton)}
                    </>
                  ) : (
                    <div className="text-center py-6 text-xs text-slate-400 space-y-1">
                      <p>No language matches &quot;{searchQuery}&quot;</p>
                      <p className="text-[10px] text-slate-300">Try searching English, Hindi, Gujarati, etc.</p>
                    </div>
                  )
                ) : (
                  <>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5">
                      ⭐ Popular Indian Languages
                    </div>
                    {INDIAN_LANGUAGES.map(renderLanguageButton)}

                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pt-2 py-0.5 border-t border-[#EFE9DD]/60 mt-1">
                      🌐 All World Languages ({INTERNATIONAL_LANGUAGES.length})
                    </div>
                    {INTERNATIONAL_LANGUAGES.map(renderLanguageButton)}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
