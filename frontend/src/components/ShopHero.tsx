'use me';
'use client';

import Link from 'next/link';
import { ChevronRight, Leaf } from 'lucide-react';

interface ShopHeroProps {
  activeCategory?: string;
}

export default function ShopHero({ activeCategory = 'All' }: ShopHeroProps) {
  return (
    <section className="relative w-full pt-32 pb-12 bg-[#F8F6F0] border-b border-[#EFE9DD] overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#71846C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#1F3A2E] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/shop" className="hover:text-[#1F3A2E] transition-colors">
            Shop
          </Link>
          {activeCategory && activeCategory !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#1F3A2E] font-semibold">{activeCategory}</span>
            </>
          )}
        </nav>

        {/* Hero Title & Subtitle */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight">
            {activeCategory && activeCategory !== 'All' ? `${activeCategory} Collection` : 'Explore Our Herbal Collection'}
          </h1>

          <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
            Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Free from artificial dyes, parabens, and harsh chemicals.
          </p>
        </div>

      </div>
    </section>
  );
}
