'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  Leaf, 
  CheckCircle2, 
  Youtube, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatYouTubeEmbedUrl, extractYouTubeVideoId } from '../utils/youtube';

interface ProductTabsProps {
  description: string;
  category: string;
  howToUseVideoUrl?: string;
  usage?: string;
  benefits?: string[];
  ingredients?: string[];
}

export default function ProductTabs({ 
  description, 
  category,
  howToUseVideoUrl,
  usage,
  benefits = [],
  ingredients = []
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'ingredients' | 'benefits' | 'usage'>('desc');
  const [openMobileSection, setOpenMobileSection] = useState<string | null>('desc');

  const defaultIngredients = [
    'Pure Natural Herb Extracts',
    'Cold-Pressed Botanical Essential Oils',
    'Ayurvedic Herbs & Plant Root Bark',
    'No Synthetic Fragrance or Artificial Dyes',
  ];

  const defaultBenefits = [
    'Deeply nourishes and rejuvenates target tissues',
    '100% Chemical-free and paraben-free formulation',
    'Formulated following ancient Ayurvedic principles',
    'Suitable for regular daily application',
  ];

  const ingredientsList = ingredients && ingredients.length > 0 ? ingredients : defaultIngredients;
  const benefitsList = benefits && benefits.length > 0 ? benefits : defaultBenefits;

  const embedUrl = howToUseVideoUrl ? formatYouTubeEmbedUrl(howToUseVideoUrl) : null;
  const youtubeVideoId = howToUseVideoUrl ? extractYouTubeVideoId(howToUseVideoUrl) : null;
  const youtubeDirectLink = youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : null;

  const toggleMobile = (section: string) => {
    setOpenMobileSection(openMobileSection === section ? null : section);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-8 shadow-xs">
      
      {/* Desktop Horizontal Tabs Bar */}
      <div className="hidden md:flex items-center gap-8 border-b border-[#EFE9DD] pb-4 mb-6">
        <button
          onClick={() => setActiveTab('desc')}
          className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer ${
            activeTab === 'desc' ? 'text-[#1F3A2E]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Description
          {activeTab === 'desc' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3A2E] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('ingredients')}
          className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer ${
            activeTab === 'ingredients' ? 'text-[#1F3A2E]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Key Ingredients
          {activeTab === 'ingredients' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3A2E] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('benefits')}
          className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer ${
            activeTab === 'benefits' ? 'text-[#1F3A2E]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          Health Benefits
          {activeTab === 'benefits' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3A2E] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('usage')}
          className={`font-serif text-base font-bold transition-all relative pb-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'usage' ? 'text-[#1F3A2E]' : 'text-slate-400 hover:text-slate-700'
          }`}
        >
          <span>How to Use</span>
          {embedUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
              <Youtube className="w-3 h-3 text-red-600" />
              <span>Video</span>
            </span>
          )}
          {activeTab === 'usage' && (
            <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1F3A2E] rounded-full" />
          )}
        </button>
      </div>

      {/* Desktop Tab Content */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          {activeTab === 'desc' && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-4 text-slate-600 text-sm font-light leading-relaxed"
            >
              <p>{description}</p>
              <p>
                Handcrafted under the supervision of Ayurvedic experts in Surat, Gujarat. Each batch undergoes rigorous quality testing to preserve the natural potency of every herb.
              </p>
            </motion.div>
          )}

          {activeTab === 'ingredients' && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {ingredientsList.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD]">
                  <Leaf className="w-5 h-5 text-[#1F3A2E] shrink-0 mt-0.5" />
                  <span className="text-xs font-semibold text-[#1A201C]">{item}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'benefits' && (
            <motion.div
              key="benefits"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-3"
            >
              {benefitsList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3.5 rounded-xl bg-[#F8F6F0]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">{item}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'usage' && (
            <motion.div
              key="usage"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-6"
            >
              {embedUrl ? (
                <div className="space-y-5">
                  {/* Video Header & Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[#EFE9DD]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#1A201C]">
                          Step-by-Step Video Guide
                        </h4>
                        <p className="text-xs text-slate-500 font-light">
                          Watch the Ayurvedic application demonstration for best results
                        </p>
                      </div>
                    </div>

                    {youtubeDirectLink && (
                      <a
                        href={youtubeDirectLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors border border-red-200"
                      >
                        <Youtube className="w-4 h-4 text-red-600" />
                        <span>Watch on YouTube</span>
                        <ExternalLink className="w-3 h-3 text-red-400" />
                      </a>
                    )}
                  </div>

                  {/* Responsive 16:9 YouTube Video Player */}
                  <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-[#EFE9DD] bg-black">
                    <iframe
                      src={embedUrl}
                      title="How to Use Product Guide"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>

                  {/* Textual Usage Ritual Notes */}
                  {usage && (
                    <div className="p-5 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center shrink-0 shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-serif font-bold text-xs text-[#1A201C] uppercase tracking-wider">
                          Application Ritual
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                          {usage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback if no video is provided */
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl bg-[#F8F6F0] border border-[#EFE9DD] flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#1F3A2E] text-[#D4A373] flex items-center justify-center shrink-0 shadow-xs">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif font-bold text-sm text-[#1A201C]">
                        Recommended Application Ritual
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                        {usage || 'Take a small amount of the formulation and gently apply in circular motions over the cleansed target area. Allow the botanical extracts to absorb completely.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-white border border-[#EFE9DD]">
                      <span className="font-bold text-[#D4A373] block mb-1">01. Cleanse</span>
                      <p className="text-slate-500 font-light">Wash skin or scalp gently with lukewarm water and pat dry.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#EFE9DD]">
                      <span className="font-bold text-[#D4A373] block mb-1">02. Apply</span>
                      <p className="text-slate-500 font-light">Gently massage formulation in circular motions until absorbed.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-[#EFE9DD]">
                      <span className="font-bold text-[#D4A373] block mb-1">03. Rest</span>
                      <p className="text-slate-500 font-light">Allow botanical nutrients to work without disturbing for optimal results.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-3">
        {/* Section 1: Description */}
        <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleMobile('desc')}
            className="w-full p-4 bg-[#F8F6F0] font-serif font-bold text-sm text-[#1A201C] flex items-center justify-between"
          >
            <span>Description</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSection === 'desc' ? 'rotate-180' : ''}`} />
          </button>
          {openMobileSection === 'desc' && (
            <div className="p-4 text-xs text-slate-600 font-light leading-relaxed space-y-2 border-t border-[#EFE9DD]">
              <p>{description}</p>
            </div>
          )}
        </div>

        {/* Section 2: Ingredients */}
        <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleMobile('ingredients')}
            className="w-full p-4 bg-[#F8F6F0] font-serif font-bold text-sm text-[#1A201C] flex items-center justify-between"
          >
            <span>Key Ingredients</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSection === 'ingredients' ? 'rotate-180' : ''}`} />
          </button>
          {openMobileSection === 'ingredients' && (
            <div className="p-4 space-y-2 border-t border-[#EFE9DD]">
              {ingredientsList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <Leaf className="w-3.5 h-3.5 text-[#1F3A2E] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Benefits */}
        <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleMobile('benefits')}
            className="w-full p-4 bg-[#F8F6F0] font-serif font-bold text-sm text-[#1A201C] flex items-center justify-between"
          >
            <span>Health Benefits</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSection === 'benefits' ? 'rotate-180' : ''}`} />
          </button>
          {openMobileSection === 'benefits' && (
            <div className="p-4 space-y-2 border-t border-[#EFE9DD]">
              {benefitsList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: How to Use */}
        <div className="border border-[#EFE9DD] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleMobile('usage')}
            className="w-full p-4 bg-[#F8F6F0] font-serif font-bold text-sm text-[#1A201C] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span>How to Use</span>
              {embedUrl && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                  <Youtube className="w-3 h-3 text-red-600" />
                  <span>Video</span>
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSection === 'usage' ? 'rotate-180' : ''}`} />
          </button>
          {openMobileSection === 'usage' && (
            <div className="p-4 space-y-4 border-t border-[#EFE9DD]">
              {embedUrl ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-md border border-[#EFE9DD] bg-black">
                    <iframe
                      src={embedUrl}
                      title="How to Use Guide"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>

                  {youtubeDirectLink && (
                    <a
                      href={youtubeDirectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200"
                    >
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {usage && (
                    <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-[#EFE9DD] text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-[#1F3A2E] block mb-1">Application Ritual:</span>
                      {usage}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed font-light">
                    {usage || 'Apply a generous layer onto clean dry skin and gently massage until absorbed.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
