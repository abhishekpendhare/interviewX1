import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Brain, Mic2, BookOpen, Code2,
  Terminal, LogIn, Menu, X, Zap, ChevronDown, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Code Arena', href: '/code',      icon: Terminal, badge: 'NEW' },
  { label: 'Assessments',href: '/test',      icon: Code2 },
  { label: 'AI Tutor',   href: '/ai-tutor',   icon: Brain },
  { label: 'Voice Mock', href: '/mock-interview', icon: Mic2 },
  {
    label: 'Knowledge Hub', icon: BookOpen,
    children: [
      { label: 'Syllabus & Subjects',  href: '/subjects'  },
      { label: 'Technical Q&A Vault', href: '/technical' },
      { label: 'Aptitude & Speed',     href: '/aptitude'  },
      { label: 'HR & STAR Methods',    href: '/hr'        },
    ]
  },
]

export function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('it_practice_user') || 'null') } catch { return null }
  })()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled ? 'glass-cyber border-b border-slate-800/80 py-2.5' : 'bg-transparent py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-slate-950 font-extrabold shadow-neon-cyan group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-display font-extrabold text-xl text-white tracking-tight">
              Interview<span className="text-gradient-cyan">X</span>
              <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30">
                OS
              </span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              if (link.children) {
                return (
                  <div key={link.label} className="relative">
                    <button
                      onClick={() => setResourcesOpen(o => !o)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 transition-all"
                    >
                      <link.icon className="w-3.5 h-3.5 text-slate-400" />
                      {link.label}
                      <ChevronDown className={cn('w-3 h-3 transition-transform text-slate-400', resourcesOpen && 'rotate-180')} />
                    </button>
                    <AnimatePresence>
                      {resourcesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-1.5 left-0 glass-cyber rounded-2xl p-1.5 min-w-48 shadow-2xl border border-slate-800"
                          onMouseLeave={() => setResourcesOpen(false)}
                        >
                          {link.children.map(child => (
                            <Link
                              key={child.href}
                              to={child.href}
                              className="block px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors font-medium"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }
              const active = location.pathname === link.href || location.pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  to={link.href!}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all relative',
                    active
                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  )}
                >
                  <link.icon className={cn('w-3.5 h-3.5', active ? 'text-cyan-400' : 'text-slate-400')} />
                  {link.label}
                  {link.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950">
                      {link.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl glass-cyber text-cyan-400 text-xs font-bold border border-cyan-500/30"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                {user.name?.split(' ')[0]}
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn-cyber-primary px-5 py-2 rounded-xl text-xs font-bold"
              >
                Sign In / Access OS →
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 z-40 w-72 glass-cyber border-l border-slate-800 p-6 pt-20 flex flex-col gap-2"
          >
            {navLinks.map(link => {
              if (link.children) {
                return (
                  <div key={link.label} className="pt-2">
                    <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">{link.label}</p>
                    {link.children.map(c => (
                      <Link key={c.href} to={c.href} className="block px-3 py-2 text-xs text-slate-300 hover:text-white rounded-lg hover:bg-slate-900">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )
              }
              return (
                <Link
                  key={link.href}
                  to={link.href!}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-cyan-400 hover:bg-slate-900"
                >
                  <link.icon className="w-4 h-4 text-cyan-400" />
                  {link.label}
                </Link>
              )
            })}
            <div className="mt-auto pt-4 border-t border-slate-800">
              <Link to="/login" className="btn-cyber-primary w-full py-3 rounded-xl text-xs font-bold text-center block">
                Sign In / Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
