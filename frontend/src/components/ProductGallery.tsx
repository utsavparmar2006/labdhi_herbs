'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { isYouTubeUrl, formatYouTubeEmbedUrl } from '../utils/youtube';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  tag?: string;
  videoUrl?: string;
}

export type MediaSlide =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

export default function ProductGallery({
  images,
  productName,
  tag,
  videoUrl,
}: ProductGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

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

  // Unify Images and Video into a single, seamless list of slides
  const mediaItems: MediaSlide[] = useMemo(() => {
    const items: MediaSlide[] = galleryImages.map((img) => ({
      type: 'image',
      url: img,
    }));

    if (hasVideo && videoUrl) {
      items.push({
        type: 'video',
        url: videoUrl.trim(),
      });
    }

    return items;
  }, [galleryImages, hasVideo, videoUrl]);

  const totalSlides = mediaItems.length;
  const currentMedia = mediaItems[currentIndex] || mediaItems[0];
  const isCurrentVideo = currentMedia?.type === 'video';
  const videoIndex = hasVideo ? totalSlides - 1 : -1;

  // Next / Previous Navigation Handlers (Seamless cycling across images & video)
  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    },
    [totalSlides]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIsZoomed(false);
      setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    },
    [totalSlides]
  );

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Threshold of 40px to trigger swipe
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  // Open Full-Screen Lightbox
  const handleOpenLightbox = (index?: number) => {
    if (typeof index === 'number') {
      setCurrentIndex(index);
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

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen, handleNext, handlePrev]);

  // Video renderer helper
  const renderVideoPlayer = (url: string, isLightBoxView = false) => {
    const isYouTube = isYouTubeUrl(url);
    const embedUrl = isYouTube ? formatYouTubeEmbedUrl(url, true) : null;

    if (isYouTube && embedUrl) {
      return (
        <iframe
          src={embedUrl}
          title={`${productName} Video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0 rounded-2xl"
        />
      );
    }

    return (
      <video
        src={url}
        controls
        autoPlay
        playsInline
        loop
        className={`w-full h-full ${isLightBoxView ? 'max-h-[calc(100vh-220px)] object-contain' : 'object-contain'} bg-black`}
      >
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="space-y-4 select-none w-full max-w-[480px] mx-auto">
      {/* Main Media Display Box (Swipeable) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-square max-w-[460px] max-h-[440px] sm:max-h-[460px] w-full rounded-3xl bg-[#F8F6F0] border border-[#EFE9DD] overflow-hidden shadow-xs group mx-auto"
      >
        <AnimatePresence mode="wait">
          {isCurrentVideo ? (
            /* Video Slide */
            <motion.div
              key="slide-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full bg-black relative flex items-center justify-center"
            >
              {renderVideoPlayer(currentMedia.url)}

              {/* Video Badge */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs font-semibold pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Film className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Product Video Demo</span>
              </div>

              {/* Fullscreen Button */}
              <div className="absolute top-3.5 right-3.5 z-10">
                <button
                  type="button"
                  onClick={() => handleOpenLightbox(currentIndex)}
                  className="px-2.5 py-1.5 rounded-full bg-black/70 hover:bg-black text-white backdrop-blur-md shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/20"
                  title="Watch full screen"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span className="hidden sm:inline text-[10px] font-bold">Full View</span>
                </button>
              </div>

              {/* Navigation Arrows for Video Slide */}
              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous item"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next item"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Bottom Row: Slide Counter + Switch to Photos */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
                <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#D4A373] text-[10px] font-bold shadow-md tracking-wider flex items-center gap-1">
                  <PlayCircle className="w-3 h-3 text-[#D4A373]" />
                  <span>Video ({currentIndex + 1} / {totalSlides})</span>
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(0);
                  }}
                  className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#1F3A2E] text-xs font-bold backdrop-blur-md border border-[#EFE9DD] flex items-center gap-1.5 transition-all shadow-md hover:scale-105 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#1F3A2E]" />
                  <span className="text-[11px]">View Photos</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Image Slide */
            <motion.div
              key={`slide-img-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleOpenLightbox(currentIndex)}
              className="w-full h-full relative cursor-zoom-in"
              title="Click to view full screen"
            >
              <img
                src={currentMedia.url}
                alt={`${productName} - Photo ${currentIndex + 1} of ${totalSlides}`}
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
                    handleOpenLightbox(currentIndex);
                  }}
                  className="px-2.5 py-1.5 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] backdrop-blur-md shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-[#EFE9DD]"
                  title="Open full view"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#1F3A2E]" />
                  <span className="hidden sm:inline text-[10px] font-bold">Full View</span>
                </button>
              </div>

              {/* Navigation Arrows (Previous / Next Photo) */}
              {totalSlides > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous item"
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next item"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#1F3A2E] shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-[#EFE9DD] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Bottom Row: Counter Badge + Watch Video Shortcut */}
              <div className="absolute bottom-3.5 inset-x-3.5 z-10 flex items-center justify-between pointer-events-none">
                {/* Image Counter Badge */}
                {totalSlides > 1 && (
                  <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold shadow-md tracking-wider">
                    {currentIndex + 1} / {totalSlides}
                  </span>
                )}

                {/* Quick Watch Video Float Button */}
                {hasVideo && videoIndex !== -1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(videoIndex);
                    }}
                    className="pointer-events-auto ml-auto px-3 py-1.5 rounded-full bg-[#1F3A2E]/90 hover:bg-[#1F3A2E] text-white text-xs font-bold backdrop-blur-md border border-white/20 flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span className="text-[11px]">Watch Video</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Swipe Hint (Small text below image) */}
      {totalSlides > 1 && (
        <p className="text-center text-[11px] text-slate-400 font-light">
          Swipe or click arrows to view photos &amp; video ({totalSlides} items)
        </p>
      )}

      {/* Thumbnails Row (Images + Video Unified) */}
      {totalSlides > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-300 max-w-full">
          {mediaItems.map((item, idx) => {
            const isSelected = currentIndex === idx;

            if (item.type === 'video') {
              return (
                <button
                  key="thumb-video"
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-[#1A201C] shrink-0 relative flex flex-col items-center justify-center text-white group ${
                    isSelected
                      ? 'border-[#B58A5A] ring-2 ring-[#B58A5A]/30 shadow-md scale-105'
                      : 'border-[#EFE9DD] opacity-80 hover:opacity-100'
                  }`}
                  title="Watch Video Slide"
                >
                  <img
                    src={galleryImages[0]}
                    alt="Video thumbnail"
                    className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <PlayCircle className="w-5 h-5 text-[#D4A373] drop-shadow-md group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold tracking-wider uppercase text-[#EFE9DD]">
                      Video
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={`thumb-img-${idx}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer bg-white shrink-0 relative group/thumb ${
                  isSelected
                    ? 'border-[#1F3A2E] ring-2 ring-[#1F3A2E]/20 shadow-md scale-105'
                    : 'border-[#EFE9DD] opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={item.url}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN LIGHTBOX MODAL (Supports Photos & Video)                      */}
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
                    <span className="font-serif text-white font-bold text-sm sm:text-base truncate max-w-xs sm:max-w-md">
                      {productName}
                    </span>
                    {totalSlides > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[#D4A373] text-xs font-bold shrink-0">
                        {isCurrentVideo ? '▶ Video' : `${currentIndex + 1} / ${totalSlides}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Zoom Toggle Button (only for images) */}
                    {!isCurrentVideo && (
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
                    )}

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
                  {totalSlides > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-4 sm:left-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/15 cursor-pointer shadow-2xl"
                      title="Previous (Left Arrow)"
                    >
                      <ChevronLeft className="w-7 h-7" />
                    </button>
                  )}

                  {/* Central Full-View Media */}
                  {isCurrentVideo ? (
                    <div className="w-full max-w-4xl h-full max-h-[calc(100vh-210px)] flex items-center justify-center p-2">
                      {renderVideoPlayer(currentMedia.url, true)}
                    </div>
                  ) : (
                    <div
                      className={`relative max-h-full max-w-full flex items-center justify-center transition-transform duration-300 ${
                        isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                      }`}
                      onClick={() => setIsZoomed((prev) => !prev)}
                      title={isZoomed ? 'Click to zoom out' : 'Click to zoom in'}
                    >
                      <motion.img
                        key={currentIndex}
                        src={currentMedia.url}
                        alt={`${productName} - Full View ${currentIndex + 1}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="max-h-[calc(100vh-210px)] max-w-[88vw] object-contain rounded-2xl shadow-2xl select-none"
                      />
                    </div>
                  )}

                  {/* Right Arrow Button */}
                  {totalSlides > 1 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-4 sm:right-8 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/15 cursor-pointer shadow-2xl"
                      title="Next (Right Arrow)"
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
                    {mediaItems.map((item, idx) => {
                      const isSelected = currentIndex === idx;

                      if (item.type === 'video') {
                        return (
                          <button
                            key="lb-thumb-video"
                            type="button"
                            onClick={() => {
                              setCurrentIndex(idx);
                              setIsZoomed(false);
                            }}
                            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-[#1A201C] shrink-0 relative flex items-center justify-center ${
                              isSelected
                                ? 'border-[#D4A373] ring-2 ring-[#D4A373]/40 scale-105 shadow-lg'
                                : 'border-white/20 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={galleryImages[0]}
                              alt="Video slide"
                              className="w-full h-full object-cover opacity-40"
                            />
                            <PlayCircle className="w-6 h-6 text-[#D4A373] absolute z-10" />
                          </button>
                        );
                      }

                      return (
                        <button
                          key={`lb-thumb-${idx}`}
                          type="button"
                          onClick={() => {
                            setCurrentIndex(idx);
                            setIsZoomed(false);
                          }}
                          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white/5 shrink-0 ${
                            isSelected
                              ? 'border-[#D4A373] ring-2 ring-[#D4A373]/30 scale-105 shadow-lg'
                              : 'border-white/20 opacity-50 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={item.url}
                            alt={`Full view thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-white/50 tracking-wider">
                    Use ← → arrow keys to browse photos &amp; video • ESC to close
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
