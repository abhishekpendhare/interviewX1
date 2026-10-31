import React from 'react';

export const AISaasDataStream: React.FC = () => {
  return (
    <div className="relative w-full h-44 sm:h-56 lg:h-64 overflow-hidden bg-[#0B1020] flex items-center justify-center select-none pointer-events-none">
      {/* Background ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020] via-[#0E1528] to-[#0B1020]" />
      
      {/* Circuit Stream Lines SVG (Exact pattern from ref-04) */}
      <svg
        viewBox="0 0 1000 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full max-w-6xl opacity-75"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="streamGradCyan" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#2DD4D0" stopOpacity="0" />
            <stop offset="60%" stopColor="#2DD4D0" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="streamGradViolet" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6D5CFF" stopOpacity="0" />
            <stop offset="60%" stopColor="#8B7BFF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          <filter id="streamGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Trace 1 (Left Cyan Curve) */}
        <path
          d="M 280 300 L 280 180 Q 280 140 320 110 L 360 80 Q 380 60 380 20 L 380 0"
          stroke="url(#streamGradCyan)"
          strokeWidth="2.5"
          filter="url(#streamGlow)"
        />
        <circle cx="380" cy="40" r="4" fill="#2DD4D0" filter="url(#streamGlow)" />
        <circle cx="320" cy="110" r="3" fill="#FFFFFF" />

        {/* Trace 2 (Center-Left Violet Vertical) */}
        <path
          d="M 330 300 L 330 80 Q 330 50 350 30 L 350 0"
          stroke="url(#streamGradViolet)"
          strokeWidth="2"
          filter="url(#streamGlow)"
        />
        <circle cx="330" cy="90" r="4" fill="#8B7BFF" filter="url(#streamGlow)" />

        {/* Trace 3 (Center Stream Pulse Array) */}
        <path
          d="M 450 300 L 450 60"
          stroke="url(#streamGradCyan)"
          strokeWidth="3"
          strokeDasharray="12 8"
          filter="url(#streamGlow)"
        />
        <circle cx="450" cy="60" r="5" fill="#2DD4D0" filter="url(#streamGlow)" />

        {/* Trace 4 (Center-Right Rising Circuit) */}
        <path
          d="M 520 300 L 520 200 Q 520 150 560 120 L 590 100 Q 610 80 610 0"
          stroke="url(#streamGradViolet)"
          strokeWidth="2.5"
          filter="url(#streamGlow)"
        />
        <circle cx="560" cy="120" r="4" fill="#6D5CFF" filter="url(#streamGlow)" />
        <circle cx="610" cy="30" r="4" fill="#2DD4D0" filter="url(#streamGlow)" />

        {/* Trace 5 (Right Angle Circuit) */}
        <path
          d="M 640 300 L 640 160 Q 640 130 680 100 L 720 70 L 720 0"
          stroke="url(#streamGradCyan)"
          strokeWidth="2"
          filter="url(#streamGlow)"
        />
        <circle cx="640" cy="160" r="3.5" fill="#2DD4D0" filter="url(#streamGlow)" />
        <circle cx="720" cy="50" r="4" fill="#8B7BFF" filter="url(#streamGlow)" />

        {/* Trace 6 (Far Right Stream) */}
        <path
          d="M 410 300 L 410 40"
          stroke="url(#streamGradViolet)"
          strokeWidth="2.5"
          strokeDasharray="10 6"
          filter="url(#streamGlow)"
        />
        <circle cx="410" cy="40" r="4.5" fill="#FFFFFF" filter="url(#streamGlow)" />
      </svg>
    </div>
  );
};
