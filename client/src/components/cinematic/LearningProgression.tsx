import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Terminal, Activity, Zap, ShieldCheck, Sparkles, Layers, Cpu, Code2 } from 'lucide-react';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';

interface ProgressionStep {
  id: string;
  stepNumber: string;
  phase: string;
  title: string;
  tagline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  videoSrc: string;
  posterSrc: string;
  stats: { label: string; value: string }[];
  accentColor: string;
}

const PROGRESSION_STEPS: ProgressionStep[] = [
  {
    id: 'foundation',
    stepNumber: '01',
    phase: 'PHASE 1: THE BEDROCK',
    title: 'FOUNDATION',
    tagline: 'DECONSTRUCT THE INVARIANTS. FORGE SYSTEM INSTINCTS.',
    description: 'Master core CS fundamentals across Data Structures, DBMS Storage Engines, Operating System Paging, and Network Protocols. Built for 1st/2nd year engineers and transitioners to eliminate conceptual blindspots.',
    ctaText: 'EXPLORE FOUNDATIONS',
    ctaLink: '/foundations',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-typing-on-a-keyboard-in-a-dark-room-41558-large.mp4',
    posterSrc: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop',
    stats: [
      { label: 'Core Invariants', value: '1,797 Drills' },
      { label: 'CS Subjects', value: 'DBMS, OS, CN' }
    ],
    accentColor: '#00E5FF'
  },
  {
    id: 'practice',
    stepNumber: '02',
    phase: 'PHASE 2: REPETITION AT SCALE',
    title: 'PRACTICE',
    tagline: 'HIGH-FREQUENCY PROBLEM COMPILATION IN 5 RUNTIMES.',
    description: '3,555+ company-tagged problems across FAANG, Unicorns, and Enterprise Prime bands. Sub-millisecond containerized execution with memory invariant inspection and edge-case fuzz testing.',
    ctaText: 'ENTER COMPILER ARENA',
    ctaLink: '/compiler',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4',
    posterSrc: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
    stats: [
      { label: 'Problem Catalog', value: '3,555+ Verified' },
      { label: 'Execution Speed', value: 'Sub-second Sandbox' }
    ],
    accentColor: '#E02B20'
  },
  {
    id: 'pressure',
    stepNumber: '03',
    phase: 'PHASE 3: CALIBRATION UNDER STRESS',
    title: 'PRESSURE',
    tagline: 'THE 45-MINUTE PRESSURE COOKER. ZERO SECOND CHANCES.',
    description: 'Timed algorithmic sprint decks and quantitative speed drills. Calibrated against strict time ceilings to eliminate cognitive panic and build instantaneous code formulation reflexes.',
    ctaText: 'LAUNCH PRESSURE SPRINT',
    ctaLink: '/foundations',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-41557-large.mp4',
    posterSrc: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200&auto=format&fit=crop',
    stats: [
      { label: 'Timer Rigor', value: 'Strict Countdown' },
      { label: 'Speed Calibration', value: 'O(1) Memory Focus' }
    ],
    accentColor: '#F59E0B'
  },
  {
    id: 'interview-ready',
    stepNumber: '04',
    phase: 'PHASE 4: THE COCKPIT',
    title: 'INTERVIEW-READY',
    tagline: 'AUTONOMOUS VOICE BAR-RAISERS WITH REAL-TIME RUBRIC PROBING.',
    description: 'Engage in bidirectional voice mock interviews with AI interviewers emulating Amazon Bar Raisers, Google Staff Engineers, and Goldman Sachs Quant Leads with 4-dimensional score cards.',
    ctaText: 'LAUNCH MOCK SIMULATOR',
    ctaLink: '/simulator',
    videoSrc: 'https://assets.mixkit.co/videos/preview/mixkit-modern-office-lobby-with-glass-walls-and-sunlight-41559-large.mp4',
    posterSrc: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
    stats: [
      { label: 'Voice AI Rubric', value: '4-Dim Scoring' },
      { label: 'Follow-Up Probing', value: 'Dynamic Inquiries' }
    ],
    accentColor: '#10B981'
  }
];

export const LearningProgression: React.FC = () => {
  return (
    <section id="section-progression" className="bg-[#0E1418] text-white border-b border-white/10 relative overflow-hidden">
      
      {/* Narrative Section Header */}
      <div className="py-20 lg:py-24 border-b border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealLeft className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E02B20]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#E02B20] font-bold">
                THE 4-STAGE VELOCITY CURVE
              </span>
            </div>
            <h2 className="headline-section text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
              FROM RAW LOGIC <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                TO INTERVIEW DOMINANCE.
              </span>
            </h2>
            <p className="text-white/70 text-base sm:text-lg leading-relaxed">
              Just like motorsport drivers progress from karting to GT3 prototypes, engineers climb through four distinct calibrators to achieve effortless offer readiness.
            </p>
          </ScrollRevealLeft>
        </div>
      </div>

      {/* 4 Alternating Full-Width Sections */}
      <div className="divide-y divide-white/10">
        {PROGRESSION_STEPS.map((step, index) => {
          const isEven = index % 2 === 1;
          return <ProgressionSection key={step.id} step={step} isEven={isEven} />;
        })}
      </div>

    </section>
  );
};

const ProgressionSection: React.FC<{ step: ProgressionStep; isEven: boolean }> = ({ step, isEven }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative overflow-hidden py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center ${
          isEven ? 'lg:grid-flow-dense' : ''
        }`}>
          
          {/* Text Column */}
          <ScrollRevealLeft 
            direction={isEven ? 'right' : 'left'}
            className={`lg:col-span-6 space-y-6 ${isEven ? 'lg:col-start-7' : ''}`}
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-white/30">
                {step.stepNumber}
              </span>
              <span className="text-white/20">/</span>
              <span className="font-mono text-xs font-bold tracking-widest uppercase" style={{ color: step.accentColor }}>
                {step.phase}
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="headline-section text-3xl sm:text-4xl font-extrabold uppercase text-white tracking-tight">
                {step.title}
              </h3>
              <p className="font-mono text-xs sm:text-sm text-white/90 uppercase tracking-wider font-semibold">
                {step.tagline}
              </p>
            </div>

            <p className="text-base text-white/70 leading-relaxed">
              {step.description}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
              {step.stats.map(s => (
                <div key={s.label}>
                  <div className="text-xs font-mono text-white/40 uppercase tracking-wider">{s.label}</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">{s.value}</div>
                </div>
              ))}
            </div>

            {/* Single CTA Link */}
            <div>
              <Link
                to={step.ctaLink}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white hover:bg-white/90 text-black font-mono font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95"
              >
                <span>{step.ctaText}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </div>

          </ScrollRevealLeft>

          {/* Video / Visual Column */}
          <ScrollRevealLeft 
            direction={isEven ? 'left' : 'right'}
            delay={0.15}
            className={`lg:col-span-6 ${isEven ? 'lg:col-start-1' : ''}`}
          >
            <div className="relative aspect-[16/10] overflow-hidden border border-white/20 bg-black shadow-2xl group">
              
              {/* Poster image fallback */}
              <div 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ backgroundImage: `url('${step.posterSrc}')` }}
              />

              {/* Looping ambient video with IntersectionObserver lazy-play */}
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                onLoadedData={() => setVideoLoaded(true)}
                className="w-full h-full object-cover object-center opacity-85 group-hover:scale-105 transition-transform duration-700"
              >
                <source src={step.videoSrc} type="video/mp4" />
              </video>

              {/* Motorsport subtle grid & vignette overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute top-4 right-4">
                <span className="tag-caps bg-black/80 backdrop-blur-md px-3 py-1 text-[11px] font-mono text-white border border-white/20 uppercase tracking-widest">
                  STAGE {step.stepNumber}
                </span>
              </div>
            </div>
          </ScrollRevealLeft>

        </div>
      </div>
    </div>
  );
};


