'use me';
'use client';

import Link from 'next/link';
import { ChevronRight, Leaf } from 'lucide-react';

interface ShopHeroProps {
  activeCategory?: string;
}

export default function ShopHero({ activeCategory = 'All' }: ShopHeroProps) {
  return (
    <section className="relative w-full pt-32 pb-14 md:pt-40 md:pb-16 bg-[#14261E] text-white overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 relative z-10 text-center flex flex-col items-center">
        
        {/* Breadcrumbs */}
        <nav className="inline-flex items-center gap-2 text-xs text-emerald-200/80 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
          <Link href="/shop" className="hover:text-white transition-colors">
            Shop
          </Link>
          {activeCategory && activeCategory !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400/80" />
              <span className="text-[#D4A373] font-semibold">{activeCategory}</span>
            </>
          )}
        </nav>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3 max-w-3xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            {activeCategory && activeCategory !== 'All' ? `${activeCategory} Collection` : 'Explore Our Herbal Collection'}
          </h1>

          <p className="text-xs sm:text-base text-emerald-100/75 font-light max-w-2xl mx-auto leading-relaxed">
            Handcrafted with 100% pure botanical extracts from Surat, Gujarat. Free from artificial dyes, parabens, and harsh chemicals.
          </p>
        </div>

      </div>
    </section>
  );
}
