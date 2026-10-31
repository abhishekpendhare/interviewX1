import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Layers, 
  Mic, 
  Cpu, 
  Award, 
  BookOpen, 
  Compass, 
  Sun, 
  Moon, 
  ChevronDown, 
  X, 
  Menu, 
  ArrowRight, 
  Activity,
  Flame,
  Globe,
  Database,
  Terminal,
  Search,
  Sparkles
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface MegaMenuCategory {
  id: string;
  label: string;
  badge?: string;
  cards: {
    title: string;
    category: string;
    description: string;
    href: string;
    image: string;
    meta?: string;
  }[];
}

const MEGA_MENU_DATA: MegaMenuCategory[] = [
  {
    id: 'practice',
    label: 'Practice',
    cards: [
      {
        title: 'Algorithmic Arena (3,555+ Problems)',
        category: 'DSA & CODEFORCES',
        description: 'Multi-language compiler sandbox with verified company-tagged problem sets.',
        href: '/compiler',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
        meta: '3,555 Problems'
      },
      {
        title: 'CS Core Fundamentals Sprints',
        category: 'DBMS / OS / NETWORKS',
        description: 'High-rigor benchmark drills on storage engines, virtual memory, and HTTP/3.',
        href: '/foundations',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
        meta: '1,797 Questions'
      },
      {
        title: 'Java 21 & Spring Boot Mastery',
        category: 'ENTERPRISE BACKEND',
        description: 'Virtual threads, CAS concurrency, Hibernate N+1 query optimization, and REST security.',
        href: '/foundations',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
        meta: 'Active Sprints'
      },
      {
        title: 'Speed Aptitude & Quantitative Logic',
        category: 'SPEED DRILLS',
        description: 'Timed quantitative arithmetic, logical deduction, and pattern recognition.',
        href: '/foundations',
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop',
        meta: 'Timed Drills'
      }
    ]
  },
  {
    id: 'mock-interviews',
    label: 'Mock Interviews',
    cards: [
      {
        title: 'Autonomous Voice Mock Bar Raiser',
        category: 'STAFF SDE SIMULATOR',
        description: 'Real-time 4-dimensional rubric marking with adaptive follow-up misconception probing.',
        href: '/simulator',
        image: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=600&auto=format&fit=crop',
        meta: 'Live Voice AI'
      },
      {
        title: 'STAR Method Behavioral Auditor',
        category: 'AMAZON LEADERSHIP',
        description: 'Real-time auditing of Situation, Task, Action, Result structured storytelling.',
        href: '/simulator',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
        meta: 'Leadership Principles'
      },
      {
        title: 'Distributed System Design Round',
        category: 'HIGH SCALE ARCHITECTURE',
        description: 'Sharding, CAP theorem trade-offs, cache invalidation, and rate limiting drills.',
        href: '/advisor',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
        meta: 'Architecture Board'
      }
    ]
  },
  {
    id: 'companies',
    label: 'Companies',
    cards: [
      {
        title: 'Tier-1 Product Engineering (FAANG / Unicorns)',
        category: '₹18 - 45+ LPA',
        description: 'Google, Amazon, Microsoft, Uber, Razorpay problem sets and bar-raiser rubrics.',
        href: '/compiler',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
        meta: 'Top Rigor'
      },
      {
        title: 'High-Velocity Tech & Fintech Growth',
        category: '₹12 - 24 LPA',
        description: 'Swiggy, Zomato, PhonePe, Groww, Cred distributed systems workflows.',
        href: '/compiler',
        image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
        meta: 'Fintech Systems'
      },
      {
        title: 'Enterprise Prime & Specialist Tracks',
        category: '₹7 - 14 LPA',
        description: 'TCS Prime, Infosys Specialist DSE, Cognizant Elevate timed sprint tracks.',
        href: '/foundations',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600&auto=format&fit=crop',
        meta: 'Specialist Cohorts'
      }
    ]
  },
  {
    id: 'roadmaps',
    label: 'Roadmaps',
    cards: [
      {
        title: 'Celestial Orbital Roadmap',
        category: 'DYNAMIC MASTERY',
        description: 'Concentric subject orbits revolving dynamically around your target engineering milestone.',
        href: '/#celestial-roadmap',
        image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=600&auto=format&fit=crop',
        meta: 'Orbital Engine'
      },
      {
        title: '60-Day Placement Velocity Sprint',
        category: 'CURATED COHORT',
        description: 'Day-by-day progression curriculum from baseline DSA to senior bar raiser rounds.',
        href: '/foundations',
        image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=600&auto=format&fit=crop',
        meta: '60-Day Roadmap'
      },
      {
        title: 'Candidate Placement Dossier',
        category: 'STATISTICAL AUDIT',
        description: 'Full multi-axis radar audit and placement velocity index benchmarking.',
        href: '/dossier',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop',
        meta: 'Telemetry PVI'
      }
    ]
  },
  {
    id: 'articles',
    label: 'Articles',
    badge: 'NEW',
    cards: [
      {
        title: 'Amazon SDE-1 Bar Raiser Breakdown: What Really Matters',
        category: 'INTERVIEW DEBRIEF',
        description: 'How top candidates handle ambiguous scalability trade-offs and STAR behavioral probing.',
        href: '/articles',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
        meta: 'Oct 08, 2026'
      },
      {
        title: 'Under the Hood: How Java 21 Virtual Threads Handle 100k Req/Sec',
        category: 'SYSTEMS DEEP DIVE',
        description: 'Carrier threads, continuation stacks, and why synchronized blocks pinned threads in early builds.',
        href: '/articles',
        image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
        meta: 'Oct 05, 2026'
      },
      {
        title: 'PostgreSQL MVCC vs MySQL InnoDB: Transaction Isolation Tested',
        category: 'DATABASE INTERNALS',
        description: 'Benchmarking vacuum overhead against undo logs during sustained 5,000 write TPS bursts.',
        href: '/articles',
        image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop',
        meta: 'Sep 29, 2026'
      }
    ]
  }
];

interface CinematicHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function CinematicHeader({ isDark, onToggleTheme }: CinematicHeaderProps) {
  const location = useLocation();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    staleTime: 60000
  });

  // Handle scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on route change or Escape
  useEffect(() => {
    setActiveMenuId(null);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mega-menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCategory = MEGA_MENU_DATA.find(c => c.id === activeMenuId);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || activeMenuId
          ? 'bg-[var(--bg-overlay)] backdrop-blur-2xl border-b border-[var(--border-line)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Wordmark (Porsche Motorsport minimal aesthetic) */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded bg-[var(--accent-primary)] flex items-center justify-center text-white font-display font-extrabold text-sm tracking-tighter shadow-md transition-transform group-hover:scale-105">
                IX
              </div>
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-sm sm:text-base tracking-tight text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                  Interview<span className="text-[var(--accent-primary)] font-black">X</span>
                  <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.2 rounded bg-white/10 text-[var(--text-secondary)]">
                    MOTORSPORT
                  </span>
                </span>
                <span className="tag-caps text-[9px] text-[var(--text-muted)] -mt-0.5">
                  #PlacementReady
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Mega-Menu Nav Bar */}
          <nav className="hidden lg:flex items-center gap-1">
            {MEGA_MENU_DATA.map(item => {
              const isOpen = activeMenuId === item.id;

              return (
                <div key={item.id} className="relative">
                  <button
                    onClick={() => setActiveMenuId(prev => (prev === item.id ? null : item.id))}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-wider transition-colors ${
                      isOpen 
                        ? 'text-white bg-white/10' 
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    }`}
                    aria-expanded={isOpen}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                    {item.badge && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-[var(--accent-primary)] text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Right Header Controls (PVI Telemetry, Theme, CTA) */}
          <div className="flex items-center gap-3">
            {/* Live Telemetry Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-pulse"></span>
              <span className="text-[var(--text-muted)]">PVI:</span>
              <span className="text-[var(--text-primary)] font-bold">{profile?.placementVelocityIndex || 84.6}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-white transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Cinematic Dark'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            </button>

            {/* Launch Cockpit CTA */}
            <Link
              to="/planner"
              className="btn-racing-primary hidden sm:inline-flex text-[11px] py-2 px-4 rounded"
            >
              <span>Planner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="lg:hidden p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          DESKTOP MEGA-MENU PREVIEW PANEL (Cinematic Porsche Motorsport style)
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeCategory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mega-menu-panel border-t border-[var(--border-subtle)] w-full py-8 px-4 sm:px-6 lg:px-8 shadow-2xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-6">
                <div className="flex items-center gap-3">
                  <span className="tag-caps text-[var(--accent-primary)] font-bold">
                    EXPLORE // {activeCategory.label.toUpperCase()}
                  </span>
                  <span className="text-[var(--text-muted)] text-xs">•</span>
                  <span className="text-xs text-[var(--text-muted)]">Select module or track</span>
                </div>
                <button
                  onClick={() => setActiveMenuId(null)}
                  className="text-xs font-mono text-[var(--text-muted)] hover:text-white flex items-center gap-1"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid of Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {activeCategory.cards.map((card, cIdx) => (
                  <Link
                    key={cIdx}
                    to={card.href}
                    onClick={() => setActiveMenuId(null)}
                    className="group line-panel rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-active)] shadow-lg"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={card.image}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0E1418] via-transparent to-transparent" />
                      <span className="absolute top-2.5 left-2.5 tag-caps text-[9px] px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-md border border-white/10">
                        {card.category}
                      </span>
                    </div>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
                          {card.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-1 font-sans">
                          {card.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono text-[var(--text-muted)]">
                        <span>{card.meta || 'Launch Track'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          MOBILE FULL-SCREEN MENU
         ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden fixed inset-0 top-16 bg-[var(--bg-base)] z-50 p-6 overflow-y-auto flex flex-col justify-between border-t border-[var(--border-line)]"
          >
            <div className="space-y-6">
              {MEGA_MENU_DATA.map(cat => (
                <div key={cat.id} className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="tag-caps text-[var(--accent-primary)] text-xs mb-2">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {cat.cards.map((card, idx) => (
                      <Link
                        key={idx}
                        to={card.href}
                        onClick={() => setMobileOpen(false)}
                        className="p-3 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
                      >
                        <div>
                          <div className="font-heading font-bold">{card.title}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{card.category}</div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[var(--accent-primary)] shrink-0 ml-2" />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
              <Link
                to="/planner"
                onClick={() => setMobileOpen(false)}
                className="btn-racing-primary w-full py-3 rounded text-center block"
              >
                Open Career Planner
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
