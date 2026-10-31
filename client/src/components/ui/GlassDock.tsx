import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Code2, 
  Layers, 
  Mic, 
  Cpu, 
  Award, 
  Compass, 
  Map,
  Activity,
  Sun, 
  Moon, 
  Sparkles,
  Orbit
} from 'lucide-react';

interface GlassDockProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

interface DockItemDef {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
}

const dockItems: DockItemDef[] = [
  { label: 'Gateway', path: '/', icon: Compass },
  { label: 'Roadmap Planner', path: '/planner', icon: Map, badge: 'AI' },
  { label: 'Analytics', path: '/analytics', icon: Activity, badge: 'NEW' },
  { label: 'Code Arena (3.5K+)', path: '/compiler', icon: Code2, badge: 'HOT' },
  { label: 'Foundations & Sprints', path: '/foundations', icon: Layers },
  { label: 'Voice Mock Simulator', path: '/simulator', icon: Mic },
  { label: 'Neural Co-Pilot', path: '/advisor', icon: Cpu },
  { label: 'Placement Dossier', path: '/dossier', icon: Award },
];

const mobileDockItems: DockItemDef[] = [
  { label: 'Home', path: '/', icon: Compass },
  { label: 'Planner', path: '/planner', icon: Map },
  { label: 'Analytics', path: '/analytics', icon: Activity },
  { label: 'Practice', path: '/compiler', icon: Code2 },
  { label: 'Learn', path: '/foundations', icon: Layers },
  { label: 'Interview', path: '/simulator', icon: Mic },
  { label: 'Coach', path: '/advisor', icon: Cpu },
];

export function GlassDock({ isDark, onToggleTheme }: GlassDockProps) {
  const location = useLocation();
  const [mouseX, setMouseX] = useState<number | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setMouseX(null);
  };

  return (
    <>
    <nav aria-label="Primary navigation" className="mobile-dock sm:hidden">
      {mobileDockItems.map(item => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link key={item.path} to={item.path} aria-current={isActive ? 'page' : undefined} className={`mobile-dock-item ${isActive ? 'is-active' : ''}`}>
            <Icon aria-hidden="true" className="w-[18px] h-[18px]" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
    <nav
      aria-label="Quick navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:block pointer-events-auto"
    >
      <motion.div
        ref={dockRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        className="glass-dock px-3.5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl border border-[var(--dock-border)] bg-[var(--dock-bg)] backdrop-blur-xl"
      >
        {dockItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

          // Calculate proximity-based scale for smooth magnetic magnification
          let scale = 1;
          if (mouseX !== null && dockRef.current) {
            const itemElement = dockRef.current.children[idx] as HTMLElement;
            if (itemElement) {
              const itemCenter = itemElement.offsetLeft + itemElement.offsetWidth / 2;
              const distance = Math.abs(mouseX - itemCenter);
              if (distance < 120) {
                scale = 1 + (0.28 * (1 - distance / 120));
              }
            }
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              aria-current={isActive ? 'page' : undefined}
              className="relative group p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
              aria-label={item.label}
            >
              <motion.div
                animate={{ scale: scale }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/15'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-current'}`} />

                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[8px] font-bold">
                    {item.badge}
                  </span>
                )}

                {/* Active Indicator Micro-dot */}
                {isActive && (
                  <motion.span 
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" 
                  />
                )}
              </motion.div>

            </Link>
          );
        })}

        <div className="w-[1px] h-6 bg-[var(--border-subtle)] mx-1" />

        {/* Theme Quick Switcher */}
        <button
          onClick={onToggleTheme}
          className="relative group p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl"
          aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-amber-400 hover:bg-slate-500/15 transition-colors">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </div>
        </button>
      </motion.div>
    </nav>
    </>
  );
}
