'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CATEGORIES } from '../services/mockData';
import { ArrowRight, Leaf } from 'lucide-react';

interface CategoryGridProps {
  onSelectCategory?: (categorySlug: string) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  return (
    <section id="categories" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight">
          Explore By Herbal Category
        </h2>
        <p className="text-slate-600 text-sm sm:text-base font-light">
          Targeted Ayurvedic remedies crafted for skin brilliance, scalp restoration, and joint vitality.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {CATEGORIES.map((cat, idx) => {
          const targetUrl = cat.href || `/shop/${cat.id}`;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <Link
                href={targetUrl}
                onClick={() => {
                  if (onSelectCategory) onSelectCategory(cat.slug);
                }}
                className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 border border-[#EFE9DD] block"
              >
                {/* Background Image with Zoom effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#14261E]/90 via-[#14261E]/40 to-transparent transition-opacity group-hover:opacity-95" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-white">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-white tracking-wider border border-white/20">
                      {cat.itemCount} Formulations
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#D4A373] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-emerald-100/80 font-light line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                    
                    <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#D4A373] group-hover:translate-x-1 transition-transform">
                      <span>Explore Category</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
