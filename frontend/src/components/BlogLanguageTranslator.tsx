'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

interface BlogLanguageTranslatorProps {
  selectedLang?: string;
  onLanguageChange?: (langCode: string) => void;
  isTranslating?: boolean;
  variant?: 'hero' | 'compact';
  className?: string;
}

export default function BlogLanguageTranslator({
  selectedLang = 'en',
  onLanguageChange,
  isTranslating = false,
  variant = 'hero',
  className = '',
}: BlogLanguageTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(code);
    }
  };

  const currentOption =
    POPULAR_LANGUAGES.find((l) => l.code === selectedLang) || POPULAR_LANGUAGES[0];

  // =========================================================================
  // COMPACT VARIANT: For Article Reader Header
  // =========================================================================
  if (variant === 'compact') {
    return (
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1.5 rounded-full bg-white border border-[#EFE9DD] hover:border-[#1F3A2E]/30 text-xs font-semibold text-[#1F3A2E] shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          title="Translate Article"
        >
          {isTranslating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#B58A5A]" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-[#B58A5A]" />
          )}
          <span>{currentOption.nativeName}</span>
          <ChevronDown
            className={`w-3 h-3 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#EFE9DD] py-2 z-50 overflow-hidden"
            >
              <div className="px-3 py-1.5 border-b border-[#EFE9DD]/60 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Article Language</span>
                {isTranslating && <RefreshCw className="w-3 h-3 animate-spin text-[#B58A5A]" />}
              </div>

              <div className="max-h-60 overflow-y-auto py-1 text-xs custom-scrollbar" data-lenis-prevent="true">
                {POPULAR_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F3A2E]/10 text-[#1F3A2E] font-bold'
                          : 'hover:bg-[#F8F6F0] text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <div>
                          <span className="font-medium block leading-tight">
                            {lang.nativeName}
                          </span>
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

  // =========================================================================
  // HERO VARIANT: For Blog Hero Banner
  // =========================================================================
  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`} ref={dropdownRef}>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Left Indicator */}
        <div className="flex items-center gap-2.5 text-xs text-white">
          <div className="w-8 h-8 rounded-xl bg-[#D4A373]/20 border border-[#D4A373]/40 flex items-center justify-center text-[#D4A373] shrink-0">
            {isTranslating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#D4A373]" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-white">Read Blog in Your Language</span>
              <span className="text-[10px] bg-[#D4A373] text-[#1F3A2E] px-1.5 py-0.2 rounded-full font-bold">
                Blog Only
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-light">
              પોતાની ભાષામાં વાંચો • अपनी भाषा में पढ़ें
            </p>
          </div>
        </div>

        {/* Quick Language Chips + Dropdown */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-end">
          {/* Top Quick Pills (English, Gujarati, Hindi) */}
          {[
            { code: 'en', label: 'English' },
            { code: 'gu', label: 'ગુજરાતી' },
            { code: 'hi', label: 'हिन्दी' },
          ].map((quick) => {
            const isActive = selectedLang === quick.code;
            return (
              <button
                key={quick.code}
                onClick={() => handleSelect(quick.code)}
                disabled={isTranslating}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#D4A373] text-[#1F3A2E] shadow-xs'
                    : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
              >
                {quick.label}
              </button>
            );
          })}

          {/* More Languages Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold inline-flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>More</span>
              <ChevronDown
                className={`w-3 h-3 text-[#D4A373] transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-[#EFE9DD] py-2 z-50 text-slate-800 overflow-hidden"
                >
                  <div className="px-3 py-1.5 border-b border-[#EFE9DD] text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Select Language</span>
                    {isTranslating && (
                      <RefreshCw className="w-3 h-3 animate-spin text-[#B58A5A]" />
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1 text-xs">
                    {POPULAR_LANGUAGES.map((lang) => {
                      const isSelected = selectedLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleSelect(lang.code)}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1F3A2E]/10 text-[#1F3A2E] font-bold'
                              : 'hover:bg-[#F8F6F0] text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <div>
                              <span className="font-semibold block leading-tight">
                                {lang.nativeName}
                              </span>
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
        </div>
      </div>
    </div>
  );
}
