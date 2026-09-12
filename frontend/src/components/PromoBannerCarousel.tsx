'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PromoBannerCarousel() {
  const { settings } = useSiteSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeBanners = (settings.banners || [])
    .filter((b) => b.isActive && b.image)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const total = activeBanners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const timer = setInterval(nextSlide, 5500);
    return () => clearInterval(timer);
  }, [total, isPaused, nextSlide]);

  if (total === 0) return null;

  const currentBanner = activeBanners[currentIndex];
  const imgSrc = currentBanner.image.startsWith('http')
    ? currentBanner.image
    : `http://localhost:5000${currentBanner.image}`;

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative rounded-3xl overflow-hidden border border-[#EFE9DD] shadow-md bg-[#14261E] h-[220px] sm:h-[320px] md:h-[380px] group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            <Link
              href={currentBanner.link || '/shop'}
              className="block w-full h-full relative cursor-pointer group/slide"
            >
              <img
                src={imgSrc}
                alt={currentBanner.title || 'Promotional Banner'}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover/slide:scale-[1.01]"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (visible on hover or mobile) */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-105"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? 'w-6 bg-[#D4A373]' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
