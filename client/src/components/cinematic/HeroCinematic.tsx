import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

export const HeroCinematic: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // IntersectionObserver to only play video when visible in viewport (Performance rule)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {
              // Autoplay policy or reduced motion fallback
            });
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="section-hero" className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-between overflow-hidden bg-[#0E1418] text-white border-b border-white/10">
      {/* Background Video with Poster Fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* High-res cinematic tech poster image fallback */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2000&auto=format&fit=crop')`,
          }}
        />

        {/* Cinematic looping ambient background video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setVideoLoaded(true)}
          className="w-full h-full object-cover object-center opacity-30 mix-blend-screen scale-105"
        >
          {/* Lightweight high-tech abstract particle loop */}
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Motorsport dark gradient overlays for maximum contrast and legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1418] via-[#0E1418]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E1418] via-[#0E1418]/80 to-transparent" />
        <div className="absolute inset-0 tech-grid-bg opacity-30" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 lg:pt-44 pb-16 flex-1 flex flex-col justify-center">
        <div className="max-w-4xl space-y-6">
          
          {/* Brand Hashtag & Telemetry Tag */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <span className="tag-caps text-[#E02B20] flex items-center gap-2 font-mono text-xs sm:text-sm tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-[#E02B20] animate-pulse" />
              #PlacementReady
            </span>
            <span className="text-white/30 text-xs">/</span>
            <span className="tag-caps text-white/70 font-mono text-xs tracking-wider">
              AUTONOMOUS INTERVIEW ENGINE
            </span>
          </motion.div>

          {/* Motorsport Bold Display Headline */}
          <motion.h1 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="headline-hero font-extrabold tracking-tight text-white uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]"
          >
            PRECISION <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              AT THE LIMIT.
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-xl text-white/75 font-normal max-w-2xl leading-relaxed"
          >
            Autonomous evaluation, real-time voice bar-raisers, and verified company problem sets engineered for peak placement velocity.
          </motion.p>

          {/* Single High-Impact CTA Button */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="pt-4 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/compiler"
              className="btn-racing-primary group inline-flex items-center gap-3 px-8 py-4 bg-[#E02B20] hover:bg-[#c9241a] text-white font-bold tracking-wider text-sm uppercase transition-all duration-200 shadow-lg shadow-[#E02B20]/20 active:scale-[0.98]"
            >
              <span>LAUNCH ARENA</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              to="/simulator"
              className="btn-racing-secondary inline-flex items-center gap-2.5 px-6 py-4 border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-medium tracking-wider text-sm uppercase transition-all duration-200 backdrop-blur-sm"
            >
              <Activity className="w-4 h-4 text-[#00E5FF]" />
              <span>VOICE MOCK COCKPIT</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Telemetry Strip / Metrics Footer */}
      <div className="relative z-10 border-t border-white/10 bg-[#0E1418]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col justify-center">
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">VERIFIED PROBLEMS</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-white">3,555+</span>
          </div>
          <div className="flex flex-col justify-center md:pl-6">
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">CS CORE SPRINTS</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-white">1,797+</span>
          </div>
          <div className="flex flex-col justify-center md:pl-6 pt-4 md:pt-0">
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">RUBRIC EVALUATION</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#00E5FF]">4-DIM VOICE AI</span>
          </div>
          <div className="flex flex-col justify-center md:pl-6 pt-4 md:pt-0">
            <span className="font-mono text-xs text-white/50 uppercase tracking-widest">CODE EXECUTION</span>
            <span className="font-heading font-bold text-xl sm:text-2xl text-[#2DD4D0]">REAL-TIME SANDBOX</span>
          </div>
        </div>
      </div>
    </section>
  );
};
