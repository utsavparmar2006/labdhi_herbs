'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface WebsiteLanguageOption {
  code: string;
  name: string;
  nativeName: string;
  country: 'gb' | 'in';
}

// Crisp SVG Flags (solves Windows emoji rendering where flags become "GB" / "IN" letters)
const SVG_FLAGS: Record<string, React.ReactNode> = {
  gb: (
    <svg className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10" viewBox="0 0 640 480">
      <path fill="#012169" d="M0 0h640v480H0z" />
      <path fill="#FFF" d="m75 0 244 181L562 0h78v62L400 240l240 178v62h-80L320 299 79 480H0v-60l239-180L0 60V0h75z" />
      <path fill="#C8102E" d="m424 288 216 162v30h-40L384 318v-30h40zM640 0v10L440 160h40L640 10V0zM0 480v-10l200-150h-40L0 470v10zM216 192 0 30V0h40l216 162v30h-40z" />
      <path fill="#FFF" d="M240 0h160v480H240zM0 160h640v160H0z" />
      <path fill="#C8102E" d="M280 0h80v480h-80zM0 200h640v80H0z" />
    </svg>
  ),
  in: (
    <svg className="w-4 h-4 rounded-full shrink-0 shadow-2xs border border-black/10" viewBox="0 0 640 480">
      <path fill="#FF9933" d="M0 0h640v160H0z" />
      <path fill="#FFFFFF" d="M0 160h640v160H0z" />
      <path fill="#128807" d="M0 320h640v160H0z" />
      <circle cx="320" cy="240" r="50" fill="none" stroke="#000080" strokeWidth="6" />
      <circle cx="320" cy="240" r="12" fill="#000080" />
    </svg>
  ),
};

// Default popular languages — ready to be updated with client's custom list
export const WEBSITE_LANGUAGES: WebsiteLanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', country: 'gb' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', country: 'in' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', country: 'in' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', country: 'in' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', country: 'in' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', country: 'in' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', country: 'in' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬી', country: 'in' },
];

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize and load the Google Translation script once
  useEffect(() => {
    // Read existing cookie if present
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

      // Add script tag if not already present
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Change language across full website
  const handleSelectLanguage = (code: string) => {
    setSelectedLang(code);
    setIsOpen(false);

    if (typeof document === 'undefined') return;

    if (code === 'en') {
      // Clear cookie for original English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${window.location.hostname}; path=/;`;
      window.location.reload();
      return;
    }

    // Set cookie across domains and paths for Google Translate
    const cookieValue = `/en/${code}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/;`;

    // Trigger select element if already loaded
    const select = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const currentOption =
    WEBSITE_LANGUAGES.find((l) => l.code === selectedLang) || WEBSITE_LANGUAGES[0];

  // =========================================================================
  // TOPBAR VARIANT: Compact pill for the announcement bar
  // =========================================================================
  if (variant === 'topbar') {
    return (
      <div className={`relative inline-block notranslate ${className}`} ref={dropdownRef} translate="no">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-[#D4A373] transition-colors cursor-pointer"
        >
          {SVG_FLAGS[currentOption.country] || SVG_FLAGS.in}
          <span>{currentOption.nativeName}</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-1.5 w-44 bg-white text-slate-800 rounded-xl shadow-xl border border-[#EFE9DD] py-1.5 z-50 overflow-hidden"
            >
              <div
                className="max-h-56 overflow-y-auto overscroll-contain py-1 text-xs custom-scrollbar"
                data-lenis-prevent="true"
                onWheel={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                {WEBSITE_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F3A2E]/10 text-[#1F3A2E] font-bold'
                          : 'hover:bg-[#F8F6F0] text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {SVG_FLAGS[lang.country] || SVG_FLAGS.in}
                        <span>{lang.nativeName}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#1F3A2E]" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // =========================================================================
  // MOBILE VARIANT: Full width section for Mobile Menu Drawer
  // =========================================================================
  if (variant === 'mobile') {
    return (
      <div className={`w-full notranslate ${className}`} translate="no">
        <div className="p-3 rounded-xl bg-white border border-[#EFE9DD] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1F3A2E] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#B58A5A]" />
              <span>Website Language</span>
            </span>
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              {SVG_FLAGS[currentOption.country] || SVG_FLAGS.in}
              <span>{currentOption.nativeName}</span>
            </span>
          </div>

          <div
            className="grid grid-cols-2 gap-1.5 pt-1 max-h-52 overflow-y-auto overscroll-contain custom-scrollbar"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {WEBSITE_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1F3A2E] text-white shadow-xs font-bold'
                      : 'bg-[#F8F6F0] text-slate-700 hover:bg-[#EFE9DD]'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    {SVG_FLAGS[lang.country] || SVG_FLAGS.in}
                    <span className="truncate">{lang.nativeName}</span>
                  </span>
                  {isSelected && <Check className="w-3 h-3 text-[#D4A373] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // HEADER VARIANT (DEFAULT): Elegant pill for desktop navbar
  // =========================================================================
  return (
    <div className={`relative inline-block notranslate ${className}`} ref={dropdownRef} translate="no">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-2xl bg-white/80 hover:bg-[#EFE9DD] border border-[#EFE9DD] text-[#1A201C] hover:text-[#1F3A2E] text-xs font-bold shadow-xs hover:shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        title="Select Website Language"
      >
        <Globe className="w-3.5 h-3.5 text-[#B58A5A]" />
        <span className="hidden lg:inline">{SVG_FLAGS[currentOption.country] || SVG_FLAGS.in}</span>
        <span>{currentOption.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#EFE9DD] py-2 z-50 overflow-hidden"
          >
            <div className="px-3.5 py-1.5 border-b border-[#EFE9DD]/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Select Language</span>
              <Globe className="w-3 h-3 text-[#B58A5A]" />
            </div>

            <div
              className="max-h-64 overflow-y-auto overscroll-contain py-1 text-xs custom-scrollbar"
              data-lenis-prevent="true"
              onWheel={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              {WEBSITE_LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F3A2E]/10 text-[#1F3A2E] font-bold'
                        : 'hover:bg-[#F8F6F0] text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {SVG_FLAGS[lang.country] || SVG_FLAGS.in}
                      <div>
                        <span className="font-semibold block leading-tight">{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">{lang.name}</span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1F3A2E]" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
