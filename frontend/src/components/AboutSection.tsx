'use me';
'use client';

import { motion } from 'framer-motion';
import { Leaf, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Mobile Section Header (Title First in Responsive / Mobile) */}
        <div className="lg:hidden space-y-3 mb-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A201C] tracking-tight leading-tight">
            Rooted in Pure Botanical Wisdom
          </h2>

          <p className="text-slate-700 text-sm sm:text-base font-light leading-relaxed">
            Labdhi Herbs was founded with a simple, uncompromising promise: to bring pure, unadulterated Ayurvedic wellness directly from mother nature to your daily care routine.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Visual Showcase (Images) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-white/40">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000"
                alt="Labdhi Herbs Natural Sourcing"
                className="w-full h-[320px] sm:h-[400px] lg:h-[480px] object-cover"
              />
            </div>

            {/* Overlapping Secondary Card */}
            <div className="absolute -bottom-8 -right-4 sm:-right-8 z-20 w-64 p-5 rounded-2xl bg-[#1F3A2E] text-white shadow-xl border border-[#71846C]/40 space-y-2 hidden sm:block">
              <div className="flex items-center gap-2 text-[#D4A373]">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-semibold text-xs uppercase tracking-wider">Surat Heritage</span>
              </div>
              <p className="text-xs text-emerald-100/90 font-light leading-relaxed">
                Formulated at Adajan, Surat, Gujarat with authentic Ayurvedic roots.
              </p>
            </div>
          </motion.div>

          {/* Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Desktop-only Title Block (Hidden on mobile to avoid duplication) */}
            <div className="hidden lg:block space-y-4">
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A201C] tracking-tight leading-tight">
                Rooted in Pure Botanical Wisdom
              </h2>

              <p className="text-slate-700 text-sm sm:text-base font-light leading-relaxed">
                Labdhi Herbs was founded with a simple, uncompromising promise: to bring pure, unadulterated Ayurvedic wellness directly from mother nature to your daily care routine.
              </p>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
              We carefully source wild turmeric, bhringraj, raw sandalwood, and fresh neem leaves to craft skin face packs, hair restoration oils, and joint-relieving balms. Every formulation is free from artificial preservatives, harsh parabens, and synthetic dyes.
            </p>

            {/* Core Values checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F3A2E]" />
                <span className="text-xs font-semibold text-[#1A201C]">100% Organic Extracts</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F3A2E]" />
                <span className="text-xs font-semibold text-[#1A201C]">Handcrafted Small Batches</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F3A2E]" />
                <span className="text-xs font-semibold text-[#1A201C]">Zero Paraben & Sulfates</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#1F3A2E]" />
                <span className="text-xs font-semibold text-[#1A201C]">Dermatologically Gentle</span>
              </div>
            </div>

            <div className="pt-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1F3A2E] hover:bg-[#162a21] text-white text-xs font-semibold tracking-wide transition-all shadow-md"
              >
                <span>Shop Authentic Products</span>
              </a>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
}
