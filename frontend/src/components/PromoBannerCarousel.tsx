'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export default function PromoBannerCarousel() {
  const { settings } = useSiteSettings();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const activeBanners = (settings.banners || [])
    .filter((b) => b.isActive && b.image)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const total = activeBanners.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Automated Smooth Slide Timer (Runs automatically every 3.8 seconds)
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 3800);

    return () => clearInterval(timer);
  }, [total, currentIndex]);

  if (total === 0) return null;

  const currentBanner = activeBanners[currentIndex];
  const imgSrc = currentBanner.image.startsWith('http')
    ? currentBanner.image
    : `http://localhost:5000${currentBanner.image}`;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-3xl overflow-hidden border border-[#EFE9DD] shadow-md bg-[#14261E] h-[220px] sm:h-[320px] md:h-[380px] group select-none">
        
        {/* Animated Banner Slide with Smooth Directional Slide */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.6 },
              opacity: { duration: 0.35 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = Math.abs(offset.x) * velocity.x;
              if (swipe < -80 || offset.x < -100) {
                nextSlide();
              } else if (swipe > 80 || offset.x > 100) {
                prevSlide();
              }
            }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          >
            <Link
              href={currentBanner.link || '/shop'}
              className="block w-full h-full relative group/slide"
            >
              <img
                src={imgSrc}
                alt={currentBanner.title || 'Promotional Banner'}
                className="w-full h-full object-cover object-center pointer-events-none transition-transform duration-700 group-hover/slide:scale-[1.01]"
              />
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows (Left & Right) */}
        {total > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Pagination Dots with Active Pill Animation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
              {activeBanners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === i
                      ? 'w-7 bg-[#D4A373]'
                      : 'w-2 bg-white/50 hover:bg-white/80'
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
