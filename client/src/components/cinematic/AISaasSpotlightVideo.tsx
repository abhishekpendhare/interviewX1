import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, MessageSquare, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export const AISaasSpotlightVideo: React.FC = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const simulatorLink = user ? '/simulator' : '/signup?next=%2Fsimulator';

  return (
    <section className="py-20 lg:py-28 bg-[#0B1020] text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#2DD4D0]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-[#6D5CFF]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN: HEADLINE & ACTIONS (Exact match to ref-02)
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pill Tags: "InterviewX" + "AI-Powered Voice" */}
            <div className="flex items-center gap-2.5">
              <span className="font-heading font-bold text-xs tracking-wider text-white uppercase">
                InterviewX
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-[#2DD4D0] bg-[#2DD4D0]/15 border border-[#2DD4D0]/30 backdrop-blur-md">
                AI-Powered Voice
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans leading-[1.1]">
              Simulate high-stakes <br />
              <span className="bg-gradient-to-r from-white via-white/95 to-[#2DD4D0] bg-clip-text text-transparent">
                interviews with precision AI.
              </span>
            </h2>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-white/70 font-normal leading-relaxed">
              Step into realistic technical and behavioral rounds. Our autonomous voice engine interrogates your algorithmic trade-offs, evaluates edge cases, and provides instant dimensional rubrics.
            </p>

            {/* Buttons: Primary Gradient + Outlined Secondary */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to={simulatorLink}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] hover:opacity-95 text-white font-semibold text-sm shadow-[0_0_25px_rgba(109,92,255,0.45)] transition-all duration-200 active:scale-95"
              >
                Start Live Session
              </Link>

              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-3.5 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all duration-200 flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-[#2DD4D0] fill-[#2DD4D0]" />
                <span>Platform Overview</span>
              </button>
            </div>

          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT COLUMN: ROUNDED GRADIENT MEDIA CARD WITH PLAY BUTTON
             ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            
            {/* Background Dotted Grid Patch & Thin Rings (Matching ref-02) */}
            <div className="absolute -top-6 -left-6 w-32 h-32 opacity-25 pointer-events-none bg-[radial-gradient(#8B7BFF_1px,transparent_1px)] [background-size:12px_12px]" />
            <div className="absolute -bottom-8 -right-8 w-48 h-48 border border-[#2DD4D0]/30 rounded-full pointer-events-none -rotate-12" />

            {/* Main Gradient Card Container */}
            <div className="relative w-full max-w-xl aspect-[16/11] rounded-3xl p-1 bg-gradient-to-tr from-[#2DD4D0]/40 via-[#6D5CFF]/50 to-[#8B7BFF]/40 shadow-[0_20px_60px_rgba(0,0,0,0.6)] group">
              
              <div className="w-full h-full rounded-[22px] overflow-hidden relative bg-[#10172D]">
                {/* Media Image */}
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1200&auto=format&fit=crop"
                  alt="Candidate conducting live voice mock interview"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/80 via-transparent to-[#0B1020]/30" />

                {/* Center Frosted Glass Play Button (Exact match to ref-02) */}
                <button
                  onClick={() => setModalOpen(true)}
                  aria-label="Play demo video"
                  className="absolute inset-0 m-auto w-20 h-20 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 hover:scale-110 active:scale-95 group/btn"
                >
                  <Play className="w-8 h-8 text-white fill-white ml-1 transition-transform group-hover/btn:scale-110" />
                </button>

                {/* Floating Candidate Active Pill (Bottom Left) */}
                <motion.div 
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-5 left-5 bg-[#0E1528]/90 backdrop-blur-xl border border-white/20 rounded-full px-3.5 py-1.5 flex items-center gap-2 shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-semibold text-white">Live Bar-Raiser Active</span>
                </motion.div>

                {/* Floating Chat Bubble (Top Right) */}
                <motion.div 
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute top-5 right-5 bg-[#6D5CFF]/90 backdrop-blur-xl border border-white/25 rounded-2xl p-2.5 shadow-[0_8px_20px_rgba(109,92,255,0.4)] text-white"
                >
                  <MessageSquare className="w-4 h-4" />
                </motion.div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Interactive Video Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#10172D] border border-white/20 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2DD4D0]" />
                  <h3 className="font-heading font-bold text-lg text-white">InterviewX // Autonomous Engine & Telemetry Overview</h3>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 text-white/60 hover:text-white rounded-full bg-white/5 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative flex items-center justify-center border border-white/10">
                <video
                  autoPlay
                  controls
                  className="w-full h-full object-cover"
                  src="https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-white/50">High-throughput evaluation telemetry, latency scoring, and algorithmic benchmarks preview.</p>
                <Link
                  to={simulatorLink}
                  className="px-5 py-2 rounded-full bg-[#6D5CFF] hover:bg-[#5A48FA] text-white text-xs font-semibold"
                >
                  Launch Voice Cockpit
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
