import React from 'react';

interface FacelessLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
}

export const FacelessLogo: React.FC<FacelessLogoProps> = ({
  className = '',
  size = 'md',
  showWordmark = true,
}) => {
  const iconDimensions = {
    sm: 'h-7 w-7',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-24 w-24',
  }[size];

  const textSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Hooded Figure with Yellow Masquerade Mask SVG */}
      <div className={`relative ${iconDimensions} shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full drop-shadow-md"
        >
          {/* Subtle outer glow / backdrop container */}
          <rect width="100" height="100" rx="22" fill="#0A0A0C" className="stroke-neutral-800/80 stroke-1" />

          {/* Hood Silhouette (Black/Dark Charcoal cowl with sharp modern curves) */}
          <path
            d="M50 14C33 14 26 26 24 38C22 50 25 64 34 74C37 77 43 78 50 82C58 84 66 79 70 73C77 62 78 47 75 35C72 23 64 14 50 14Z"
            fill="#17171C"
          />

          {/* Hood Left Edge / Shoulder Fold */}
          <path
            d="M24 38C22 50 25 64 34 74L30 83C21 73 17 58 19 44C20 34 25 24 34 17L38 23C30 28 26 33 24 38Z"
            fill="#09090B"
          />

          {/* Inner Face Negative Space (White/Off-white stylized face & sharp chin) */}
          <path
            d="M48 27C55 27 63 32 66 40C68 45 68 53 64 61C61 68 56 75 51 79C49 76 48 72 49 68C49 64 53 58 53 54C53 48 48 43 45 37C44 34 45 30 48 27Z"
            fill="#FFFFFF"
          />

          {/* Sharp Chin Contour */}
          <path
            d="M51 79C52 74 54 69 55 64L60 69C57 73 54 77 51 79Z"
            fill="#09090B"
          />

          {/* Golden Yellow Masquerade Mask */}
          {/* Main butterfly / domino mask body */}
          <path
            d="M43 44C47 41 53 41 57 44C62 40 70 39 74 43C78 47 77 53 73 57C68 62 60 59 57 56C55 58 52 61 48 60C43 59 40 54 41 49C41 46 42 45 43 44Z"
            fill="#FBBF24"
          />
          {/* Mask Eye Opening (Left) */}
          <ellipse cx="48" cy="48" rx="4" ry="2.5" transform="rotate(-15 48 48)" fill="#17171C" />
          {/* Mask Eye Opening (Right) */}
          <ellipse cx="64" cy="48.5" rx="4.5" ry="3" transform="rotate(15 64 48.5)" fill="#17171C" />

          {/* Mask Wing Accent & Highlight */}
          <path
            d="M74 43C77 40 80 41 81 44C81 47 79 50 76 52C77 48 76 45 74 43Z"
            fill="#F59E0B"
          />
          <path
            d="M42 45C39 43 37 45 37 48C37 51 39 53 42 54C41 51 41 48 42 45Z"
            fill="#D97706"
          />
        </svg>
      </div>

      {/* Styled Wordmark (Faceless with Green F Top Curve) */}
      {showWordmark && (
        <div className={`flex items-baseline font-extrabold tracking-tight select-none ${textSize}`}>
          {/* Styled F */}
          <span className="relative inline-flex items-baseline">
            <span className="text-emerald-500 font-black">F</span>
            {/* Green curved accent stripe atop the F */}
            <span className="absolute -top-1 left-0 right-0 h-1 rounded-full bg-emerald-500 opacity-90" />
          </span>
          {/* Rest of "aceless" */}
          <span className="text-white tracking-normal font-bold">aceless</span>
        </div>
      )}
    </div>
  );
};
