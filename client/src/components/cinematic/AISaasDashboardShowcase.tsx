import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Grid, 
  Video, 
  Code, 
  Settings, 
  CheckCircle2
} from 'lucide-react';

export const AISaasDashboardShowcase: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#0B1020] text-white relative overflow-hidden">
      {/* Background circular 3D spheres & gradient band (matching ref-03) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-[#6D5CFF]/20 via-[#8B7BFF]/25 to-[#2DD4D0]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-gradient-to-tr from-[#6D5CFF]/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-56 h-56 rounded-full bg-gradient-to-tr from-[#2DD4D0]/30 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Centered Heading and Subtext */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            Dashboard preview
          </h2>
          <p className="text-base sm:text-lg text-white/70 font-normal leading-relaxed">
            A visual preview of the candidate workspace. The figures below are sample data and do not represent live account activity.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            MULTI-LAYER FLOATING GLASS CARDS COMPOSITION (Matching ref-03)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative max-w-5xl mx-auto min-h-[560px] sm:min-h-[640px] flex items-center justify-center">
          
          {/* 1. TOP-LEFT FLOATING GLASS CARD: TIMER / NEXT SESSION */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: -20 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-6 left-0 sm:left-4 z-20 w-56 sm:w-64 bg-[#141C36]/80 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.5)] space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="font-semibold uppercase tracking-wider text-[#8B7BFF]">Sample interview sprint</span>
              <span>•••</span>
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl text-white">11:00 PM</div>
              <div className="text-xs text-white/60">Amazon SDE-1 Bar Raiser</div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#2DD4D0] to-[#6D5CFF] h-full w-[78%]" />
            </div>
            <div className="w-full py-2 rounded-xl bg-white/10 text-white/70 text-xs font-semibold flex items-center justify-center gap-1.5">
              <span>Preview only</span>
            </div>
          </motion.div>

          {/* 2. CENTER LARGE WHITE/LIGHT GLASS DASHBOARD MOCKUP */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/10 bg-[#10172D]/95 p-6 text-slate-100 shadow-[0_25px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl space-y-6 sm:p-8"
          >
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6D5CFF] flex items-center justify-center text-white font-bold text-xs">
                  IX
                </div>
                <span className="font-heading font-bold text-sm tracking-tight text-white">
                  InterviewX Console
                </span>
              </div>

              {/* Search Bar in mockup */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-[#0B1020]/70 px-3.5 py-1.5 text-xs text-slate-400 w-64">
                <Search className="w-3.5 h-3.5 text-slate-500" />
                <span>Search algorithms, rubrics...</span>
              </div>

              {/* User Avatar Pill */}
              <div className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/[0.08] px-3 py-1 text-xs font-medium text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Sample candidate</span>
              </div>
            </div>

            {/* Mockup Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Mini Sidebar */}
              <div className="hidden md:flex md:col-span-2 flex-col gap-2 border-r border-white/10 pr-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#6D5CFF]/10 text-[#6D5CFF] font-semibold text-xs">
                  <Grid className="w-4 h-4" />
                  <span>Overview</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-400 hover:bg-white/[0.05] font-medium text-xs">
                  <Video className="w-4 h-4" />
                  <span>Mocks</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-400 hover:bg-white/[0.05] font-medium text-xs">
                  <Code className="w-4 h-4" />
                  <span>Coding</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-400 hover:bg-white/[0.05] font-medium text-xs">
                  <Settings className="w-4 h-4" />
                  <span>Config</span>
                </div>
              </div>

              {/* Middle: Activity Line Chart & Countdown */}
              <div className="md:col-span-6 space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#0B1020]/65 p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">Interview Velocity / Activity</span>
                    <span className="font-bold text-cyan-300">Sample trend</span>
                  </div>
                  {/* SVG Line Graph */}
                  <div className="h-28 w-full">
                    <svg viewBox="0 0 300 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6D5CFF" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#6D5CFF" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 10 70 Q 60 20, 110 50 T 210 30 T 290 15 L 290 100 L 10 100 Z"
                        fill="url(#chartGrad)"
                      />
                      <path
                        d="M 10 70 Q 60 20, 110 50 T 210 30 T 290 15"
                        fill="none"
                        stroke="#6D5CFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="210" cy="30" r="4" fill="#2DD4D0" stroke="#10172D" strokeWidth="2" />
                      <circle cx="290" cy="15" r="4" fill="#8B7BFF" stroke="#10172D" strokeWidth="2" />
                    </svg>
                  </div>
                </div>

                {/* Score & Countdown Strip */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-[#0B1020]/65 p-3">
                    <div className="text-[11px] text-slate-400">Sample timer</div>
                    <div className="font-mono font-bold text-lg text-white">00:38</div>
                    <div className="mt-1 w-full overflow-hidden rounded-full bg-white/10 h-1">
                      <div className="bg-[#6D5CFF] h-full w-2/3" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#0B1020]/65 p-3">
                    <div className="text-[11px] text-slate-400">Example readiness</div>
                    <div className="font-mono font-bold text-lg text-emerald-300">82% sample</div>
                    <div className="mt-1 w-full overflow-hidden rounded-full bg-white/10 h-1">
                      <div className="bg-emerald-500 h-full w-4/5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Upcoming Rounds */}
              <div className="md:col-span-4 space-y-3">
                <div className="text-xs font-semibold text-slate-200">Scheduled Evaluations</div>
                <div className="space-y-2">
                  {[
                    { title: 'Google Graph Theory', time: 'Today, 4:00 PM', badge: 'High Rigor' },
                    { title: 'Amazon STAR Behavioral', time: 'Tomorrow, 11:00 AM', badge: 'Bar Raiser' },
                    { title: 'System Design: Sharding', time: 'Oct 12, 6:30 PM', badge: 'LLD' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1020]/65 p-2.5 text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{item.title}</div>
                        <div className="text-[11px] text-slate-400">{item.time}</div>
                      </div>
                      <span className="rounded-md border border-violet-300/15 bg-violet-400/[0.08] px-2 py-0.5 font-semibold text-[10px] text-violet-200">
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>

          {/* 3. BOTTOM-LEFT FLOATING GLASS CARD: "INTERVIEW SCHEDULE" WITH DONUT & BAR CHART */}
          <motion.div
            initial={{ opacity: 0, x: -30, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-8 left-2 sm:left-6 z-30 w-72 sm:w-80 bg-[#141C36]/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 shadow-[0_20px_45px_rgba(0,0,0,0.6)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Sample interview schedule</span>
              <span className="text-[10px] text-[#2DD4D0] bg-[#2DD4D0]/15 px-2 py-0.5 rounded-full font-semibold">Preview</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-center">
              {/* 49% Donut / Circle Chart */}
              <div className="col-span-5 relative flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90">
                  <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="32" 
                    stroke="#6D5CFF" 
                    strokeWidth="6" 
                    strokeDasharray="201" 
                    strokeDashoffset="102" 
                    strokeLinecap="round" 
                    fill="transparent" 
                  />
                </svg>
                <div className="absolute font-heading font-extrabold text-sm text-white">49%</div>
              </div>

              {/* Vertical Multi-Bar Chart */}
              <div className="col-span-7 flex items-end gap-1.5 h-16 pt-2">
                {[40, 75, 55, 90, 65, 80, 100].map((h, idx) => (
                  <div key={idx} className="flex-1 bg-white/10 rounded-t-sm h-full flex items-end overflow-hidden">
                    <div 
                      className={`w-full rounded-t-sm ${idx % 2 === 0 ? 'bg-[#2DD4D0]' : 'bg-[#6D5CFF]'}`} 
                      style={{ height: `${h}%` }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* 4. RIGHT NOTIFICATION PILL */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden sm:flex absolute top-12 -right-4 z-20 bg-[#141C36]/90 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white">Example evaluation</div>
              <div className="text-[10px] text-white/50">Sample interview rubric</div>
            </div>
          </motion.div>

          {/* 5. BOTTOM-RIGHT AUDIO WAVEFORM CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30, y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-6 right-0 sm:right-4 z-30 w-64 sm:w-72 bg-[#141C36]/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#6D5CFF] animate-pulse" />
                <span className="font-semibold text-xs">Audio Bar-Raiser Session</span>
              </div>
            </div>

            {/* Visual Waveform Equalizer */}
            <div className="flex items-center justify-between gap-1 h-8 px-1">
              {[30, 60, 90, 45, 100, 70, 85, 40, 95, 65, 80, 50, 90, 40, 70].map((h, i) => (
                <span 
                  key={i} 
                  className="w-1 rounded-full bg-gradient-to-t from-[#6D5CFF] to-[#2DD4D0] animate-pulse" 
                  style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }} 
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
