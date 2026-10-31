import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Terminal, 
  Code2, 
  Mic, 
  Cpu, 
  Award, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Activity,
  Globe
} from 'lucide-react';

export function AnimatedFooter() {
  return (
    <footer className="relative bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] overflow-hidden z-20 transition-colors">
      {/* 1. Animated Top Aurora Gradient Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-75" />
      <div className="absolute top-0 inset-x-0 h-[8px] bg-indigo-500/10 blur-sm pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm tracking-tighter group-hover:scale-105 transition-transform shadow-sm">
                ST
              </div>
              <span className="font-heading font-extrabold text-lg text-[var(--text-primary)] tracking-tight">
                STRATA<span className="text-indigo-400 font-mono text-xs ml-1 font-normal">/ PLACEMENT</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-sm leading-relaxed">
              Autonomous engineering placement system for 3rd and 4th year software engineers. Real sandboxed code execution, 4-dimensional mock interviews, and continuous skill radar telemetry.
            </p>

            {/* Live Uptime Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">STATUS:</span>
              <span className="text-emerald-400 font-semibold">ALL SYSTEMS OPERATIONAL (99.98%)</span>
            </div>
          </div>

          {/* Column 1: Core Practice */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Core Practice
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link to="/compiler" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Arena (3.5K+)</span>
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Career Planner</span>
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Foundations Hub</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Autonomous AI */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Autonomous AI
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>
                <Link to="/simulator" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Mock Simulator</span>
                </Link>
              </li>
              <li>
                <Link to="/advisor" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Neural Co-Pilot</span>
                </Link>
              </li>
              <li>
                <Link to="/dossier" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  <span>Candidate Dossier</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tracks & Verification */}
          <div className="space-y-3">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Engineering Tracks
            </h5>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li><span className="hover:text-slate-300">Java 21 Concurrency</span></li>
              <li><span className="hover:text-slate-300">Spring Boot & JPA</span></li>
              <li><span className="hover:text-slate-300">PostgreSQL ACID & MVCC</span></li>
              <li><span className="hover:text-slate-300">Distributed System Design</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} STRATA // Autonomous Placement Engineering.</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-indigo-400">All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-emerald-400 font-medium">3,555 PROBLEMS • 1,797 VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
