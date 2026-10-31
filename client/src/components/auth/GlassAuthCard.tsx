import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Check
} from 'lucide-react';
import { useAuth } from '@/lib/authContext';
import { BrandNeonX } from '@/components/ui/BrandNeonX';

// ─── Password strength scoring helper ─────────────────────────────────
function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 2) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 3) return { score, label: 'Good', color: '#38BDF8' };
  return { score, label: 'Strong', color: '#10B981' };
}

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

import { getSafeNextUrl } from '@/pages/AuthPage';

interface GlassAuthCardProps {
  initialMode?: Mode;
}

export default function GlassAuthCard({ initialMode = 'login' }: GlassAuthCardProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, forgotPassword, resetPassword } = useAuth();

  const resetToken = searchParams.get('token');
  const [mode, setMode] = useState<Mode>(resetToken ? 'reset' : initialMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  // Form states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [shake, setShake] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (searchParams.get('expired') === 'true') {
      setError('Your session expired. Please sign in again.');
    }
    const timer = setTimeout(() => emailRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, [mode, searchParams]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleCapsLock = (e: React.KeyboardEvent) => {
    setCapsLock(e.getModifierState('CapsLock'));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    const rawNext = searchParams.get('next') || searchParams.get('redirect');
    const redirectTarget = getSafeNextUrl(rawNext, '/foundations');

    try {
      if (mode === 'login') {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError('Please enter your email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          setError('Please enter a valid email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!password) {
          setError('Please enter your password.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        await login(trimmedEmail, password, rememberMe);
        navigate(redirectTarget);
      } else if (mode === 'signup') {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        if (!trimmedName) {
          setError('Please enter your full name.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!trimmedEmail) {
          setError('Please enter your email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          setError('Please enter a valid email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!password || password.length < 8) {
          setError('Password must be at least 8 characters long.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (new TextEncoder().encode(password).length > 72) {
          setError('Password must be 72 UTF-8 bytes or fewer.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!agreeTerms) {
          setError('Please review and agree to the Terms of Service to continue.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        await signup(trimmedName, trimmedEmail, password);
        navigate(redirectTarget);
      } else if (mode === 'forgot') {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
          setError('Please enter your email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
          setError('Please enter a valid email address.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        const msg = await forgotPassword(trimmedEmail);
        setSuccessMsg(msg || 'If that email is registered, a password reset link has been generated.');
      } else if (mode === 'reset') {
        if (!resetToken) {
          setError('Missing or invalid reset token. Please request a new link.');
          setIsLoading(false);
          return;
        }
        if (new TextEncoder().encode(newPassword).length > 72) {
          setError('Password must be 72 UTF-8 bytes or fewer.');
          triggerShake();
          setIsLoading(false);
          return;
        }
        await resetPassword(resetToken, newPassword);
        setSuccessMsg('Your password has been successfully updated. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setError(msg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (m: Mode) => {
    setError('');
    setSuccessMsg('');
    setMode(m);
  };

  const strength = getStrength(mode === 'signup' ? password : newPassword);

  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-8 sm:py-12 lg:py-16 overflow-hidden">
      {/* Background ambient lighting effects (Deep Navy + Violet & Cyan accents) */}
      <div 
        aria-hidden="true" 
        className="absolute -top-32 left-1/4 w-[32rem] h-[32rem] bg-[#6D5CFF]/15 blur-[120px] rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute -bottom-32 right-1/4 w-[30rem] h-[30rem] bg-[#2DD4D0]/10 blur-[130px] rounded-full pointer-events-none" 
      />

      {/* Main Auth Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="flex flex-col">
          
          {/* ════════════════════════════════════════════════════════════════
              COLUMN 1: Sign-In Form Card (60% on desktop / 7 cols)
              ════════════════════════════════════════════════════════════════ */}
          <div className="flex flex-col justify-center">
            <motion.div
              animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
              className="bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_40px_rgba(109,92,255,0.08)] flex flex-col justify-between"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                >
                  {/* Brand Header */}
                  <div className="flex items-center justify-between mb-8">
                    <Link 
                      to="/" 
                      className="inline-flex items-center gap-3 group focus-visible:outline-2 focus-visible:outline-[#8B7BFF] rounded-lg p-1 -m-1"
                      aria-label="InterviewX Home"
                    >
                      <BrandNeonX size="md" withGlow={true} />
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-white tracking-tight group-hover:text-[#2DD4D0] transition-colors">
                          Interview<span className="text-[#8B7BFF]">X</span>
                        </span>
                        <span className="text-[10px] font-mono tracking-widest text-[#2DD4D0] uppercase">
                          Placement Engine
                        </span>
                      </div>
                    </Link>

                    {/* Mode tag indicator */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-white/5 border border-white/10 text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4D0] animate-pulse" />
                      {mode === 'login' && 'PORTAL ACCESS'}
                      {mode === 'signup' && 'NEW CANDIDATE'}
                      {mode === 'forgot' && 'ACCOUNT RECOVERY'}
                      {mode === 'reset' && 'CREDENTIAL UPDATE'}
                    </div>
                  </div>

                  {/* Headings */}
                  <div className="mb-7">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                      {mode === 'login' && (
                        <>Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">back!</span></>
                      )}
                      {mode === 'signup' && (
                        <>Create your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">account</span></>
                      )}
                      {mode === 'forgot' && (
                        <>Recover your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">access</span></>
                      )}
                      {mode === 'reset' && (
                        resetToken ? (
                          <>Set new <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">password</span></>
                        ) : (
                          <>Reset link <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">required</span></>
                        )
                      )}
                    </h1>
                    <p className="text-sm text-slate-400">
                      {mode === 'login' && 'Sign in to access your structured interview prep routines and diagnostics.'}
                      {mode === 'signup' && 'Join candidates preparing with targeted coding sprints and AI mock interviews.'}
                      {mode === 'forgot' && 'Enter your account email. If email delivery is configured, we’ll send a secure reset link.'}
                      {mode === 'reset' && (resetToken ? 'Choose a strong, unique password to secure your account.' : 'This page needs a valid reset link before you can choose a new password.')}
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} autoComplete="on" noValidate className="space-y-4">
                    
                    {/* Full Name (Sign Up only) */}
                    {mode === 'signup' && (
                      <div className="space-y-1.5">
                        <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            id="auth-name"
                            type="text"
                            placeholder="Alex Morgan"
                            autoComplete="name"
                            className="w-full pl-10 pr-4 py-3 bg-[#0B1020]/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6D5CFF] focus:ring-2 focus:ring-[#6D5CFF]/20 transition-all"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Email Field */}
                    {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                      <div className="space-y-1.5">
                        <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            id="auth-email"
                            ref={emailRef}
                            type="email"
                            placeholder="candidate@interviewx.dev"
                            autoComplete="email"
                            className="w-full pl-10 pr-4 py-3 bg-[#0B1020]/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6D5CFF] focus:ring-2 focus:ring-[#6D5CFF]/20 transition-all"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Password Field */}
                    {(mode === 'login' || mode === 'signup') && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300">
                            Password
                          </label>
                          {mode === 'login' && (
                            <button
                              type="button"
                              onClick={() => switchMode('forgot')}
                              className="text-xs text-[#8B7BFF] hover:text-[#A78BFA] transition-colors focus-visible:outline-2 focus-visible:outline-[#8B7BFF] rounded"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="auth-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            minLength={mode === 'signup' ? 8 : undefined}
                            className="w-full pl-10 pr-11 py-3 bg-[#0B1020]/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6D5CFF] focus:ring-2 focus:ring-[#6D5CFF]/20 transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyUp={handleCapsLock}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none focus-visible:text-[#8B7BFF]"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {capsLock && (
                          <p className="flex items-center gap-1.5 text-xs text-amber-400 mt-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            <span>Caps Lock is ON</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Password Strength Meter (Sign Up) */}
                    {mode === 'signup' && password.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Password Strength</span>
                          <span className="font-medium" style={{ color: strength.color }}>{strength.label}</span>
                        </div>
                        <div className="flex gap-1.5 h-1.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className="flex-1 rounded-full transition-colors duration-300"
                              style={{ 
                                backgroundColor: i <= strength.score ? strength.color : 'rgba(255, 255, 255, 0.1)' 
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Use 8+ characters with uppercase letters, numbers, and symbols.
                        </p>
                      </div>
                    )}

                    {/* New Password (Reset Mode) */}
                    {mode === 'reset' && !resetToken && (
                      <div role="alert" className="rounded-xl border border-amber-400/25 bg-amber-400/[0.06] p-3 text-xs text-amber-100">
                        This reset link is missing or invalid. Request a new link to continue.
                      </div>
                    )}

                    {mode === 'reset' && resetToken && (
                      <div className="space-y-1.5">
                        <label htmlFor="auth-new-password" className="block text-xs font-medium text-slate-300">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="auth-new-password"
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="At least 8 characters"
                            autoComplete="new-password"
                            minLength={8}
                            className="w-full pl-10 pr-11 py-3 bg-[#0B1020]/70 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#6D5CFF] focus:ring-2 focus:ring-[#6D5CFF]/20 transition-all"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(v => !v)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors focus-visible:outline-none"
                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {newPassword.length > 0 && (
                          <div className="flex gap-1.5 h-1.5 pt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className="flex-1 rounded-full transition-colors duration-300"
                                style={{ 
                                  backgroundColor: i <= strength.score ? strength.color : 'rgba(255, 255, 255, 0.1)' 
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Remember Me (Login) */}
                    {mode === 'login' && (
                      <div className="flex items-center pt-1 pb-1">
                        <label className="inline-flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#6D5CFF] focus:ring-[#6D5CFF] focus:ring-offset-0 focus:ring-1 cursor-pointer accent-[#6D5CFF]"
                          />
                          <span>Keep me signed in for 30 days</span>
                        </label>
                      </div>
                    )}

                    {/* Terms & Conditions (Sign Up) */}
                    {mode === 'signup' && (
                      <div className="flex items-start gap-2.5 pt-1">
                        <input
                          id="terms-checkbox"
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={e => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 mt-0.5 rounded border-white/20 bg-white/5 text-[#6D5CFF] focus:ring-[#6D5CFF] focus:ring-offset-0 cursor-pointer accent-[#6D5CFF]"
                        />
                        <label htmlFor="terms-checkbox" className="text-xs text-slate-400 select-none">
                          I agree to the{' '}
                          <Link to="/terms" target="_blank" className="text-[#8B7BFF] hover:underline font-medium">
                            Terms of Service
                          </Link>
                          ,{' '}
                          <Link to="/honor-code" target="_blank" className="text-[#8B7BFF] hover:underline font-medium">
                            Placement Honor Code
                          </Link>
                          , and{' '}
                          <Link to="/privacy" target="_blank" className="text-[#8B7BFF] hover:underline font-medium">
                            Privacy Policy
                          </Link>
                          .
                        </label>
                      </div>
                    )}

                    {/* Alerts / Feedback Messages */}
                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2"
                          role="alert"
                        >
                          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                      {successMsg && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2"
                          role="status"
                        >
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{successMsg}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Primary Submit Button */}
                    <button
                      type={mode === 'reset' && !resetToken ? 'button' : 'submit'}
                      onClick={mode === 'reset' && !resetToken ? () => switchMode('forgot') : undefined}
                      disabled={isLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] hover:opacity-95 active:scale-[0.99] transition-all duration-200 shadow-[0_4px_20px_rgba(109,92,255,0.35)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2DD4D0]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === 'login' && 'Sign In to InterviewX'}
                            {mode === 'signup' && 'Create Candidate Account'}
                            {mode === 'forgot' && 'Send Reset Instructions'}
                            {mode === 'reset' && (resetToken ? 'Update Password' : 'Request a reset link')}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Mode Switching Footer */}
                  <div className="mt-8 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
                    {mode === 'login' && (
                      <p>
                        New to InterviewX?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('signup')}
                          className="font-semibold text-[#2DD4D0] hover:text-[#3CC9D6] hover:underline transition-colors focus-visible:outline-none"
                        >
                          Create an account
                        </button>
                      </p>
                    )}
                    {mode === 'signup' && (
                      <p>
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => switchMode('login')}
                          className="font-semibold text-[#8B7BFF] hover:text-[#A78BFA] hover:underline transition-colors focus-visible:outline-none"
                        >
                          Sign in
                        </button>
                      </p>
                    )}
                    {(mode === 'forgot' || mode === 'reset') && (
                      <button
                        type="button"
                        onClick={() => switchMode('login')}
                        className="inline-flex items-center gap-1.5 font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        ← Return to sign in
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
