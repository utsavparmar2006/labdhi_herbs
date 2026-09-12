'use client';

interface OriginalTransparentLogoProps {
  className?: string;
  isDarkBackground?: boolean;
}

export default function OriginalTransparentLogo({
  className = 'h-10 sm:h-12 w-auto',
  isDarkBackground = false,
}: OriginalTransparentLogoProps) {
  return (
    <img
      src="/logo-transparent.png"
      alt="Labdhi Herbs"
      width={280}
      height={72}
      className={`${className} object-contain transition-transform duration-300`}
      style={{
        filter: isDarkBackground ? 'drop-shadow(0px 2px 6px rgba(0,0,0,0.75))' : 'none',
      }}
      loading="eager"
      decoding="async"
    />
  );
}
