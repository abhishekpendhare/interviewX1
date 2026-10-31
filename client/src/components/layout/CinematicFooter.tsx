import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Activity, ShieldCheck, Zap, ArrowUp, Globe } from 'lucide-react';

export const CinematicFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0E1418] text-white border-t border-white/10 relative z-10">
      
      {/* Top Telemetry Bar */}
      <div className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-white/70 uppercase tracking-widest">
              SYSTEM STATUS: ALL TELEMETRY CHANNELS NOMINAL (JUDGE0 SANDBOX ACTIVE)
            </span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors"
          >
            <span>BACK TO TOP</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Multi-Column Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          
          {/* Brand Info Column */}
          <div className="col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-white font-extrabold font-heading text-xl tracking-tight uppercase">
              <span className="w-3 h-3 bg-[#E02B20] inline-block" />
              <span>INTERVIEWX // STRATA</span>
            </Link>
            <p className="text-sm text-white/60 max-w-sm leading-relaxed">
              Autonomous engineering platform for high-velocity software placement. Powered by real-time voice bar-raisers, containerized compilers, and verified company rubrics.
            </p>
            <div className="pt-2">
              <span className="tag-caps text-xs font-mono text-[#E02B20] font-bold tracking-widest">
                #PlacementReady
              </span>
            </div>
          </div>

          {/* Column 1: Practice Modules */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/40">
              PRACTICE ARENAS
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/compiler" className="text-white/70 hover:text-white transition-colors">
                  Algorithmic Arena (3,555+)
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="text-white/70 hover:text-white transition-colors">
                  CS Core Fundamentals
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="text-white/70 hover:text-white transition-colors">
                  Java 21 & Spring Boot
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="text-white/70 hover:text-white transition-colors">
                  Speed Aptitude Drills
                </Link>
              </li>
              <li>
                <Link to="/simulator" className="text-white/70 hover:text-white transition-colors">
                  STAR Behavioral Auditor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Calibrated Tracks */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/40">
              RACING TRACKS
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/compiler" className="text-white/70 hover:text-white transition-colors">
                  Product SDE-1 Elite (FAANG)
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="text-white/70 hover:text-white transition-colors">
                  Fintech & Unicorn Backend
                </Link>
              </li>
              <li>
                <Link to="/foundations" className="text-white/70 hover:text-white transition-colors">
                  TCS Prime & Infosys DSE
                </Link>
              </li>
              <li>
                <Link to="/simulator" className="text-white/70 hover:text-white transition-colors">
                  Voice Mock Bar Raiser
                </Link>
              </li>
              <li>
                <Link to="/advisor" className="text-white/70 hover:text-white transition-colors">
                  Proactive Neural Advisor
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Journal */}
          <div className="space-y-4">
            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-white/40">
              DISPATCHES & LEGAL
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/articles" className="text-white/70 hover:text-white transition-colors">
                  Technical Articles
                </Link>
              </li>
              <li>
                <Link to="/dossier" className="text-white/70 hover:text-white transition-colors">
                  Candidate Dossier & PVI
                </Link>
              </li>
              <li>
                <Link to="/articles/amazon-bar-raiser-star-framework" className="text-white/70 hover:text-white transition-colors">
                  Bar Raiser Scoring Rubrics
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/honor-code" className="text-white/70 hover:text-white transition-colors">
                  Placement Honor Code
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-white/10 py-6 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/40">
          <div>
            © 2026 INTERVIEWX INC. ALL RIGHTS RESERVED. PRECISION AT THE LIMIT.
          </div>
          <div className="flex items-center gap-6">
            <span>CALIBRATED FOR PRODUCTION SDE ROLES</span>
            <span>ENGINEERED ON STRATA 3.2</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
