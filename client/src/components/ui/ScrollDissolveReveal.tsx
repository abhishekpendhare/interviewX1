import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Mic, 
  Cpu, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  ShieldCheck,
  Terminal,
  Activity
} from 'lucide-react';

interface StorySection {
  id: string;
  badge: string;
  title: string;
  description: string;
  icon: React.ElementType;
  highlights: string[];
  ctaLabel: string;
  ctaPath: string;
  previewType: 'compiler' | 'voice' | 'advisor' | 'dossier';
}

const SECTIONS: StorySection[] = [
  {
    id: 'dsa-arena',
    badge: 'PILLAR 01 // EXECUTION ENGINE',
    title: 'Monaco Code Arena with 3,500+ Verified Problems',
    description: 'Direct browser execution engine with multi-language runtime (Python 3.12, Java 21, C++20, Node.js). Features strict time and memory sandboxing, hidden edge-case test harnesses, and candidate approach verification.',
    icon: Code2,
    highlights: [
      '3,555 company-tagged problems across Google, Amazon, Microsoft, and Uber',
      'Instant test-case evaluation with memory allocation and CPU time metrics',
      '"My Approach" synthesis to explain reasoning before code execution'
    ],
    ctaLabel: 'Launch Compiler Arena',
    ctaPath: '/compiler',
    previewType: 'compiler'
  },
  {
    id: 'voice-simulator',
    badge: 'PILLAR 02 // BAR RAISER SIMULATOR',
    title: 'Autonomous Voice & Technical Interview Simulator',
    description: 'Experience real-time technical rounds with a simulated Staff SDE interviewer. Answers are marked across 4 distinct dimensions: Correctness, Completeness, Clarity, and Edge-Case Depth with dynamic follow-ups probing your exact statements.',
    icon: Mic,
    highlights: [
      '4-Dimensional Rubric Scoring with instant HIRE / BORDERLINE / NO-HIRE signal',
      'Dynamic follow-up generator probing specific misconceptions in real-time',
      'Tracks across DSA, Java Concurrency, Spring Boot, DBMS, and STAR Leadership'
    ],
    ctaLabel: 'Enter Mock Simulator',
    ctaPath: '/simulator',
    previewType: 'voice'
  },
  {
    id: 'neural-copilot',
    badge: 'PILLAR 03 // AUTONOMOUS MENTOR',
    title: 'Neural Placement Advisor & Real-time Co-Pilot',
    description: 'An AI mentor grounded in your actual placement velocity data. Get line-by-line code reviews, architectural trade-off breakdowns, step-by-step math proofs, and behavioral STAR alignment in milliseconds.',
    icon: Cpu,
    highlights: [
      'Multi-turn memory retention with real candidate skill graphs',
      'Automated code refactoring suggestions with Big-O complexity analysis',
      'Behavioral STAR restructuring for Amazon Leadership Principles'
    ],
    ctaLabel: 'Consult Neural Advisor',
    ctaPath: '/advisor',
    previewType: 'advisor'
  },
  {
    id: 'placement-dossier',
    badge: 'PILLAR 04 // READINESS TELEMETRY',
    title: 'Precision Placement Velocity Index & Dossier',
    description: 'Stop guessing your interview readiness. The Placement Velocity Index (PVI) computes your statistical readiness curve based on problem success rate, mock performance, and knowledge depth.',
    icon: Award,
    highlights: [
      'Multi-axis skill radar across 8 core engineering disciplines',
      'Tier-1 benchmark comparisons against real candidate cohorts',
      'Actionable daily sprint recommendations targeting critical gaps'
    ],
    ctaLabel: 'View Your Dossier',
    ctaPath: '/dossier',
    previewType: 'dossier'
  }
];

export function ScrollDissolveReveal() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="space-y-16 lg:space-y-24">
      {SECTIONS.map((section, idx) => {
        const Icon = section.icon;
        const isEven = idx % 2 === 0;

        return (
          <motion.div
            key={section.id}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 40, scale: 0.98 }
            }
            whileInView={
              shouldReduceMotion
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="bento-card p-6 sm:p-8 lg:p-10 border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-xl rounded-2xl shadow-xl relative overflow-hidden group"
          >
            {/* Ambient Background Gradient Spotlight */}
            <div 
              className={`pointer-events-none absolute -inset-full opacity-20 group-hover:opacity-35 transition-opacity duration-700 ${
                isEven 
                  ? 'bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.2),transparent_70%)]' 
                  : 'bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.2),transparent_70%)]'
              }`} 
            />

            <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 ${
              isEven ? '' : 'lg:grid-flow-dense'
            }`}>
              {/* Left/Right Text Content */}
              <div className={`lg:col-span-7 space-y-5 ${isEven ? '' : 'lg:col-start-6'}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[11px] font-semibold tracking-wider uppercase">
                  <Icon className="w-3.5 h-3.5" />
                  {section.badge}
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight leading-snug">
                  {section.title}
                </h3>

                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed font-normal">
                  {section.description}
                </p>

                {/* Highlights List */}
                <div className="space-y-2.5 pt-2">
                  {section.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Call to Action Button */}
                <div className="pt-3">
                  <Link
                    to={section.ctaPath}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all hover:scale-105 active:scale-95"
                  >
                    <span>{section.ctaLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Interactive Preview Box */}
              <div className={`lg:col-span-5 ${isEven ? '' : 'lg:col-start-1'}`}>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs shadow-inner overflow-hidden relative">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">LIVE SANDBOX</span>
                  </div>

                  {section.previewType === 'compiler' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="text-slate-400">// Java 21 ConcurrentHashMap Execution</div>
                      <div className="text-indigo-400">Map&lt;String, AtomicLong&gt; counters = new ConcurrentHashMap&lt;&gt;();</div>
                      <div className="text-slate-300">counters.computeIfAbsent(key, k -&gt; new AtomicLong()).incrementAndGet();</div>
                      <div className="mt-3 p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
                        ✓ All 24 Test Cases Passed • 0.04s Execution Time
                      </div>
                    </div>
                  )}

                  {section.previewType === 'voice' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-indigo-400 text-[10px]">
                        <span>BAR RAISER: STAFF SDE</span>
                        <span className="text-emerald-400">RUBRIC SCORE: 88/100</span>
                      </div>
                      <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/30 text-slate-300 text-[11px]">
                        "Correctly identified MVCC xmin/xmax tuple visibility without table lock contention."
                      </div>
                      <div className="text-amber-400 text-[10px]">
                        PROBING: "How does vacuuming mitigate transaction ID wraparound under high write volume?"
                      </div>
                    </div>
                  )}

                  {section.previewType === 'advisor' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="text-indigo-400">NEURAL ADVISOR CO-PILOT:</div>
                      <div className="text-slate-300">
                        "Your time complexity is O(N log N). We can reduce this to O(N) by applying a monotonic sliding window."
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px]">Sliding Window</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">Zero Allocation</span>
                      </div>
                    </div>
                  )}

                  {section.previewType === 'dossier' && (
                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center text-slate-400">
                        <span>PLACEMENT VELOCITY INDEX:</span>
                        <span className="text-indigo-400 font-bold text-sm">84.6 / 100</span>
                      </div>
                      <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full w-[85%] rounded-full"></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                        <span>DSA: 92%</span>
                        <span>DBMS: 86%</span>
                        <span>Spring: 88%</span>
                        <span>STAR: 81%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
