'use me';
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Leaf, Star, MapPin, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSFORMATION_STORIES = [
  {
    id: 1,
    title: 'Acne Scars & Deep Blemish Clearance',
    customer: 'Meera Kothari',
    location: 'Surat, Gujarat',
    formulation: 'Beautiction Face Pack',
    duration: '4 Weeks Treatment',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
    afterImage: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800',
    comment: 'Deep acne marks faded by 85%. Skin feels so smooth and naturally radiant without any harsh chemical peels.',
  },
  {
    id: 2,
    title: 'Severe Hair Loss & Scalp Renewal',
    customer: 'Priya Patel',
    location: 'Ahmedabad, Gujarat',
    formulation: 'Herbal Kesh Sanjivani Hair Oil',
    duration: '6 Weeks Treatment',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    afterImage: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&q=80&w=800',
    comment: 'Hair fall stopped within 15 days of regular night oiling. New baby hair growth visible near forehead line.',
  },
  {
    id: 3,
    title: 'Dry Skin Texture & Eczema Relief',
    customer: 'Rajesh Shah',
    location: 'Vadodara, Gujarat',
    formulation: 'Soft N Silky Skincare Ointment',
    duration: '3 Weeks Treatment',
    rating: 5,
    beforeImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800',
    afterImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
    comment: 'Instant relief from dry skin itching and winter flakiness. My whole family uses this daily now.',
  },
];

import { SuccessStory } from '../types';

interface AsymmetricGalleryProps {
  stories?: SuccessStory[];
}

// Interactive Before/After Card Component with Mouse/Touch Drag Slider
function TransformationSliderCard({
  beforeImage,
  afterImage,
  onClick,
}: {
  beforeImage: string;
  afterImage: string;
  onClick: () => void;
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback((clientX: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    updatePosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    updatePosition(e.touches[0].clientX);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="group relative rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border border-[#EFE9DD] aspect-[4/3] bg-black select-none"
    >
      {/* Background AFTER Image */}
      <img
        src={afterImage}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <span className="absolute bottom-3 right-3 z-10 px-3 py-1 rounded-md bg-emerald-700/90 text-white text-[11px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
        After
      </span>

      {/* Clipped BEFORE Image */}
      <div
        style={{ width: `${sliderPosition}%` }}
        className="absolute top-0 bottom-0 left-0 overflow-hidden z-10 border-r-2 border-white shadow-2xl transition-none"
      >
        <img
          src={beforeImage}
          alt="Before"
          className="absolute top-0 left-0 max-w-none h-full object-cover"
          style={{ width: cardRef.current ? `${cardRef.current.clientWidth}px` : '100%' }}
        />
        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-rose-600/90 text-white text-[11px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
          Before
        </span>
      </div>

      {/* Vertical Slider Handle Line */}
      <div
        style={{ left: `${sliderPosition}%` }}
        className="absolute top-0 bottom-0 z-20 -ml-0.5 w-1 bg-white shadow-2xl transition-none pointer-events-none"
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#1F3A2E] border-2 border-white shadow-xl flex items-center justify-center text-[#D4A373]">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Click Details Overlay Trigger Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="absolute top-3 right-3 z-30 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1F3A2E] text-[11px] font-bold shadow-lg flex items-center gap-1.5 transition-all opacity-90 group-hover:opacity-100"
      >
        <Maximize2 className="w-3.5 h-3.5 text-[#B58A5A]" />
        <span>Details</span>
      </button>
    </div>
  );
}

export default function AsymmetricGallery({ stories }: AsymmetricGalleryProps = {}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeStories = stories && stories.length > 0 ? stories : TRANSFORMATION_STORIES;

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + activeStories.length) % activeStories.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % activeStories.length);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#71846C] text-xs font-semibold uppercase tracking-wider">
            <Leaf className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Interactive Before & After Gallery</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            Customer Transformation Gallery
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-light max-w-xs">
          Move your mouse over any image card to slide Before/After views. Click "Details" for full customer story.
        </p>
      </div>

      {/* Interactive Before & After Slider Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeStories.map((story, idx) => (
          <TransformationSliderCard
            key={story.id}
            beforeImage={story.beforeImage}
            afterImage={story.afterImage}
            onClick={() => setLightboxIndex(idx)}
          />
        ))}
      </div>

      {/* Lightbox Modal (Details displayed when opened) */}
      <AnimatePresence>
        {lightboxIndex !== null && activeStories[lightboxIndex] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-4xl w-full bg-[#14261E] rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/20 text-white"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Navigation Arrows */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Modal Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-black/50">
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20">
                  <img
                    src={activeStories[lightboxIndex].beforeImage}
                    alt="Before"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-rose-600 text-white text-xs font-bold uppercase tracking-wider">
                    BEFORE (Initial State)
                  </span>
                </div>

                <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/20">
                  <img
                    src={activeStories[lightboxIndex].afterImage}
                    alt="After"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 right-3 px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider">
                    AFTER ({activeStories[lightboxIndex].duration})
                  </span>
                </div>
              </div>

              {/* Modal Detailed Story Info */}
              <div className="p-6 space-y-4 bg-[#1F3A2E] border-t border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-serif text-2xl font-bold text-white">
                      {activeStories[lightboxIndex].title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-emerald-200/80">
                      <span className="font-bold text-white">{activeStories[lightboxIndex].customer}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4A373]" />
                        {activeStories[lightboxIndex].location}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-right">
                    <span className="px-3.5 py-1.5 rounded-full bg-[#D4A373] text-[#1F3A2E] font-bold text-xs inline-block">
                      Formulation: {activeStories[lightboxIndex].formulation}
                    </span>
                    <div className="flex items-center justify-end gap-1 text-amber-400 pt-1">
                      {[...Array(activeStories[lightboxIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-emerald-100/90 font-light italic leading-relaxed pt-2 border-t border-white/10">
                  "{activeStories[lightboxIndex].comment}"
                </p>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
