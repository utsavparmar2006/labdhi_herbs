'use me';
'use client';

import { Sparkles, ArrowRight, Leaf, Heart, Shield, Activity } from 'lucide-react';

interface KnowledgeCategory {
  id: string;
  name: string;
  count: string;
  description: string;
  icon: typeof Leaf;
}

const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    id: 'hair-care',
    name: 'Hair & Scalp Health',
    count: '12 Articles',
    description: 'Ayurvedic root nourishment, natural hair fall prevention & cold-pressed oil remedies.',
    icon: Leaf,
  },
  {
    id: 'skin-care',
    name: 'Skin Radiance',
    count: '15 Articles',
    description: 'Botanical ubtans, herbal acne treatments & natural skincare routines.',
    icon: Sparkles,
  },
  {
    id: 'joint-care',
    name: 'Joint & Muscle Mobility',
    count: '9 Articles',
    description: 'Natural pain relief oils, knee comfort routines & traditional joint care.',
    icon: Activity,
  },
  {
    id: 'ayurvedic-living',
    name: 'Ayurvedic Living',
    count: '8 Articles',
    description: 'Daily wellness habits, seasonal herbal teas & Gujarati Ayurvedic heritage.',
    icon: Heart,
  },
];

interface KnowledgeGardenProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

export default function KnowledgeGarden({ onSelectCategory, selectedCategory }: KnowledgeGardenProps) {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#71846C] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Herbal Knowledge Garden</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            Explore By Wellness Topic
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-light max-w-xs">
          Select a botanical topic below to filter stories and guides written by our Surat herbalists.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {KNOWLEDGE_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase() || (selectedCategory === 'All' && false);

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`rounded-3xl p-6 space-y-4 border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-[#1F3A2E] text-white border-[#1F3A2E] shadow-xl'
                  : 'bg-white text-[#1A201C] border-[#EFE9DD] hover:border-[#1F3A2E]/40 hover:shadow-lg'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/10 text-[#D4A373]' : 'bg-[#F8F6F0] text-[#1F3A2E]'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-200' : 'text-[#71846C]'}`}>
                    {cat.count}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold group-hover:text-[#B58A5A] transition-colors">
                  {cat.name}
                </h3>

                <p className={`text-xs font-light leading-relaxed line-clamp-2 ${isSelected ? 'text-emerald-100/80' : 'text-slate-500'}`}>
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs font-bold">
                <span>Browse Guides</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
