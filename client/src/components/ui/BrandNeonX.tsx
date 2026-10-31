import React from 'react';

interface BrandNeonXProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'footer';
  className?: string;
  withGlow?: boolean;
}

export const BrandNeonX: React.FC<BrandNeonXProps> = ({
  size = 'md',
  className = '',
  withGlow = true
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    hero: 'w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72',
    footer: 'w-24 h-24 sm:w-32 sm:h-32'
  };

  const strokeWidths = {
    sm: 3,
    md: 3.5,
    lg: 4,
    hero: 5.5,
    footer: 4.5
  };

  const currentSize = sizeClasses[size];
  const strokeW = strokeWidths[size];

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${currentSize} ${className}`}>
      {/* Outer ambient glow blur */}
      {withGlow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2DD4D0]/30 via-[#6D5CFF]/40 to-[#B87BFF]/30 blur-2xl rounded-full scale-110 pointer-events-none opacity-80 animate-pulse" />
      )}

      {/* SVG Neon Outlined X */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(109,92,255,0.8)]"
      >
        <defs>
          <linearGradient id="neonXGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="40%" stopColor="#818CF8" />
            <stop offset="75%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#2DD4D0" />
          </linearGradient>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Geometric Outlined X Paths with Neon Gradient Stroke */}
        {/* Arm 1: Top-Left to Bottom-Right */}
        <path
          d="M 22 18 L 40 18 L 82 82 L 64 82 Z"
          stroke="url(#neonXGrad)"
          strokeWidth={strokeW}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#neonGlow)"
          className="fill-transparent opacity-95"
        />

        {/* Arm 2: Top-Right to Bottom-Left */}
        <path
          d="M 78 18 L 60 18 L 18 82 L 36 82 Z"
          stroke="url(#neonXGrad)"
          strokeWidth={strokeW}
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#neonGlow)"
          className="fill-transparent opacity-95"
        />

        {/* Inner core highlights */}
        <line
          x1="31"
          y1="18"
          x2="73"
          y2="82"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />
        <line
          x1="69"
          y1="18"
          x2="27"
          y2="82"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.4"
        />
      </svg>
    </div>
  );
};
