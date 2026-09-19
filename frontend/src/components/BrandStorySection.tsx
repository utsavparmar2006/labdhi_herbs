'use client';

import { Leaf, MapPin } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function BrandStorySection() {
  const { settings, profile } = useSiteSettings();

  const city = profile.city || 'Surat';
  const state = profile.state || 'Gujarat';
  const customAboutContent = settings.aboutUs?.content;

  return (
    <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-12 shadow-xs space-y-10">
      
      {/* Header Eyebrow */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EFE9DD] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#71846C] text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Our Beginnings in {city}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#1A201C]">
            Rooted in Authentic Gujarati Ayurveda
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#1F3A2E] font-bold bg-[#F8F6F0] px-3.5 py-1.5 rounded-full border border-[#EFE9DD]">
          <MapPin className="w-4 h-4 text-[#B58A5A]" />
          <span>Handcrafted in {city}, {state}</span>
        </div>
      </div>

      {/* Split Grid (Image Left + Story Content Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Image Box */}
        <div className="lg:col-span-6 relative aspect-square rounded-2xl overflow-hidden bg-[#1F3A2E] border border-[#EFE9DD] shadow-md group">
          <img
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
            alt="Labdhi Herbs Surat Workshop"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <span className="font-serif italic text-sm text-[#D4A373]">Labdhi Herbs {city} Workshop</span>
            <p className="text-xs text-emerald-100/80 font-light">
              Selecting cold-pressed botanicals &amp; pure herbal extracts under master supervision.
            </p>
          </div>
        </div>

        {/* Story Text Content */}
        <div className="lg:col-span-6 space-y-6">
          {customAboutContent && customAboutContent.length > 250 ? (
            <div
              className="prose prose-slate text-xs sm:text-sm text-slate-600 font-light leading-relaxed max-w-none space-y-3"
              dangerouslySetInnerHTML={{ __html: customAboutContent }}
            />
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
              <p className="text-base sm:text-lg font-serif italic text-[#1A201C] font-semibold leading-relaxed border-l-2 border-[#B58A5A] pl-4">
                "Founded on the principle of transparent, commission-free, and genuine Ayurvedic care, Labdhi Herbs brings pure botanical healing directly from our Surat workshop to your family."
              </p>

              <p>
                Labdhi Herbs originated in {city}, {state} with a clear mission: to eliminate commercial middlemen, artificial fillers, and exaggerated cosmetic claims. Our journey began with the iconic <strong>Roopotkarsh Vilepan</strong> and traditional herbal face packs, formulated by Ayurvedic masters using cold-pressed extracts, medicinal herbs, and pure oils.
              </p>

              <p>
                As established on our original platform, we believe in providing <em>commission-free, fast, reliable, and comprehensive access</em> to value-for-money Ayurvedic formulations under one roof. Every batch of our Hair Oils, Face Packs, Skincare Ointments, and Muscle &amp; Joint Care remedies is prepared following classical herbal protocols without synthetic parabens, artificial dyes, or mineral oils.
              </p>

              <p>
                From our roots at Makkai Pool Road, Adajan in Surat, we connect directly with consumers across India—ensuring complete price transparency, authentic ingredients, and personalized customer care.
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#EFE9DD]">
            <div className="p-3.5 rounded-2xl bg-[#F8F6F0] space-y-1 text-center">
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#1F3A2E] block">100%</span>
              <span className="text-[10px] sm:text-xs text-slate-600 font-medium block">Pure Botanicals</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F6F0] space-y-1 text-center">
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#1F3A2E] block">0%</span>
              <span className="text-[10px] sm:text-xs text-slate-600 font-medium block">Middleman Markup</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#F8F6F0] space-y-1 text-center">
              <span className="text-lg sm:text-2xl font-bold font-serif text-[#1F3A2E] block">Surat</span>
              <span className="text-[10px] sm:text-xs text-slate-600 font-medium block">Ayurvedic Roots</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
