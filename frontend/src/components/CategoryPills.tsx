'use me';
'use client';

import { MAIN_CATEGORIES } from '../services/mockData';
import { ArrowRight, CheckCircle2, Layers, Sparkles, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface CategoryPillsProps {
  selectedMainCategory: string;
  selectedSubCategory: string;
  onSelectMainCategory: (mainCatSlug: string) => void;
  onSelectSubCategory: (subCatSlug: string) => void;
}

export default function CategoryPills({
  selectedMainCategory,
  selectedSubCategory,
  onSelectMainCategory,
  onSelectSubCategory,
}: CategoryPillsProps) {
  if (MAIN_CATEGORIES.length === 0) return null;

  // Find current active main category object
  const currentMainCat = MAIN_CATEGORIES.find(
    (mc) => mc.slug.toLowerCase() === selectedMainCategory.toLowerCase()
  ) || MAIN_CATEGORIES[0];

  return (
    <div className="space-y-8 font-sans">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DD] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-xs font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Select Main Category</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            Explore Herbal Categories
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-light max-w-xs">
          Select a category to view authentic Ayurvedic formulations and targeted herbal sub-categories.
        </p>
      </div>

      {/* TIER 1: Visual Main Category Cards Grid (Matching Modern UI Design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {MAIN_CATEGORIES.map((mainCat, idx) => {
          const isSelected =
            selectedMainCategory.toLowerCase() === mainCat.slug.toLowerCase() ||
            (selectedMainCategory === 'All' && mainCat.slug === 'All');

          return (
            <motion.div
              key={mainCat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              onClick={() => {
                onSelectMainCategory(mainCat.slug);
                onSelectSubCategory('All');
              }}
              className={`group relative h-48 sm:h-56 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border ${
                isSelected
                  ? 'border-4 border-[#1F3A2E] ring-4 ring-[#1F3A2E]/20 shadow-xl scale-[1.03]'
                  : 'border-[#EFE9DD] hover:border-[#1F3A2E]/40'
              }`}
            >
              {/* Background Image with Zoom */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${mainCat.image})` }}
              />

              {/* Gradient Dark Overlay */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  isSelected
                    ? 'bg-gradient-to-t from-[#14261E] via-[#14261E]/75 to-[#14261E]/40 opacity-95'
                    : 'bg-gradient-to-t from-[#14261E]/90 via-[#14261E]/50 to-black/20 opacity-85 group-hover:opacity-95'
                }`}
              />

              {/* Selection Active Indicator Badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md border border-[#D4A373]/40">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Selected</span>
                </div>
              )}

              {/* Card Content */}
              <div className="absolute inset-0 p-5 flex flex-col justify-end z-10 text-white space-y-1.5">
                <h3
                  className={`font-serif text-lg sm:text-xl font-bold leading-tight transition-colors ${
                    isSelected ? 'text-[#D4A373]' : 'text-white group-hover:text-[#D4A373]'
                  }`}
                >
                  {mainCat.name}
                </h3>

                <p className="text-[11px] text-emerald-100/80 font-light line-clamp-2 leading-relaxed">
                  {mainCat.description}
                </p>

                <div
                  className={`pt-1.5 flex items-center gap-1.5 text-[11px] font-bold transition-transform ${
                    isSelected ? 'text-[#D4A373] translate-x-1' : 'text-emerald-200 group-hover:translate-x-1'
                  }`}
                >
                  <span>{isSelected ? 'Viewing Category' : 'Explore Formulations'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* TIER 2: Sub-Categories Strip (Appears under selected Main Category) */}
      {currentMainCat.subCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-5 rounded-3xl bg-white border border-[#EFE9DD] shadow-xs space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFE9DD] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center text-xs">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#1F3A2E] uppercase tracking-wider">
                Sub-Categories in <strong className="text-[#B58A5A]">{currentMainCat.name}</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-light">
              Click a sub-category to filter specific herbal remedies
            </span>
          </div>

          {/* Sub category pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {currentMainCat.subCategories.map((subCat) => {
              const isSubSelected =
                selectedSubCategory.toLowerCase() === subCat.slug.toLowerCase() ||
                (selectedSubCategory === 'All' && (subCat.slug === 'All' || subCat.slug.startsWith('All')));

              return (
                <button
                  key={subCat.id}
                  onClick={() => onSelectSubCategory(subCat.slug)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-2 ${
                    isSubSelected
                      ? 'bg-[#1F3A2E] text-[#EFE9DD] border-[#1F3A2E] shadow-sm scale-[1.02]'
                      : 'bg-[#F8F6F0] text-slate-700 hover:bg-[#1F3A2E]/10 hover:text-[#1F3A2E] border-[#EFE9DD]'
                  }`}
                >
                  {isSubSelected && <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />}
                  <span>{subCat.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}

    </div>
  );
}
