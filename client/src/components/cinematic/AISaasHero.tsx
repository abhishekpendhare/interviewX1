import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MoreHorizontal, Sparkles, Volume2, MessageSquare, Play } from 'lucide-react';
import { BrandNeonX } from '@/components/ui/BrandNeonX';
import { useAuth } from '@/lib/authContext';

interface HeroSlide {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  paragraph: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    badge: 'AI Mock Engine',
    headlineLine1: 'InterviewX',
    headlineLine2: 'Placement Arena',
    paragraph: 'Practice high-frequency company algorithms, real-time voice bar-raisers, and system design trade-offs with autonomous rubric feedback.',
    primaryCtaText: 'Launch Arena',
    primaryCtaLink: '/compiler',
    secondaryCtaText: 'Learn More',
    secondaryCtaLink: '/simulator'
  },
  {
    badge: 'Voice Bar-Raiser',
    headlineLine1: 'Precision AI',
    headlineLine2: 'Voice Cockpit',
    paragraph: 'Bidirectional voice mock interviews with AI interviewers that probe your time complexity, edge cases, and STAR behavioral narratives.',
    primaryCtaText: 'Start Voice Mock',
    primaryCtaLink: '/simulator',
    secondaryCtaText: 'View Rubrics',
    secondaryCtaLink: '/articles'
  },
  {
    badge: '60-Day Sprint',
    headlineLine1: 'Calibrated',
    headlineLine2: 'Career Tracks',
    paragraph: 'Day-by-day curated curriculum for Tier-1 Product SDE (FAANG), Unicorn Backend, and Enterprise Prime Specialist placements.',
    primaryCtaText: 'Explore Tracks',
    primaryCtaLink: '/foundations',
    secondaryCtaText: 'Study Plans',
    secondaryCtaLink: '/planner'
  }
];

export const AISaasHero: React.FC = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Autoplay hero carousel (slow rotation, pause on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section 
      id="section-hero" 
      className="relative min-h-[90vh] lg:min-h-[95vh] flex flex-col justify-center overflow-hidden bg-[#0B1020] text-white pt-8 pb-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background ambient lighting and particle glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#6D5CFF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#2DD4D0]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#8B7BFF]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: HERO COPY & CTAS (Exact match to ref-01)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Pill Tag: "Premium" (white) + "AI Mock Engine" (violet glass pill) */}
            <div className="flex items-center gap-2.5">
              <span className="font-heading font-bold text-xs tracking-wider text-white uppercase">
                Premium
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#8B7BFF] bg-[#6D5CFF]/15 border border-[#6D5CFF]/30 backdrop-blur-md shadow-sm">
                {slide.badge}
              </span>
            </div>

            {/* Very Large Two-Line Headline */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`headline-${currentSlide}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-1"
              >
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.05]">
                  {slide.headlineLine1} <br />
                  <span className="bg-gradient-to-r from-white via-white/95 to-white/70 bg-clip-text text-transparent">
                    {slide.headlineLine2}
                  </span>
                </h1>
              </motion.div>
            </AnimatePresence>

            {/* Short Supporting Paragraph */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`paragraph-${currentSlide}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-white/75 font-normal max-w-xl leading-relaxed"
              >
                {slide.paragraph}
              </motion.p>
            </AnimatePresence>

            {/* Buttons Row: Gradient Primary CTA + Outlined Secondary + Circular Ellipsis Button */}
            <div className="pt-2 flex items-center gap-3.5">
              {/* Primary Gradient Button */}
              <Link
                to={user ? slide.primaryCtaLink : `/signup?next=${encodeURIComponent(slide.primaryCtaLink)}`}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] hover:opacity-95 text-white font-semibold text-sm shadow-[0_0_25px_rgba(109,92,255,0.45)] transition-all duration-200 active:scale-95 flex items-center gap-2"
              >
                <span>{slide.primaryCtaText}</span>
              </Link>

              {/* Outlined Secondary Button */}
              <Link
                to={user ? slide.secondaryCtaLink : `/login?next=${encodeURIComponent(slide.secondaryCtaLink)}`}
                className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all duration-200"
              >
                {slide.secondaryCtaText}
              </Link>

              {/* Circular Ellipsis Button */}
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
                aria-label="Next hero slide"
                className="w-11 h-11 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Pager Dashes (Three horizontal lines matching ref-01) */}
            <div className="pt-6 flex items-center gap-2">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to hero slide ${index + 1}`}
                  className={`h-1 transition-all duration-300 rounded-full ${
                    currentSlide === index
                      ? 'w-8 bg-white shadow-[0_0_8px_white]'
                      : 'w-4 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: NEON X + ORBITS + PHOTO CARD + FLOATING WIDGETS
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end mt-8 lg:mt-0">
            <div className="relative w-full max-w-[480px] sm:max-w-[540px] aspect-[4/3] flex items-center justify-center">
              
              {/* Thin Rotated Orbit Ellipses */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Ellipse 1 (Cyan tint) */}
                <div className="w-[440px] sm:w-[500px] h-[220px] sm:h-[260px] border border-[#2DD4D0]/35 rounded-[50%] -rotate-12 absolute animate-[spin_40s_linear_infinite]" />
                
                {/* Ellipse 2 (Violet tint) */}
                <div className="w-[380px] sm:w-[440px] h-[190px] sm:h-[220px] border border-[#8B7BFF]/35 rounded-[50%] rotate-24 absolute animate-[spin_55s_linear_infinite_reverse]" />
                
                {/* Orbiting node dots */}
                <div className="absolute -top-3 right-12 w-2.5 h-2.5 rounded-full bg-[#2DD4D0] shadow-[0_0_10px_#2DD4D0] animate-pulse" />
                <div className="absolute bottom-4 left-10 w-2 h-2 rounded-full bg-[#8B7BFF] shadow-[0_0_8px_#8B7BFF]" />
              </div>

              {/* Large Glowing Neon X Brandmark (Left-center behind photo) */}
              <motion.div
                animate={{
                  y: [0, -6, 0],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute left-2 sm:left-4 z-10"
              >
                <BrandNeonX size="hero" withGlow={true} />
              </motion.div>

              {/* Rounded Photo Card (Overlapping right) */}
              <div className="relative z-20 w-[240px] sm:w-[280px] md:w-[310px] aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 bg-gradient-to-tr from-[#16203D] to-[#253664] shadow-[0_20px_50px_rgba(0,0,0,0.6)] ml-auto mr-4 sm:mr-8">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
                  alt="Candidate practicing AI mock interview"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/70 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* ─────────────────────────────────────────────────────────
                  FLOATING GLASS CHAT WIDGETS (Exact match to ref-01)
                 ───────────────────────────────────────────────────────── */}
              
              {/* Widget 1: Top-Right Purple Glass "Typing / Active" Bubble */}
              <motion.div
                animate={{
                  y: [0, -8, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="absolute top-6 right-0 z-30 bg-[#6D5CFF]/85 backdrop-blur-xl border border-white/25 rounded-2xl px-4 py-2.5 shadow-[0_8px_24px_rgba(109,92,255,0.4)] flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" />
              </motion.div>

              {/* Widget 2: Bottom-Right Translucent Glass "Message + Audio" Bubble */}
              <motion.div
                animate={{
                  y: [0, 8, 0]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.5
                }}
                className="absolute -bottom-2 right-2 sm:right-6 z-30 bg-[#16203D]/90 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 text-white"
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/90">
                  <MessageSquare className="w-4 h-4" />
                </div>
                {/* Audio Waveform visualization */}
                <div className="flex items-center gap-0.5 h-4">
                  <span className="w-0.5 h-2 bg-[#2DD4D0] rounded-full animate-pulse" />
                  <span className="w-0.5 h-4 bg-[#2DD4D0] rounded-full animate-pulse [animation-delay:0.1s]" />
                  <span className="w-0.5 h-3 bg-[#6D5CFF] rounded-full animate-pulse [animation-delay:0.2s]" />
                  <span className="w-0.5 h-4 bg-[#8B7BFF] rounded-full animate-pulse [animation-delay:0.3s]" />
                  <span className="w-0.5 h-1.5 bg-[#2DD4D0] rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
                <Volume2 className="w-4 h-4 text-white/70" />
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
