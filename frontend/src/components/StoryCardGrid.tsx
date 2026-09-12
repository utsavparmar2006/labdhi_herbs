'use me';
'use client';

import { TESTIMONIALS } from '../services/mockData';
import { Star, MapPin, CheckCircle2, Quote } from 'lucide-react';
import Link from 'next/link';

export default function StoryCardGrid() {
  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-[#71846C] uppercase tracking-wider">
            Verified Experiences
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            Customer Words & Testimonials
          </h2>
        </div>

        <Link href="/shop" className="text-xs font-bold text-[#1F3A2E] hover:underline">
          Explore Formulations Used →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="rounded-3xl bg-white border border-[#EFE9DD] p-6 space-y-4 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <div className="flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Purchase</span>
                </div>
              </div>

              <Quote className="w-6 h-6 text-[#D4A373]/40" />

              <p className="text-xs sm:text-sm text-slate-700 font-light leading-relaxed italic">
                "{t.comment}"
              </p>
            </div>

            <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-[#1A201C]">{t.name}</h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 text-[#B58A5A]" />
                  <span>{t.location}</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#1F3A2E]/10 text-[#1F3A2E] text-[10px] font-bold">
                {t.productUsed}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
