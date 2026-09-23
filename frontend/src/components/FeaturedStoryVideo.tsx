'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Play,
  X,
  Star,
  ShieldCheck,
  Quote,
  Sparkles,
  Volume2,
  Film,
  ChevronLeft,
  ChevronRight,
  Video,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessStory } from '../types';

interface FeaturedStoryVideoProps {
  story?: SuccessStory | null;
  allStories?: SuccessStory[];
  currentIndex?: number;
  onPrevStory?: () => void;
  onNextStory?: () => void;
  onSelectStory?: (index: number) => void;
}

interface VideoEntry {
  url: string;
  poster: string;
  label: string;
}

export default function FeaturedStoryVideo({
  story,
  allStories,
  currentIndex,
  onPrevStory,
  onNextStory,
  onSelectStory,
}: FeaturedStoryVideoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Touch gesture refs for mobile horizontal swipe
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Build the full ordered video list: primary + additionalVideos for current story
  const allVideos: VideoEntry[] = [];

  const primaryUrl = story?.videoUrl || '/videos/Create_a_premium_cinematic_bra.mp4';
  const primaryPoster =
    story?.videoPoster ||
    story?.beforeImage ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1400';

  allVideos.push({
    url: primaryUrl,
    poster: primaryPoster,
    label: story?.customer ? `${story.customer}'s Transformation` : 'Featured Transformation',
  });

  if (story?.additionalVideos && story.additionalVideos.length > 0) {
    story.additionalVideos.forEach((v, i) => {
      allVideos.push({
        url: v.url,
        poster: v.poster || primaryPoster,
        label: v.label || `Video ${i + 2}`,
      });
    });
  }

  const activeVideo = allVideos[activeVideoIndex] || allVideos[0];
  const hasMultipleClips = allVideos.length > 1;
  const hasMultipleStories = Boolean(allStories && allStories.length > 1);
  const hasMultiple = hasMultipleStories || hasMultipleClips;

  const totalCount = hasMultipleStories ? (allStories?.length ?? 1) : allVideos.length;
  const currentDisplayIndex = hasMultipleStories
    ? currentIndex !== undefined && currentIndex >= 0
      ? currentIndex
      : 0
    : activeVideoIndex;

  const customerName = story?.customer || 'Priya Patel';
  const locationText = story?.location || 'Surat, Gujarat';
  const storyTitle = story?.title || `${customerName}'s Hair Care Transformation`;
  const commentText =
    story?.comment ||
    'After trying countless synthetic shampoos without results, I discovered Labdhi Herbs. Within 3 weeks of using Herbal Kesh Sanjivani Hair Oil, hair fall reduced drastically!';
  const ratingValue = story?.rating || 5;
  const formulationName = story?.formulation || 'Herbal Kesh Sanjivani Hair Oil';
  const isVerified = story ? story.verified : true;

  // When story or active video changes, reset hover state and reload preview
  useEffect(() => {
    setIsHovered(false);
    setActiveVideoIndex(0);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [story?.id]);

  useEffect(() => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [activeVideoIndex]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Previous video navigation handler
  const handlePrev = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (hasMultipleStories && onPrevStory) {
      setActiveVideoIndex(0);
      onPrevStory();
    } else if (hasMultipleClips) {
      setActiveVideoIndex((i) => (i === 0 ? allVideos.length - 1 : i - 1));
    }
  };

  // Next video navigation handler
  const handleNext = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (hasMultipleStories && onNextStory) {
      setActiveVideoIndex(0);
      onNextStory();
    } else if (hasMultipleClips) {
      setActiveVideoIndex((i) => (i === allVideos.length - 1 ? 0 : i + 1));
    }
  };

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if deltaX is > 40px and significantly horizontal
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      if (deltaX < 0) {
        // Swiped Left -> Go Next
        handleNext(e);
      } else {
        // Swiped Right -> Go Prev
        handlePrev(e);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#EFE9DD] shadow-xl bg-[#14261E] text-white select-none">
      
      {/* Interactive Video Player & Hover Area */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsVideoModalOpen(true)}
        className="relative min-h-[440px] sm:min-h-[520px] w-full flex items-center justify-center cursor-pointer group"
      >
        {/* Background Video (Plays on Hover) */}
        <video
          ref={videoRef}
          src={activeVideo.url}
          poster={activeVideo.poster}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
            isHovered
              ? 'scale-105 filter blur-0 brightness-100'
              : 'scale-100 filter blur-xl brightness-60'
          }`}
        />

        {/* Soft Dark Gradient Layer for Contrast */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isHovered
              ? 'bg-gradient-to-t from-black/85 via-black/25 to-black/45 opacity-70'
              : 'bg-gradient-to-t from-black/90 via-black/60 to-black/75 opacity-90'
          }`}
        />

        {/* ── SIDE VIDEO NAVIGATION BUTTONS (Visible on both desktop & mobile) ── */}
        {hasMultiple && (
          <>
            {/* Left Button (Previous Video) */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Video Story"
              title="Previous Video"
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/65 hover:bg-[#14261E] border-2 border-[#D4A373]/80 hover:border-[#D4A373] text-[#D4A373] hover:text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group/nav focus:outline-none ring-0"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover/nav:-translate-x-0.5 transition-transform" />
              <span className="sr-only">Previous Video</span>
              {/* Desktop Hover Tooltip */}
              <span className="hidden sm:group-hover/nav:block absolute left-full ml-3 px-3 py-1 rounded-xl bg-[#14261E]/95 text-white text-[11px] font-semibold border border-[#D4A373]/40 whitespace-nowrap backdrop-blur-md shadow-xl pointer-events-none">
                Previous Story (Swipe ◄)
              </span>
            </button>

            {/* Right Button (Next Video) */}
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Video Story"
              title="Next Video"
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-black/65 hover:bg-[#14261E] border-2 border-[#D4A373]/80 hover:border-[#D4A373] text-[#D4A373] hover:text-white flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer group/nav focus:outline-none ring-0"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover/nav:translate-x-0.5 transition-transform" />
              <span className="sr-only">Next Video</span>
              {/* Desktop Hover Tooltip */}
              <span className="hidden sm:group-hover/nav:block absolute right-full mr-3 px-3 py-1 rounded-xl bg-[#14261E]/95 text-white text-[11px] font-semibold border border-[#D4A373]/40 whitespace-nowrap backdrop-blur-md shadow-xl pointer-events-none">
                Next Story (Swipe ►)
              </span>
            </button>
          </>
        )}

        {/* Top-Right Badge: Multi-Video Count Badge */}
        {hasMultiple && (
          <div className="absolute top-4 right-4 z-25 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-[#D4A373]/50 text-[#D4A373] text-xs font-bold shadow-lg">
            <Film className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>
              Video {currentDisplayIndex + 1} of {totalCount}
            </span>
          </div>
        )}

        {/* Default Blurred State Overlay Content (Fades out softly on hover) */}
        <div
          className={`relative z-10 max-w-4xl mx-auto px-14 sm:px-20 py-10 text-center space-y-6 transition-all duration-500 ${
            isHovered ? 'opacity-20 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            <span>Featured Customer Story • {locationText}</span>
          </div>

          {/* Heading Title */}
          <h3 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
            {storyTitle}
          </h3>

          {/* Testimonial Quote */}
          <div className="max-w-2xl mx-auto space-y-2">
            <Quote className="w-8 h-8 text-[#D4A373]/60 mx-auto" />
            <p className="text-sm sm:text-base font-serif italic text-emerald-100/90 leading-relaxed drop-shadow-sm">
              &ldquo;{commentText}&rdquo;
            </p>
          </div>

          {/* Customer Meta Info & Rating */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              {[...Array(ratingValue)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
              <span className="ml-1 text-white">{ratingValue}.0 Rating</span>
            </div>

            <span className="text-emerald-200/80 font-light">Formulation: {formulationName}</span>
            {isVerified && (
              <span className="px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-semibold">
                Verified Buyer
              </span>
            )}
          </div>

          {/* Hover Prompt Callout */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs font-bold text-[#D4A373] uppercase tracking-wider animate-pulse">
            <Play className="w-4 h-4 fill-current" />
            <span>Hover Mouse To Play Video • Click For Fullscreen Sound</span>
          </div>
        </div>

        {/* Hovered State Active Video Badge Overlay */}
        <div
          className={`absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between transition-all duration-500 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Playing: {story?.customer || 'Customer'} Story</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F3A2E] text-[#D4A373] text-xs font-bold shadow-lg border border-[#D4A373]/30">
            <Volume2 className="w-4 h-4" />
            <span>Click For Fullscreen Audio</span>
          </div>
        </div>

        {/* Bottom Pagination Dots for Multiple Videos */}
        {hasMultiple && totalCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 pointer-events-none">
            {Array.from({ length: totalCount }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentDisplayIndex
                    ? 'w-7 bg-[#D4A373] shadow-md shadow-[#D4A373]/50'
                    : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Sub-Video Thumbnail Strip (if current story has multiple clips) ── */}
      {hasMultipleClips && (
        <div className="border-t border-white/10 bg-[#14261E]/90 px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {allVideos.map((vid, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVideoIndex(idx)}
                className={`relative shrink-0 w-24 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer group/thumb ${
                  idx === activeVideoIndex
                    ? 'border-[#D4A373] shadow-lg shadow-[#D4A373]/20 scale-105'
                    : 'border-white/10 hover:border-white/40 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={vid.poster}
                  alt={vid.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                  <span className="text-[9px] font-semibold text-white leading-tight line-clamp-1">
                    {vid.label}
                  </span>
                </div>
                {idx === activeVideoIndex && (
                  <div className="absolute top-1 right-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4A373] block animate-ping" />
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-white/40 font-medium mt-1.5">
            {allVideos.length} clips in this transformation • Click thumbnail to switch clip
          </p>
        </div>
      )}

      {/* Fullscreen Video Modal with Sound */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl z-10 border border-[#D4A373]/30"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors cursor-pointer border border-white/20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Side Navigation in Fullscreen Modal */}
              {hasMultiple && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label="Previous Story"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#14261E] border border-[#D4A373]/80 text-[#D4A373] hover:text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-transform hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label="Next Story"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#14261E] border border-[#D4A373]/80 text-[#D4A373] hover:text-white flex items-center justify-center backdrop-blur-md shadow-xl transition-transform hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                  </button>
                </>
              )}

              {/* Modal video player */}
              <div className="aspect-video relative bg-black">
                <video
                  key={activeVideo.url}
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Modal Multi-Story Strip */}
              {hasMultipleStories && allStories && (
                <div className="bg-black/95 px-4 py-3 flex items-center gap-3 overflow-x-auto border-t border-white/10">
                  <span className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider shrink-0">
                    Switch Story:
                  </span>
                  {allStories.map((s, idx) => {
                    const isAct = idx === currentDisplayIndex;
                    const thumb =
                      s.videoPoster ||
                      s.beforeImage ||
                      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400';
                    return (
                      <button
                        key={s.id || idx}
                        onClick={() => {
                          if (onSelectStory) onSelectStory(idx);
                        }}
                        className={`relative shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isAct
                            ? 'bg-[#14261E] border-[#D4A373] text-[#D4A373] shadow-md'
                            : 'bg-black/60 border-white/10 text-white/70 hover:border-white/40 hover:text-white'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5 text-[#D4A373]" />
                        <span>{s.customer}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
