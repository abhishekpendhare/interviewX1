import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Layers, 
  Activity, 
  Code2, 
  Mic, 
  Calculator,
  Cpu, 
  Award, 
  Map,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { BrandNeonX } from '@/components/ui/BrandNeonX';
import { useAuth } from '@/lib/authContext';

interface AISaasHeaderProps {
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const AISaasHeader: React.FC<AISaasHeaderProps> = () => {
  const { user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'practice' | 'prep' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [avatarOpen, setAvatarOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const getLink = (target: string) => user ? target : `/login?next=${encodeURIComponent(target)}`;

  // Close dropdown on outside click or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setAvatarOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setAvatarOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Body scroll lock management when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow || '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change and guarantee unlock
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    setAvatarOpen(false);
    document.body.style.overflow = '';
  }, [location.pathname]);

  const toggleDropdown = (name: 'practice' | 'prep') => {
    setActiveDropdown(prev => prev === name ? null : name);
    setAvatarOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full pt-3 px-4 sm:px-6 lg:px-8 pointer-events-none">
      <div 
        ref={dropdownRef}
        className="max-w-7xl mx-auto bg-[#0E1528]/85 backdrop-blur-xl border border-white/10 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-between pointer-events-auto transition-all duration-200"
      >
        {/* Left: Neon X + InterviewX Wordmark */}
        <Link to="/" className="flex items-center gap-3 group mr-4 sm:mr-6 shrink-0" aria-label="InterviewX Home">
          <BrandNeonX size="sm" withGlow={false} />
          <span className="font-heading font-bold text-lg tracking-tight text-white group-hover:text-[#2DD4D0] transition-colors">
            Interview<span className="text-[#8B7BFF]">X</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium text-white/80">
          <Link 
            to="/" 
            className="hover:text-white transition-colors"
          >
            Home
          </Link>

          {/* 1. Practice Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('practice')}
              className={`inline-flex items-center gap-1 hover:text-white transition-colors py-1 cursor-pointer ${
                activeDropdown === 'practice' ? 'text-white' : ''
              }`}
              aria-expanded={activeDropdown === 'practice'}
            >
              <span>Practice</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === 'practice' ? 'rotate-180 text-[#2DD4D0]' : 'text-white/50'
              }`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'practice' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-[#10172D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl z-50 space-y-1"
                >
                  <Link
                    to={getLink('/compiler')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#6D5CFF]/20 border border-[#6D5CFF]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Code2 className="w-4 h-4 text-[#8B7BFF]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        DSA & Algorithmic Arena
                      </div>
                      <div className="text-xs text-white/50">3,555+ problems, curated LeetCode & test cases</div>
                    </div>
                  </Link>

                  <Link
                    to={getLink('/foundations')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Calculator className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Quantitative & Aptitude
                      </div>
                      <div className="text-xs text-white/50">Speed arithmetic, logical puzzles & verbal drills</div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Prep Hub Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('prep')}
              className={`inline-flex items-center gap-1 hover:text-white transition-colors py-1 cursor-pointer ${
                activeDropdown === 'prep' ? 'text-white' : ''
              }`}
              aria-expanded={activeDropdown === 'prep'}
            >
              <span>Prep Hub</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                activeDropdown === 'prep' ? 'rotate-180 text-[#6D5CFF]' : 'text-white/50'
              }`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'prep' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-84 bg-[#10172D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-2xl z-50 space-y-1"
                >
                  <Link
                    to={getLink('/foundations')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Curated Roadmaps & Sheets
                      </div>
                      <div className="text-xs text-white/50">Core DSA, DBMS, OS, Systems & Spring Crash</div>
                    </div>
                  </Link>

                  <Link
                    to={getLink('/simulator')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2DD4D0]/20 border border-[#2DD4D0]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Mic className="w-4 h-4 text-[#2DD4D0]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Voice AI Mock Interviewer
                      </div>
                      <div className="text-xs text-white/50">Simulate FAANG Staff Engineers & Bar-Raisers</div>
                    </div>
                  </Link>

                  <Link
                    to={getLink('/advisor')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#6D5CFF]/20 border border-[#6D5CFF]/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Cpu className="w-4 h-4 text-[#8B7BFF]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Neural Placement Co-Pilot
                      </div>
                      <div className="text-xs text-white/50">Dynamic study schedules & weak-vector diagnosis</div>
                    </div>
                  </Link>

                  <Link
                    to={getLink('/dossier')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Award className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Candidate Readiness Dossier
                      </div>
                      <div className="text-xs text-white/50">Placement velocity score & verified benchmarks</div>
                    </div>
                  </Link>

                  <Link
                    to={getLink('/analytics')}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-[#2DD4D0]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                        Performance Analytics
                      </div>
                      <div className="text-xs text-white/50">Data-driven diagnostic profile & AI next steps</div>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Planner Link */}
          <Link 
            to={getLink('/planner')} 
            className="hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <Map className="w-3.5 h-3.5 text-[#2DD4D0]" />
            Planner
          </Link>

          {/* 4. Articles Link */}
          <Link 
            to={getLink('/articles')} 
            className="hover:text-white transition-colors"
          >
            Articles
          </Link>

          {/* 5. Contact Link */}
          <a 
            href={location.pathname === '/' ? '#section-contact' : '/#section-contact'} 
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault();
                const el = document.getElementById('section-contact');
                if (el) {
                  const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 70);
                  window.scrollTo({ top: targetY, behavior: 'instant' as ScrollBehavior });
                }
              }
            }}
            className="hover:text-white transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Right Section: Auth State Dependent */}
        {user ? (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/foundations"
              className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] hover:opacity-95 text-white text-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(109,92,255,0.4)] active:scale-95"
            >
              Go to Dashboard
            </Link>

            <div className="relative">
              <button
                onClick={() => setAvatarOpen(!avatarOpen)}
                className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 hover:border-white/40 bg-white/5 text-white text-sm font-medium transition-all"
                aria-label="User account menu"
                aria-expanded={avatarOpen}
              >
                <div className="w-6 h-6 rounded-full bg-[#6D5CFF] text-white flex items-center justify-center text-xs font-bold uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user.name || 'Account'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-white/50" />
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#10172D]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/10">
                      <div className="font-semibold text-sm text-white truncate">{user.name}</div>
                      <div className="text-xs text-white/50 truncate">{user.email}</div>
                    </div>
                    <Link
                      to="/foundations"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-xl transition-colors mt-1"
                    >
                      <UserIcon className="w-4 h-4 text-[#2DD4D0]" />
                      <span>Dashboard Hub</span>
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-5 py-1.5 rounded-full border border-white/20 hover:border-white/50 text-white text-sm font-medium transition-all duration-200 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-[#8B7BFF]"
            >
              Log In
            </Link>

            <Link
              to="/signup"
              className="px-5 py-1.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] hover:opacity-95 text-white text-sm font-semibold transition-all duration-200 shadow-[0_0_20px_rgba(109,92,255,0.4)] active:scale-95 focus-visible:outline-2 focus-visible:outline-[#2DD4D0]"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5CFF] rounded-lg"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 max-w-7xl mx-auto bg-[#0E1528]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-2xl pointer-events-auto space-y-4"
          >
            <div className="flex flex-col gap-3 text-base font-medium text-white/90">
              <Link to="/" className="py-2 border-b border-white/10 hover:text-[#2DD4D0]">
                Home
              </Link>
              <Link to={getLink('/compiler')} className="py-2 border-b border-white/10 hover:text-[#2DD4D0]">
                Practice (DSA Arena)
              </Link>
              <Link to={getLink('/foundations')} className="py-2 border-b border-white/10 hover:text-[#2DD4D0]">
                Prep Hub (Roadmaps & Aptitude)
              </Link>
              <Link to={getLink('/simulator')} className="py-2 border-b border-white/10 hover:text-[#2DD4D0]">
                Voice Mock Simulator
              </Link>
              <Link to={getLink('/planner')} className="py-2 border-b border-white/10 hover:text-[#2DD4D0] inline-flex items-center gap-2">
                <Map className="w-4 h-4 text-[#2DD4D0]" />
                Roadmap Planner
              </Link>
              <Link to={getLink('/articles')} className="py-2 border-b border-white/10 hover:text-[#2DD4D0]">
                Articles
              </Link>
              <a 
                href={location.pathname === '/' ? '#section-contact' : '/#section-contact'} 
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 hover:text-[#2DD4D0]"
              >
                Contact
              </a>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              {user ? (
                <>
                  <Link
                    to="/foundations"
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] text-center text-white text-sm font-semibold shadow-[0_0_20px_rgba(109,92,255,0.4)]"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full py-2.5 rounded-full border border-red-500/30 text-center text-red-400 text-sm font-medium hover:bg-red-500/10"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2.5 rounded-full border border-white/20 text-center text-white text-sm font-medium"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] text-center text-white text-sm font-semibold shadow-[0_0_20px_rgba(109,92,255,0.4)]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
