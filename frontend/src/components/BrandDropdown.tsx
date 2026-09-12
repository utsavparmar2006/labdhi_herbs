'use me';
'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BRANDS = ['All Brands', 'Labdhi Herbs', 'Labdhi Hurbs'];

interface BrandDropdownProps {
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
}

export default function BrandDropdown({ selectedBrand, onSelectBrand }: BrandDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
          selectedBrand !== 'All'
            ? 'bg-[#B58A5A] text-white border-[#B58A5A]'
            : 'bg-white text-[#1A201C] border-[#1F3A2E]/20 hover:border-[#1F3A2E]'
        }`}
      >
        <ShieldCheck className={`w-3.5 h-3.5 ${selectedBrand !== 'All' ? 'text-white' : 'text-[#B58A5A]'}`} />
        <span>Brand: {selectedBrand}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-[#EFE9DD] shadow-xl py-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-[#EFE9DD]/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Filter By Brand
            </div>

            <div className="py-1">
              {BRANDS.map((brand) => {
                const isSelected = (selectedBrand === 'All' && brand === 'All Brands') || selectedBrand === brand;
                const value = brand === 'All Brands' ? 'All' : brand;
                return (
                  <button
                    key={brand}
                    onClick={() => {
                      onSelectBrand(value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F3A2E] text-white'
                        : 'text-slate-700 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
                    }`}
                  >
                    <span>{brand}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373]" />}
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
