'use client';

import { useState, useEffect } from 'react';
import { getHomePageConfig } from '../services/api';
import { HeroSectionConfig } from '../types';

export default function VideoHero() {
  const [heroConfig, setHeroConfig] = useState<HeroSectionConfig>({
    videoUrl: '/videos/Create_a_premium_cinematic_bra.mp4',
  });

  useEffect(() => {
    let isMounted = true;
    const loadHero = async () => {
      try {
        const data = await getHomePageConfig();
        if (data?.heroSection && isMounted) {
          setHeroConfig((prev) => ({
            ...prev,
            ...data.heroSection,
          }));
        }
      } catch (e) {
        // Fallback
      }
    };

    loadHero();

    const handleUpdate = (e: any) => {
      if (e.detail?.heroSection && isMounted) {
        setHeroConfig((prev) => ({
          ...prev,
          ...e.detail.heroSection,
        }));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('homepageConfigUpdated', handleUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('homepageConfigUpdated', handleUpdate);
      }
    };
  }, []);

  return (
    <section className="relative w-full h-[60vh] sm:h-[75vh] md:h-[85vh] lg:h-screen min-h-[420px] sm:min-h-[520px] flex items-center justify-center overflow-hidden bg-[#14261E]">
      {/* HTML5 Cinematic Video Element */}
      <video
        key={heroConfig.videoUrl || 'default-hero'}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src={heroConfig.videoUrl || '/videos/Create_a_premium_cinematic_bra.mp4'}
          type="video/mp4"
        />
        <source
          src="/Create_a_premium_cinematic_bra.mp4"
          type="video/mp4"
        />
      </video>

      {/* Subtle bottom edge gradient to seamlessly blend into next section */}
      <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-[#14261E]/80 to-transparent pointer-events-none z-10" />
    </section>
  );
}
