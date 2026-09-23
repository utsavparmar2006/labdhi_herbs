'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  X,
  PlayCircle,
  Film,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  tag?: string;
  videoUrl?: string;
}

export default function ProductGallery({
  images,
  productName,
  tag,
  videoUrl,
}: ProductGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [activeMedia, setActiveMedia] = useState<'image' | 'video'>('image');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Clean image list fallback
  const validImages = images && images.length > 0 ? images.filter(Boolean) : [];
  const galleryImages =
    validImages.length > 0
      ? validImages
      : ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800'];

  const hasVideo = Boolean(videoUrl && videoUrl.trim().length > 0);
  const hasMultipleImages = galleryImages.length > 1;

  // Next / Previous Navigation Handlers
  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsZoomed(false);
      if (activeMedia === 'video') {
        setActiveMedia('image');
        setSelectedImageIndex(0);
        return;
      }
      setSelectedImageIndex((prev) => (prev + 1) % galleryImages.length);
    },
    [activeMedia, galleryImages.length]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsZoomed(false);
      if (activeMedia === 'video') {
        setActiveMedia('image');
        setSelectedImageIndex(galleryImages.length - 1);
        return;
      }
      setSelectedImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    },
    [activeMedia, galleryImages.length]
  );

  // Open Full-Screen Lightbox
  const handleOpenLightbox = (index?: number) => {
    if (typeof index === 'number') {
      setSelectedImageIndex(index);
      setActiveMedia('image');
    }
    setIsZoomed(false);
    setIsLightboxOpen(true);
  };

  // Keyboard Navigation & Scroll Locking for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    // Lock background scrolling and mark lightbox active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lightbox-active');
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.classList.remove('lightbox-active');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <div className="space-y-3 max-w-[460px] mx-auto">
      {/* Main Media Display Box */}
      <div className="relative aspect-square max-w-[460px] max-h-[440px] sm:max-h-[460px] w-full rounded-3xl bg-[#F8F6F0] border border-[#EFE9DD] overflow-hidden shadow-xs group mx-auto">
        <AnimatePresence mode="wait">
          {activeMedia === 'video' && hasVideo ? (
            <motion.div
              key="video-player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full bg-black relative flex items-center justify-center"
            >
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                loop
                className="w-full h-full object-contain bg-black"
              >
                Your browser does not support the video tag.
              </video>

              {/* Video Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Film className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Product Video Demo</span>
              </div>

              {/* Switch Back to Photos Button */}
              <button
                type="button"
                onClick={() => setActiveMedia('image')}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/10 flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>View Photos</span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`image-${selectedImageIndex}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              onClick={() => handleOpenLightbox(selectedImageIndex)}
              className="w-full h-full relative cursor-zoom-in"
              title="Click to view full screen"
            >
              <img
                src={galleryImages[selectedImageIndex] || galleryImages[0]}
                alt={`${productName} - Photo ${selectedImageIndex + 1} of ${galleryImages.length}`}
                loading="eager"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Tag Badge */}
              {tag && (
                <span className="absolute top-3.5 left-3.5 z-10 px-3 py-1 rounded-full bg-[#1F3A2E] text-[#D4A373] text-[11px] font-bold uppercase tracking-wider shadow-md pointer-events-none">
                  {tag}
                </span>
              )}

              {/* Top-Right: Full View / Lightbox Action Icon */}
              <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLightbox(selectedImageIndex);
                  }}
                  className="px-2.5 py-1.5 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] backdrop-blur-md shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#EFE9DD]"
                  title="Open full view"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#1F3A2E]" />
                  <span className="hidden sm:inline text-[10px] font-bold">Full View</span>
                </button>
              </div>

              {/* Navigation Arrows (Previous / Next Photo) */}
              {hasMultipleImages && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous photo"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next photo"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Bottom Row: Counter Badge + Watch Video Button */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
                {/* Image Counter Badge */}
                {hasMultipleImages && (
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold shadow-md tracking-wider">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </span>
                )}

                {/* Quick Watch Video Float Button */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMedia('video');
                    }}
                    className="pointer-events-auto ml-auto px-3 py-1.5 rounded-full bg-[#1F3A2E]/90 hover:bg-[#1F3A2E] text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span className="text-[11px]">Watch Video</span>
                  </button>
                )}
              </div>

              {/* Subtle hover overlay hint */}
              <div className="absolute inset-x-0 bottom-0 py-1.5 text-center bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="text-[10px] text-white/90 font-medium tracking-wide">
                  Click image for full view & zoom
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnails Row (Images + Video Card) */}
      {(galleryImages.length > 1 || hasVideo) && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none justify-start">
          {/* Image Thumbnails */}
          {galleryImages.map((img, idx) => {
            const isSelected = activeMedia === 'image' && selectedImageIndex === idx;
            return (
              <button
                key={`thumb-img-${idx}`}
                type="button"
                onClick={() => {
                  setActiveMedia('image');
                  setSelectedImageIndex(idx);
                }}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white shrink-0 relative group/thumb ${
                  isSelected
                    ? 'border-[#1F3A2E] ring-2 ring-[#1F3A2E]/20 shadow-md scale-105'
                    : 'border-[#EFE9DD] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                />
              </button>
            );
          })}

          {/* Dedicated Video Thumbnail */}
          {hasVideo && (
            <button
              key="thumb-video"
              type="button"
              onClick={() => setActiveMedia('video')}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-[#1A201C] shrink-0 relative flex flex-col items-center justify-center text-white group ${
                activeMedia === 'video'
                  ? 'border-[#B58A5A] ring-2 ring-[#B58A5A]/30 shadow-md scale-105'
                  : 'border-[#EFE9DD] opacity-85 hover:opacity-100'
              }`}
            >
              <img
                src={galleryImages[0]}
                alt="Video thumbnail background"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex flex-col items-center gap-1">
                <PlayCircle className="w-5 h-5 text-[#D4A373] drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#EFE9DD]">
                  Video
                </span>
              </div>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN LIGHTBOX MODAL (Rendered directly in Body via React Portal)  */}
      {/* ========================================================================= */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isLightboxOpen && (
              <motion.div
                key="product-lightbox-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999999] bg-black/95 backdrop-blur-2xl flex flex-col justify-between select-none overflow-hidden"
                onClick={() => setIsLightboxOpen(false)}
              >
                {/* Top Bar: Title, Counter & Action Controls */}
                <div
                  className="h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between border-b border-white/10 bg-black/90 backdrop-blur-xl z-20 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373] shadow-[0_0_8px_#D4A373] shrink-0" />
                    <h3 className="font-serif text-white font-bold text-sm sm:text-base tracking-wide truncate max-w-[200px] sm:max-w-md">
                      {productName}
                    </h3>
                    {hasMultipleImages && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[#D4A373] text-xs font-bold font-mono shrink-0">
                        {selectedImageIndex + 1} / {galleryImages.length}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Zoom Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsZoomed((prev) => !prev)}
                      className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 text-xs font-semibold cursor-pointer border border-white/10"
                      title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                    >
                      {isZoomed ? (
                        <>
                          <ZoomOut className="w-4 h-4 text-[#D4A373]" />
                          <span className="hidden sm:inline">Zoom Out</span>
                        </>
                      ) : (
                        <>
                          <ZoomIn className="w-4 h-4 text-[#D4A373]" />
                          <span className="hidden sm:inline">Zoom In</span>
                        </>
                      )}
                    </button>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(false)}
                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-red-500/80 text-white transition-all flex items-center justify-center cursor-pointer border border-white/10"
                      title="Close (Esc)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Central Media Canvas with Navigation Arrows */}
                <div
                  className="relative flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden min-h-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Left Arrow Button */}
                  {hasMultipleImages && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-4 sm:left-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/15 cursor-pointer shadow-2xl"
                      title="Previous photo (Left Arrow)"
                    >
                      <ChevronLeft className="w-7 h-7" />
                    </button>
                  )}

                  {/* Central Full-View Image */}
                  <div
                    className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
                      isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed((prev) => !prev)}
                    title={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                  >
                    <motion.img
                      key={selectedImageIndex}
                      src={galleryImages[selectedImageIndex]}
                      alt={`${productName} - Full View ${selectedImageIndex + 1}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="max-h-[calc(100vh-210px)] max-w-[88vw] object-contain rounded-2xl shadow-2xl select-none"
                    />
                  </div>

                  {/* Right Arrow Button */}
                  {hasMultipleImages && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 sm:right-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/15 cursor-pointer shadow-2xl"
                      title="Next photo (Right Arrow)"
                    >
                      <ChevronRight className="w-7 h-7" />
                    </button>
                  )}
                </div>

                {/* Bottom Bar: Thumbnails Tray & Keyboard Instruction */}
                <div
                  className="h-24 sm:h-28 px-4 py-3 border-t border-white/10 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-2 z-20 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Thumbnail Strip */}
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full pb-1 scrollbar-none">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={`lb-thumb-${idx}`}
                        type="button"
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          setIsZoomed(false);
                        }}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white/5 shrink-0 ${
                          selectedImageIndex === idx
                            ? 'border-[#D4A373] ring-2 ring-[#D4A373]/30 scale-105 shadow-lg'
                            : 'border-white/20 opacity-50 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Full view thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-white/50 tracking-wider">
                    Click photo to zoom • Use ← → arrow keys to browse • ESC to close
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
