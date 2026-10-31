import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { 
  Cpu, 
  Brain, 
  Sparkles, 
  CheckCircle, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Compass, 
  Mic, 
  GitBranch, 
  Workflow, 
  Clock 
} from 'lucide-react';

export function AgentBentoGrid() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="bento-grid"
    >
      {/* 1. Large Card: 4-Dimensional Rubric Evaluator (Col span 7) */}
      <motion.div
        variants={itemVariants}
        className="bento-card col-span-12 lg:col-span-7 flex flex-col justify-between group"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-mono text-[10px] font-bold tracking-wider">
              REAL-TIME RUBRIC ENGINE
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold font-heading text-[var(--text-primary)]">
              4-Dimensional Answer Evaluation
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
              Every technical and behavioral answer is evaluated on four independent pillars instead of vague marks: Correctness, Completeness, Clarity, and Edge-Case Depth.
            </p>
          </div>

          {/* Interactive Metric Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 font-mono">
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-slate-400">CORRECTNESS</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">100%</div>
              <div className="text-[9px] text-slate-500">Zero false claims</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-slate-400">COMPLETENESS</div>
              <div className="text-sm font-bold text-indigo-400 mt-0.5">85%</div>
              <div className="text-[9px] text-slate-500">All must-hits met</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-slate-400">CLARITY</div>
              <div className="text-sm font-bold text-teal-400 mt-0.5">80%</div>
              <div className="text-[9px] text-slate-500">Structured logic</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="text-[10px] text-slate-400">EDGE CASES</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">75%</div>
              <div className="text-[9px] text-slate-500">Big-O bounds stated</div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Signal: <strong className="text-emerald-400 font-semibold">STRONG HIRE BAR</strong></span>
          <span className="text-slate-500">Latency: 120ms</span>
        </div>
      </motion.div>

      {/* 2. Medium Card: Dynamic Follow-Up Probing (Col span 5) */}
      <motion.div
        variants={itemVariants}
        className="bento-card col-span-12 lg:col-span-5 flex flex-col justify-between group"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-teal-600/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Workflow className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono text-[10px] font-bold">
              ADAPTIVE PROBING
            </span>
          </div>

          <div>
            <h4 className="text-lg font-bold font-heading text-[var(--text-primary)]">
              Dynamic Misconception Probing
            </h4>
            <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
              Interviews don't follow static scripts. The AI detects unverified claims and asks precise follow-ups to verify true conceptual mastery.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono space-y-1.5">
            <div className="text-indigo-400 font-bold">Interviewer Follow-Up:</div>
            <div className="text-slate-300 italic">
              "You noted lock-free CAS on ConcurrentHashMap. What happens during a hash collision on a single bucket node?"
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
          <span>Simulates Staff SDE & Principal Bar Raiser behavior</span>
        </div>
      </motion.div>

      {/* 3. Small Card: Memory & Skill Radar (Col span 4) */}
      <motion.div
        variants={itemVariants}
        className="bento-card col-span-12 md:col-span-4 flex flex-col justify-between group"
      >
        <div className="space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Activity className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Persistent Context Graph
          </h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Maintains multi-session candidate memory. If you struggled with Redis caching or concurrency locks 2 weeks ago, the coach surfaces targeted sprints.
          </p>
        </div>
        <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-purple-400">
          ● Spaced Repetition Active
        </div>
      </motion.div>

      {/* 4. Small Card: STAR Behavioral Auditor (Col span 4) */}
      <motion.div
        variants={itemVariants}
        className="bento-card col-span-12 md:col-span-4 flex flex-col justify-between group"
      >
        <div className="space-y-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold font-heading text-[var(--text-primary)]">
            STAR Method Auditor
          </h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Audits Situation, Task, Action, and Result structure. Flags passive voice, missing quantifiable metrics, or lack of direct engineering ownership.
          </p>
        </div>
        <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-amber-400">
          ● Amazon LP Alignment Checked
        </div>
      </motion.div>

      {/* 5. Small Card: AST & Big-O Analyzer (Col span 4) */}
      <motion.div
        variants={itemVariants}
        className="bento-card col-span-12 md:col-span-4 flex flex-col justify-between group"
      >
        <div className="space-y-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <GitBranch className="w-4 h-4" />
          </div>
          <h4 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Line-by-Line Code Trace
          </h4>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Step through array pointers, stack frames, and recursive calls with visual variable mutation logs and automated time/space complexity bounds.
          </p>
        </div>
        <div className="pt-3 border-t border-[var(--border-subtle)] text-[11px] font-mono text-cyan-400">
          ● AST Syntax Deconstructed
        </div>
      </motion.div>
    </motion.div>
  );
}
