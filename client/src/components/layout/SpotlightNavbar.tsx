import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Code2, 
  Layers, 
  Mic, 
  Cpu, 
  Award, 
  Compass, 
  Sun, 
  Moon, 
  Activity, 
  Menu, 
  X 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { SpotlightNavbar as VengeanceSpotlightNavbar } from '@/components/ui/spotlight-navbar';

interface SpotlightNavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export const navItems = [
  { label: 'Gateway', href: '/', icon: Compass },
  { label: 'Career Planner', href: '/planner', icon: Activity },
  { label: 'Code Arena', href: '/compiler', icon: Code2, badge: '3.5K+' },
  { label: 'Foundations', href: '/foundations', icon: Layers },
  { label: 'Voice Mock', href: '/simulator', icon: Mic },
  { label: 'Neural Advisor', href: '/advisor', icon: Cpu },
  { label: 'Dossier', href: '/dossier', icon: Award },
];

export function SpotlightNavbar({ isDark, onToggleTheme }: SpotlightNavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    staleTime: 60000
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[var(--bg-surface)]/85 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-lg shadow-black/5 py-2.5' 
          : 'bg-[var(--bg-surface)]/60 backdrop-blur-md border-b border-[var(--border-subtle)]/70 py-3'
      } px-4 lg:px-8 relative`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        
        {/* Left: Brand Identity & Telemetry Status */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-mono font-bold text-sm tracking-tighter group-hover:border-indigo-400 group-hover:bg-indigo-600/25 group-hover:scale-105 transition-all shadow-sm">
              ST
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-heading">
                <span className="font-bold tracking-tight text-[var(--text-primary)] text-sm">STRATA</span>
                <span className="text-slate-500 font-mono text-xs">/</span>
                <span className="text-indigo-400 font-mono text-xs font-semibold tracking-wider uppercase">ENGINEERING</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-medium">AUTONOMOUS PLACEMENT PLATFORM</div>
            </div>
          </Link>
          {/* Telemetry Live Capsule */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-card)]/80 backdrop-blur-sm border border-[var(--border-subtle)] text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">TELEMETRY:</span>
            <span className="text-emerald-400 font-semibold">ONLINE (3,555 PROBLEMS)</span>
          </div>
        </div>

        {/* Center: Official Vengeance UI Spotlight Navbar */}
        <div className="hidden xl:block">
            <VengeanceSpotlightNavbar items={navItems} />
        </div>

        {/* Right Section: Theme Toggle & Candidate PVI Indicator */}
        <div className="flex items-center gap-2.5">
          {/* Theme Quick Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 text-slate-400 hover:text-amber-400 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Slate Mode'}
            aria-label="Toggle Theme"
            aria-pressed={isDark}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
          </button>

          {/* Placement Velocity Index Pill */}
          <Link
            to="/dossier"
            className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">PVI:</span>
              <span className="text-indigo-400 font-bold">
                {profile?.placementVelocityIndex ? `${profile.placementVelocityIndex}` : '84.6'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 border-l border-slate-700/60 pl-2.5 font-medium">
              {profile?.candidateName || 'Devon Chen'}
            </div>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="xl:hidden p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-primary-navigation"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            id="mobile-primary-navigation"
            className="xl:hidden mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-1"
          >
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
