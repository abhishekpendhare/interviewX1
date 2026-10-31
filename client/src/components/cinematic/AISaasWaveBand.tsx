import React from 'react';

export const AISaasWaveBand: React.FC = () => {
  return (
    <div className="relative w-full h-40 sm:h-52 lg:h-60 overflow-hidden bg-[#0B1020] pointer-events-none select-none">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#6D5CFF]/10 via-[#2DD4D0]/15 to-[#8B7BFF]/10" />

      {/* Flowing Teal Light Ribbons SVG (Matching ref-06) */}
      <svg
        viewBox="0 0 1200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover opacity-60 mix-blend-screen"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2DD4D0" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#2DD4D0" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#6D5CFF" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#8B7BFF" stopOpacity="0.1" />
          </linearGradient>

          <filter id="waveGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Smooth flowing ribbon wave 1 */}
        <path
          d="M 0 100 Q 300 20, 600 110 T 1200 60"
          stroke="url(#waveGrad)"
          strokeWidth="6"
          filter="url(#waveGlow)"
        />

        {/* Smooth flowing ribbon wave 2 */}
        <path
          d="M 0 140 Q 350 180, 700 80 T 1200 130"
          stroke="url(#waveGrad)"
          strokeWidth="3.5"
          opacity="0.8"
        />

        {/* Smooth flowing ribbon wave 3 */}
        <path
          d="M 0 60 Q 400 120, 800 40 T 1200 100"
          stroke="url(#waveGrad)"
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
