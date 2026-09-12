'use me';
'use client';

import { Leaf, ArrowRight, Shield, Truck, Sparkles } from 'lucide-react';

const STAGES = [
  {
    step: '01',
    title: 'Ethical Sourcing',
    text: 'Raw herbal roots, wild turmeric bark, and leaves sourced directly from certified organic farms.',
  },
  {
    step: '02',
    title: 'Cold-Pressed Extraction',
    text: 'Botanical oils slow-extracted without high heat to preserve full therapeutic vitamins and active herbal compounds.',
  },
  {
    step: '03',
    title: 'Expert Small Batch Prep',
    text: 'Formulated in Surat under traditional Ayurvedic guidelines with zero synthetic fragrances or chemical preservatives.',
  },
  {
    step: '04',
    title: 'Fresh Sealed Dispatch',
    text: 'Packaged in protective containers and shipped directly from our Surat workshop to your doorstep across India.',
  },
];

export default function HerbalProcess() {
  return (
    <div className="bg-[#14261E] rounded-3xl p-6 sm:p-12 text-[#EFE9DD] border border-[#71846C]/30 space-y-10 shadow-2xl">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#71846C]/30 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How We Craft Formulations</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white">
            Our Handcrafted Herbal Process
          </h2>
        </div>
        <p className="text-xs text-emerald-100/70 font-light max-w-xs">
          Every product undergoes careful multi-stage Ayurvedic preparation in Surat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAGES.map((s) => (
          <div
            key={s.step}
            className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3 flex flex-col justify-between hover:bg-white/10 transition-colors"
          >
            <div className="space-y-2">
              <span className="font-serif text-2xl font-bold text-[#D4A373] block">
                {s.step}
              </span>
              <h3 className="font-serif text-lg font-bold text-white">
                {s.title}
              </h3>
              <p className="text-xs text-emerald-100/80 font-light leading-relaxed">
                {s.text}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
              Stage {s.step} • Surat Lab
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
