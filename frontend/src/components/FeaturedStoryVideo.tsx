'use me';
'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, X, Star, ShieldCheck, Quote, Sparkles, Volume2, Film, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SuccessStory } from '../types';

interface FeaturedStoryVideoProps {
  story?: SuccessStory | null;
}

interface VideoEntry {
  url: string;
  poster: string;
  label: string;
}

export default function FeaturedStoryVideo({ story }: FeaturedStoryVideoProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Build the full ordered video list: primary + additionalVideos
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
  const hasMultiple = allVideos.length > 1;

  const customerName = story?.customer || 'Priya Patel';
  const locationText = story?.location || 'Surat, Gujarat';
  const storyTitle = story?.title || "Priya Patel's Hair Care Transformation";
  const commentText =
    story?.comment ||
    'After trying countless synthetic shampoos without results, I discovered Labdhi Herbs. Within 3 weeks of using Herbal Kesh Sanjivani Hair Oil, hair fall reduced drastically!';
  const ratingValue = story?.rating || 5;
  const formulationName = story?.formulation || 'Herbal Kesh Sanjivani Hair Oil';
  const isVerified = story ? story.verified : true;

  // When active video changes, reset hover state so poster shows cleanly
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

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIndex((i) => (i === 0 ? allVideos.length - 1 : i - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveVideoIndex((i) => (i === allVideos.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[#EFE9DD] shadow-xl bg-[#14261E] text-white">
      
      {/* Interactive Hover Area Container */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsVideoModalOpen(true)}
        className="relative min-h-[440px] sm:min-h-[500px] w-full flex items-center justify-center cursor-pointer group"
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
            isHovered ? 'scale-105 filter blur-0 brightness-100' : 'scale-100 filter blur-xl brightness-60'
          }`}
        />

        {/* Soft Dark Gradient Layer for Contrast */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isHovered
              ? 'bg-gradient-to-t from-black/80 via-black/20 to-black/40 opacity-60'
              : 'bg-gradient-to-t from-black/90 via-black/60 to-black/70 opacity-90'
          }`}
        />

        {/* Prev/Next arrows (only when multiple videos) */}
        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Default Blurred State Overlay Content (Fades out softly on hover) */}
        <div
          className={`relative z-10 max-w-4xl mx-auto px-6 sm:px-12 py-10 text-center space-y-6 transition-all duration-500 ${
            isHovered ? 'opacity-20 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          }`}
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A373] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#D4A373]" />
            <span>Featured Customer Story • {locationText}</span>
          </div>

          {/* Video label if multiple */}
          {hasMultiple && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/30 text-[#D4A373] text-xs font-semibold">
              <Film className="w-3.5 h-3.5" />
              <span>{activeVideo.label}</span>
              <span className="opacity-60">({activeVideoIndex + 1}/{allVideos.length})</span>
            </div>
          )}

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
            <span>Hover Mouse To Play Video • Click For Sound</span>
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
            <span>Playing: {activeVideo.label}</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F3A2E] text-[#D4A373] text-xs font-bold shadow-lg border border-[#D4A373]/30">
            <Volume2 className="w-4 h-4" />
            <span>Click For Fullscreen Audio</span>
          </div>
        </div>

      </div>

      {/* ── Video Thumbnail Strip (multiple videos only) ────────────────── */}
      {hasMultiple && (
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
                {/* Poster thumbnail */}
                <img
                  src={vid.poster}
                  alt={vid.label}
                  className="w-full h-full object-cover"
                />
                {/* Play overlay */}
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
            {allVideos.length} video{allVideos.length !== 1 ? 's' : ''} in this story • Click a thumbnail to switch
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
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/20"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal video player */}
              <div className="aspect-video">
                <video
                  key={activeVideo.url}
                  src={activeVideo.url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Modal thumbnail strip */}
              {hasMultiple && (
                <div className="bg-black/90 px-4 py-3 flex items-center gap-2 overflow-x-auto border-t border-white/10">
                  {allVideos.map((vid, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveVideoIndex(idx)}
                      className={`relative shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                        idx === activeVideoIndex
                          ? 'border-[#D4A373]'
                          : 'border-white/10 hover:border-white/40 opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img src={vid.poster} alt={vid.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-end p-1">
                        <span className="text-[8px] font-semibold text-white leading-tight line-clamp-1">
                          {vid.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
