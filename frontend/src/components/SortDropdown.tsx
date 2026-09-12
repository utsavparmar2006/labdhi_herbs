'use me';
'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SortOption {
  id: string;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { id: 'featured', label: 'Sort by: Featured' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
  { id: 'rating', label: 'Highest Rated' },
];

interface SortDropdownProps {
  selectedSort: string;
  onSelectSort: (sortOption: string) => void;
}

export default function SortDropdown({ selectedSort, onSelectSort }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel = SORT_OPTIONS.find((opt) => opt.id === selectedSort)?.label || 'Sort by: Featured';

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
        className="px-4 py-2.5 rounded-full bg-white border border-[#1F3A2E]/30 hover:border-[#1F3A2E] text-xs font-semibold text-[#1A201C] flex items-center gap-2 shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1F3A2E]/20"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-[#1F3A2E]" />
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Custom Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#EFE9DD] shadow-xl py-2 z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-[#EFE9DD]/60 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sort Formulations
            </div>

            <div className="py-1">
              {SORT_OPTIONS.map((option) => {
                const isSelected = selectedSort === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSelectSort(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-xs font-semibold text-left transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#1F3A2E] text-white'
                        : 'text-slate-700 hover:bg-[#F8F6F0] hover:text-[#1F3A2E]'
                    }`}
                  >
                    <span>{option.label}</span>
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
