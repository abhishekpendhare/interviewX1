import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Zap, Building2, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';

interface TrackProgram {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;
  curriculum: string[];
  ctaText: string;
  ctaHref: string;
  bgGradient: string;
}

const TRACK_PROGRAMS: TrackProgram[] = [
  {
    id: 'foundation-program',
    badge: '1ST & 2ND YEAR CADETS',
    badgeColor: 'text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/10',
    title: 'FOUNDATION ACADEMY',
    subtitle: 'Zero-to-One Systems & Algorithmic Instincts',
    duration: '12-Month Self-Paced',
    description: 'Designed for early engineering semesters to master C++/Java memory invariants, standard library internals, and core data structure implementations before campus season arrives.',
    curriculum: [
      'OOP Architecture & Invariant Design',
      'Data Structure Implementations from Scratch',
      'DBMS Storage Engines & SQL Optimization',
      'OS Processes, Virtual Memory & Threading'
    ],
    ctaText: 'START FOUNDATION',
    ctaHref: '/foundations',
    bgGradient: 'from-cyan-950/30 via-black to-[#0E1418]'
  },
  {
    id: 'placement-sprint',
    badge: '3RD & 4TH YEAR SPRINT',
    badgeColor: 'text-[#E02B20] border-[#E02B20]/30 bg-[#E02B20]/10',
    title: '60-DAY SPRINT',
    subtitle: 'High-Density Pre-Placement Velocity',
    duration: '8 Weeks Intensive',
    description: 'A relentless day-by-day regimen covering high-frequency LeetCode patterns, timed aptitude speed runs, and daily AI voice mock bar-raisers to peak at interview time.',
    curriculum: [
      'Top 150 High-Frequency LeetCode Patterns',
      'Quantitative Arithmetic & Logic Speed Drills',
      'STAR Method Behavioral Masterclasses',
      'Daily Voice AI Bar-Raiser Simulations'
    ],
    ctaText: 'JOIN 60-DAY SPRINT',
    ctaHref: '/planner',
    bgGradient: 'from-red-950/30 via-black to-[#0E1418]'
  },
  {
    id: 'company-specific',
    badge: 'TARGETED RIGOR',
    badgeColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
    title: 'COMPANY TRACKS',
    subtitle: 'Calibrated for Top-Tier Hiring Bars',
    duration: 'Adaptive Drills',
    description: 'Deep-dive problem banks reverse-engineered from recent hiring drives at Amazon, Google, Microsoft, TCS Prime, Infosys Specialist, and elite fintech startups.',
    curriculum: [
      'Amazon 16 Leadership Principles Rubric',
      'Google Algorithmic Entropy & Proof Standards',
      'TCS Prime Advanced Aptitude & DP Section',
      'Fintech Concurrency & Low-Latency Drills'
    ],
    ctaText: 'SELECT COMPANY',
    ctaHref: '/compiler',
    bgGradient: 'from-amber-950/30 via-black to-[#0E1418]'
  }
];

export const TracksTrio: React.FC = () => {
  return (
    <section id="section-tracks" className="py-20 lg:py-28 bg-[#0E1418] text-white border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <ScrollRevealLeft className="max-w-3xl space-y-4 mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E02B20]" />
            <span className="font-mono text-xs uppercase tracking-widest text-[#E02B20] font-bold">
              STANDARDIZED TRAINING REGIMENS
            </span>
          </div>
          <h2 className="headline-section text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
            ENGINEERED FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
              EVERY CAREER STAGE.
            </span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed">
            Whether you have three semesters before internships or three weeks before day-one campus recruitment, select the calibrated curriculum built for your timeline.
          </p>
        </ScrollRevealLeft>

        {/* The 3 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {TRACK_PROGRAMS.map((prog, idx) => (
            <ScrollRevealLeft
              key={prog.id}
              staggerIndex={idx}
              className={`relative bg-gradient-to-b ${prog.bgGradient} border border-white/15 hover:border-white/40 p-8 flex flex-col justify-between space-y-8 group transition-all duration-300 shadow-xl`}
            >
              <div className="space-y-6">
                
                {/* Badge & Duration */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`tag-caps px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest border ${prog.badgeColor}`}>
                    {prog.badge}
                  </span>
                  <span className="font-mono text-xs text-white/50">
                    {prog.duration}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div className="space-y-1">
                  <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight">
                    {prog.title}
                  </h3>
                  <p className="font-mono text-xs text-white/70 uppercase tracking-wider">
                    {prog.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-sm text-white/75 leading-relaxed">
                  {prog.description}
                </p>

                {/* Curriculum Bullet Checklist */}
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest mb-3">
                    CORE SYLLABUS HIGHLIGHTS:
                  </div>
                  {prog.curriculum.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-white/85">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white/50 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-white/10">
                <Link
                  to={prog.ctaHref}
                  className="inline-flex items-center justify-center gap-3 w-full py-3.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white font-mono font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <span>{prog.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </ScrollRevealLeft>
          ))}
        </div>


      </div>
    </section>
  );
};
