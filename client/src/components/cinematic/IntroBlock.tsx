import React from 'react';
import { ShieldCheck, Zap, Activity, Cpu } from 'lucide-react';
import { ScrollRevealLeft } from '@/components/ui/ScrollRevealLeft';

export const IntroBlock: React.FC = () => {
  return (
    <section id="section-intro" className="py-20 lg:py-28 bg-[#0E1418] text-white border-b border-white/10 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#E02B20]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Heading and Tag */}
          <ScrollRevealLeft className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E02B20]" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#E02B20] font-bold">
                THE ARENA PHILOSOPHY
              </span>
            </div>
            
            <h2 className="headline-section text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-white leading-[1.05]">
              HOME OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/60">
                AUTONOMOUS PLACEMENT
              </span> <br />
              ENGINEERING.
            </h2>
          </ScrollRevealLeft>

          {/* Right Column: Narrative paragraph + key pillars */}
          <ScrollRevealLeft delay={0.15} className="lg:col-span-7 space-y-8">
            <p className="text-lg sm:text-xl text-white/80 font-normal leading-relaxed">
              We built InterviewX on a single premise: high-stakes technical interviews require the exact rigor of high-performance motorsport engineering. No guesswork, no generic scripts. Every algorithm, system design trade-off, and behavioral response is calibrated against real rubric telemetry from Tier-1 product giants and enterprise tech leaders.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/10">
              <ScrollRevealLeft staggerIndex={1} className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold font-mono text-sm uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-[#00E5FF]" />
                  <span>Sub-Millisecond Sandboxes</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Real WebAssembly and containerized runtimes for C++, Java, Python, Go, and Rust with memory invariant inspections.
                </p>
              </ScrollRevealLeft>

              <ScrollRevealLeft staggerIndex={2} className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold font-mono text-sm uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-[#E02B20]" />
                  <span>Real-Time Voice Probing</span>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">
                  Dynamic bar-raiser follow-ups that interrogate your time complexity assumptions, edge cases, and architectural trade-offs.
                </p>
              </ScrollRevealLeft>
            </div>
          </ScrollRevealLeft>
        </div>
      </div>
    </section>
  );
};


