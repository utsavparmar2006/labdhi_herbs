'use me';
'use client';

interface LabdhiLogoProps {
  className?: string;
  isDarkBackground?: boolean;
}

export default function LabdhiLogo({ className = "h-10 w-auto", isDarkBackground = false }: LabdhiLogoProps) {
  const textColor = isDarkBackground ? "#FFFFFF" : "#1B5E20";
  const subTextColor = isDarkBackground ? "#D4A373" : "#2E7D32";

  return (
    <svg
      viewBox="0 0 320 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Mortar & Pestle + Botanical Leaves Group */}
      <g id="logo-icon">
        {/* Outer Circular Leaf Stem */}
        <path
          d="M 52 75 C 24 75 8 54 10 32 C 12 18 22 8 36 6 C 28 18 30 36 44 42"
          stroke="#2E7D32"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        
        {/* Mortar Bowl */}
        <path
          d="M 22 42 L 58 42 C 60 58 50 68 40 68 C 30 68 20 58 22 42 Z"
          fill="url(#mortar-grad)"
          stroke="#3E2723"
          strokeWidth="1.5"
        />
        <ellipse cx="40" cy="42" rx="18" ry="4" fill="#2E7D32" opacity="0.4" />

        {/* Pestle Handle */}
        <path
          d="M 46 42 L 54 28 C 56 25 59 26 57 29 L 48 42 Z"
          fill="#5D4037"
        />

        {/* Droplet falling into bowl */}
        <path
          d="M 40 33 C 40 33 43 37 40 39 C 37 37 40 33 40 33 Z"
          fill="#81C784"
        />

        {/* Main Lush Green Leaf (Left Upper) */}
        <path
          d="M 32 30 C 14 16 10 2 28 4 C 42 6 40 22 32 30 Z"
          fill="url(#leaf-grad-1)"
        />
        <path
          d="M 28 4 C 26 16 32 30 32 30"
          stroke="#1B5E20"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Medium Leaf (Left Mid) */}
        <path
          d="M 22 36 C 8 28 4 16 18 18 C 28 20 26 32 22 36 Z"
          fill="url(#leaf-grad-2)"
        />

        {/* Top Right Floating Accent Leaf */}
        <path
          d="M 270 14 C 255 4 250 -4 265 -2 C 278 0 276 12 270 14 Z"
          fill="url(#leaf-grad-1)"
        />
        <path
          d="M 268 8 C 268 8 270 11 268 13 C 266 11 268 8 268 8 Z"
          fill="#A5D6A7"
        />
      </g>

      {/* Brand Name Typography */}
      <g id="logo-text">
        {/* LABDHI */}
        <text
          x="72"
          y="44"
          fill={textColor}
          fontSize="36"
          fontWeight="900"
          fontFamily="Georgia, 'Times New Roman', serif"
          letterSpacing="1.5"
        >
          LABDHI
        </text>

        {/* Herbs */}
        <text
          x="180"
          y="72"
          fill={subTextColor}
          fontSize="30"
          fontWeight="bold"
          fontStyle="italic"
          fontFamily="'Playfair Display', 'Brush Script MT', Georgia, serif"
        >
          Herbs
        </text>
      </g>

      {/* Gradients */}
      <defs>
        <linearGradient id="mortar-grad" x1="22" y1="42" x2="58" y2="68" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8D6E63" />
          <stop offset="1" stopColor="#4E342E" />
        </linearGradient>
        <linearGradient id="leaf-grad-1" x1="10" y1="2" x2="40" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#66BB6A" />
          <stop offset="1" stopColor="#2E7D32" />
        </linearGradient>
        <linearGradient id="leaf-grad-2" x1="4" y1="16" x2="26" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A5D6A7" />
          <stop offset="1" stopColor="#388E3C" />
        </linearGradient>
      </defs>
    </svg>
  );
}
