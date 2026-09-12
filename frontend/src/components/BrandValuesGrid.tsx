'use me';
'use client';

import { ShieldCheck, Leaf, Sparkles, Heart } from 'lucide-react';

const VALUES = [
  {
    number: '01',
    title: '100% Botanical Purity',
    description: 'Zero artificial dyes, synthetic scents, mineral oils, or chemical fillers in any of our formulations.',
    icon: Leaf,
  },
  {
    number: '02',
    title: 'Time-Tested Ayurveda',
    description: 'Formulated strictly following ancient Ayurvedic texts under expert supervision in Surat, Gujarat.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Handcrafted Small Batches',
    description: 'Prepared in controlled small batches to preserve maximum potency of fresh herbs and essential oils.',
    icon: ShieldCheck,
  },
  {
    number: '04',
    title: 'Ethical & Transparent',
    description: 'Cruelty-free, ethically sourced botanicals with complete transparency in every ingredient list.',
    icon: Heart,
  },
];

export default function BrandValuesGrid() {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#71846C] uppercase tracking-wider">
            Uncompromising Standards
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            What Labdhi Herbs Stands For
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {VALUES.map((val) => {
          const Icon = val.icon;
          return (
            <div
              key={val.number}
              className="rounded-3xl bg-white border border-[#EFE9DD] p-6 space-y-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-xl font-bold text-[#D4A373]">
                    {val.number}
                  </span>
                  <div className="p-2.5 rounded-2xl bg-[#F8F6F0] text-[#1F3A2E] group-hover:bg-[#1F3A2E] group-hover:text-[#D4A373] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-[#1A201C] group-hover:text-[#1F3A2E] transition-colors">
                  {val.title}
                </h3>

                <p className="text-xs text-slate-500 font-light leading-relaxed">
                  {val.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#EFE9DD] text-[11px] font-semibold text-[#71846C]">
                Labdhi Core Principle
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
