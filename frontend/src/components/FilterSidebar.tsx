'use me';
'use client';

import { CATEGORIES } from '../services/mockData';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onClearAll: () => void;
}

const BRANDS = ['Labdhi Herbs', 'Labdhi Hurbs'];

export default function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  onClearAll,
}: FilterSidebarProps) {
  const hasActiveFilter = selectedCategory !== 'All' || selectedBrand !== 'All';

  return (
    <aside className="w-64 shrink-0 space-y-8 bg-white p-6 rounded-2xl border border-[#EFE9DD] shadow-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EFE9DD] pb-4">
        <div className="flex items-center gap-2 font-serif text-lg font-bold text-[#1A201C]">
          <Filter className="w-4 h-4 text-[#1F3A2E]" />
          <span>Filters</span>
        </div>

        {hasActiveFilter && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-[#1F3A2E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Category Filter Group */}
      <div className="space-y-3">
        <h4 className="font-semibold text-xs text-[#1A201C] uppercase tracking-wider">Categories</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#1F3A2E]">
            <input
              type="radio"
              name="sidebar-category"
              checked={selectedCategory === 'All'}
              onChange={() => onSelectCategory('All')}
              className="accent-[#1F3A2E]"
            />
            <span>All Categories</span>
          </label>

          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#1F3A2E]">
              <input
                type="radio"
                name="sidebar-category"
                checked={selectedCategory.toLowerCase() === cat.slug.toLowerCase()}
                onChange={() => onSelectCategory(cat.slug)}
                className="accent-[#1F3A2E]"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter Group */}
      <div className="space-y-3 pt-4 border-t border-[#EFE9DD]">
        <h4 className="font-semibold text-xs text-[#1A201C] uppercase tracking-wider">Brands</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#1F3A2E]">
            <input
              type="radio"
              name="sidebar-brand"
              checked={selectedBrand === 'All'}
              onChange={() => onSelectBrand('All')}
              className="accent-[#1F3A2E]"
            />
            <span>All Brands</span>
          </label>

          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer hover:text-[#1F3A2E]">
              <input
                type="radio"
                name="sidebar-brand"
                checked={selectedBrand === brand}
                onChange={() => onSelectBrand(brand)}
                className="accent-[#1F3A2E]"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

    </aside>
  );
}
