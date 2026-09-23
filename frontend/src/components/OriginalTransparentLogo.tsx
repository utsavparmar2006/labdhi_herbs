'use client';

import { useSiteSettings } from '../context/SiteSettingsContext';

interface OriginalTransparentLogoProps {
  className?: string;
  isDarkBackground?: boolean;
}

export default function OriginalTransparentLogo({
  className = 'h-10 sm:h-12 w-auto',
  isDarkBackground = false,
}: OriginalTransparentLogoProps) {
  const { settings } = useSiteSettings();
  const configuredLogo = settings.logoDark || settings.logoLight;

  if (configuredLogo) {
    const src = configuredLogo.startsWith('http')
      ? configuredLogo
      : `http://localhost:5000${configuredLogo}`;

    return (
      <img
        src={src}
        alt="Labdhi Herbs"
        className={`${className} object-contain transition-transform duration-300`}
        style={{
          filter: isDarkBackground
            ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.45))'
            : 'none',
        }}
        loading="eager"
        decoding="async"
      />
    );
  }

  return (
    <img
      src="/logo-transparent.png"
      alt="Labdhi Herbs"
      width={280}
      height={72}
      className={`${className} object-contain transition-transform duration-300`}
      style={{
        filter: isDarkBackground
          ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.85)) drop-shadow(0 0 1px rgba(255,255,255,0.45))'
          : 'none',
      }}
      loading="eager"
      decoding="async"
    />
  );
}
