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
          {customAboutContent ? (
            <div
              className="prose prose-slate text-xs sm:text-sm text-slate-600 font-light leading-relaxed max-w-none space-y-3"
              dangerouslySetInnerHTML={{ __html: customAboutContent }}
            />
          ) : (
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
              <p className="text-base sm:text-lg font-serif italic text-[#1A201C] font-semibold leading-relaxed border-l-2 border-[#B58A5A] pl-4">
                "We started Labdhi Herbs with a simple conviction: daily hair care, skin care, and pain relief products should be 100% natural, effective, and free from harmful synthetic chemicals."
              </p>

              <p>
                In a world flooded with artificial cosmetics and quick-fix chemical serums, Labdhi Herbs returned to the roots of authentic Gujarati Ayurveda. Every formulation is handcrafted in our {city} lab using time-tested herbs like Bhringraj, Amla, Sandalwood, Multani Mitti, and Mahanarayan oil.
              </p>

              <p>
                We do not compromise on purity. We source our raw botanical bark, roots, and essential oils directly from trusted organic farms, ensuring every bottle delivers maximum herbal potency to your family.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#EFE9DD]">
            <div className="p-4 rounded-2xl bg-[#F8F6F0] space-y-1">
              <span className="text-xl sm:text-2xl font-bold font-serif text-[#1F3A2E]">100%</span>
              <span className="text-xs text-slate-600 font-medium block">Pure Botanical Extracts</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8F6F0] space-y-1">
              <span className="text-xl sm:text-2xl font-bold font-serif text-[#1F3A2E]">0%</span>
              <span className="text-xs text-slate-600 font-medium block">Synthetic Parabens &amp; Dyes</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
