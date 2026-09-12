'use me';
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, SlidersHorizontal, Leaf, CheckCircle2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage?: string;
  afterImage?: string;
  title?: string;
  subtitle?: string;
  formulationUsed?: string;
}

export default function BeforeAfterSlider({
  beforeImage = 'https://images.unsplash.com/photo-1512290900676-26c2a46486b6?auto=format&fit=crop&q=80&w=1200',
  afterImage = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=1200',
  title = 'Real Herbal Transformation Results',
  subtitle = 'Drag the slider left and right to see 4-week natural skin & hair recovery with Labdhi Herbs formulations.',
  formulationUsed = 'Beautiction Face Pack & Soft N Silky Ointment',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="bg-white rounded-3xl border border-[#EFE9DD] p-6 sm:p-10 shadow-xs space-y-8">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#EFE9DD] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#71846C] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#B58A5A]" />
            <span>Interactive Comparison</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A201C]">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#1F3A2E] font-semibold bg-[#1F3A2E]/10 px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Formulation: {formulationUsed}</span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 font-light max-w-2xl">
        {subtitle}
      </p>

      {/* Before / After Slider Box */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
        className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#EFE9DD] shadow-lg bg-[#14261E]"
      >
        {/* After Image (Full Background) */}
        <img
          src={afterImage}
          alt="After Treatment Transformation"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* After Badge */}
        <span className="absolute top-4 right-4 z-10 px-3.5 py-1.5 rounded-full bg-[#1F3A2E]/90 backdrop-blur-md border border-[#D4A373]/40 text-[#D4A373] text-xs font-bold uppercase tracking-wider shadow-md">
          AFTER (Week 4 • Glowing Skin)
        </span>

        {/* Before Image (Clipped Left Layer) */}
        <div
          style={{ width: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 left-0 overflow-hidden z-10 border-r-2 border-white shadow-2xl transition-none"
        >
          <img
            src={beforeImage}
            alt="Before Treatment Initial State"
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
          />

          {/* Before Badge */}
          <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-md">
            BEFORE (Day 1 • Blemished)
          </span>
        </div>

        {/* Vertical Divider Drag Handle Line */}
        <div
          style={{ left: `${sliderPosition}%` }}
          className="absolute top-0 bottom-0 z-20 -ml-0.5 w-1 bg-white shadow-2xl transition-none pointer-events-none"
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-[#1F3A2E] border-2 border-white shadow-2xl flex items-center justify-center text-[#D4A373]">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold flex items-center gap-2 pointer-events-none">
          <span>◄ Drag left & right to compare ►</span>
        </div>
      </div>

    </div>
  );
}
