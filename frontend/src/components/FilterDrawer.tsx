'use me';
'use client';

import { CATEGORIES } from '../services/mockData';
import { X, Filter, RotateCcw, Check } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onClearAll: () => void;
}

const BRANDS = ['Labdhi Herbs', 'Labdhi Hurbs'];

export default function FilterDrawer({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  onClearAll,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#F8F6F0] shadow-2xl border-l border-[#EFE9DD] flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EFE9DD] flex items-center justify-between bg-[#1F3A2E] text-white">
            <div className="flex items-center gap-2 font-serif text-lg font-bold">
              <Filter className="w-4 h-4 text-[#D4A373]" />
              <span>Filter Formulations</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Body */}
          <div className="p-6 flex-1 overflow-y-auto space-y-8">
            
            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-[#1A201C] uppercase tracking-wider">Categories</h4>
              <div className="space-y-2">
                <button
                  onClick={() => onSelectCategory('All')}
                  className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategory === 'All'
                      ? 'bg-[#1F3A2E] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-[#EFE9DD]'
                  }`}
                >
                  <span>All Categories</span>
                  {selectedCategory === 'All' && <Check className="w-4 h-4" />}
                </button>

                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory.toLowerCase() === cat.slug.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onSelectCategory(cat.slug)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F3A2E] text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-[#EFE9DD]'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Brand Filter */}
            <div className="space-y-3 pt-6 border-t border-[#EFE9DD]">
              <h4 className="font-semibold text-xs text-[#1A201C] uppercase tracking-wider">Brands</h4>
              <div className="space-y-2">
                <button
                  onClick={() => onSelectBrand('All')}
                  className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedBrand === 'All'
                      ? 'bg-[#1F3A2E] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-[#EFE9DD]'
                  }`}
                >
                  <span>All Brands</span>
                  {selectedBrand === 'All' && <Check className="w-4 h-4" />}
                </button>

                {BRANDS.map((brand) => {
                  const isSelected = selectedBrand === brand;
                  return (
                    <button
                      key={brand}
                      onClick={() => onSelectBrand(brand)}
                      className={`w-full p-3 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-[#1F3A2E] text-white shadow-sm'
                          : 'bg-white text-slate-700 border border-[#EFE9DD]'
                      }`}
                    >
                      <span>{brand}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Action Buttons */}
          <div className="p-6 border-t border-[#EFE9DD] bg-white flex gap-3">
            <button
              onClick={() => {
                onClearAll();
                onClose();
              }}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-[#1F3A2E] text-white text-xs font-bold shadow-md"
            >
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
