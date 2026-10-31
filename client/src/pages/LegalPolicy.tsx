import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Shield, BookOpen, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

type PolicyTab = 'terms' | 'honor-code' | 'privacy';

interface LegalPolicyProps {
  initialSection?: PolicyTab;
}

export default function LegalPolicy({ initialSection }: LegalPolicyProps) {
  const location = useLocation();

  const getTabFromPath = (): PolicyTab => {
    if (initialSection) return initialSection;
    if (location.pathname.includes('privacy')) return 'privacy';
    if (location.pathname.includes('honor-code')) return 'honor-code';
    return 'terms';
  };

  const [activeTab, setActiveTab] = useState<PolicyTab>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, initialSection]);

  return (
    <div className="flex-1 bg-[#0B1020] text-slate-100 min-h-[calc(100vh-5rem)] py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/4 w-[36rem] h-[36rem] bg-[#6D5CFF]/10 blur-[150px] rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#2DD4D0]/10 blur-[140px] rounded-full pointer-events-none" 
      />

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO PLATFORM</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#2DD4D0] uppercase tracking-wider mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Governance & Candidate Integrity</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Platform Policies & Ethics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Effective Date: October 2026 · Applied across all autonomous practice simulations, compiler runs, and assessments.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#10172D]/90 border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'terms'
                ? 'bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('honor-code')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'honor-code'
                ? 'bg-gradient-to-r from-[#6D5CFF] to-[#8B7BFF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Placement Honor Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'privacy'
                ? 'bg-gradient-to-r from-[#2DD4D0] to-[#4A72FF] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
        </div>

        <div className="bg-[#10172D]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          {activeTab === 'terms' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Terms of Service</h2>
                <p className="text-xs text-slate-400 mt-1">Rules governing access and usage of the InterviewX Autonomous Placement Engineering Platform.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  1. Platform Purpose & Educational Scope
                </h3>
                <p>
                  InterviewX is an autonomous placement preparation and technical interview practice system designed for computer science and engineering candidates. The platform provides sandboxed code evaluation, algorithmic practice suites, adaptive foundation benchmarks, and real-time AI interview simulations.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  2. Candidate Accounts & Verification
                </h3>
                <p>
                  To persist your coding submissions, benchmark scores, Placement Velocity Index (PVI), and customized career roadmaps, you must register a candidate account. You agree to provide accurate information and safeguard your credentials. Sessions are secured via cryptographic HTTP-only cookie tokens.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  3. Fair Use & Sandboxed Execution
                </h3>
                <p>
                  Our code execution sandbox uses isolated environments to evaluate programming solutions. You agree not to attempt denial-of-service, network scanning, or unauthorized exploitation of sandbox processes. Malicious payloads will result in immediate session revocation.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  4. Placement Velocity & Diagnostics
                </h3>
                <p>
                  All diagnostic scores, weak-vector identifications, and mock bar-raiser feedback are intended as developmental indicators to accelerate engineering readiness. They do not guarantee job offers or official employment sponsorship.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'honor-code' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Placement Honor Code</h2>
                <p className="text-xs text-slate-400 mt-1">Ethical standards required to maintain authentic telemetry and fair engineering evaluation.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B7BFF]" />
                  1. Authentic Problem Solving
                </h3>
                <p>
                  Every solution submitted to the Algorithmic Proving Ground must be your own authentic intellectual work or formulated through legitimate study. Copy-pasting boilerplate without understanding ruins personal diagnostic telemetry.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B7BFF]" />
                  2. Timed Assessment Invariants
                </h3>
                <p>
                  During timed Foundation Sprints and Aptitude benchmarks, you agree not to use unauthorized external reference engines or secondary device automation. Accurate benchmarking enables the Neural Advisor to pinpoint genuine weak vectors.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8B7BFF]" />
                  3. Peer Suggestions & Collaborative Feedback
                </h3>
                <p>
                  When submitting question reviews or alternative algorithm approaches in the Community Feedback section, you agree to treat peers with professional engineering respect and provide constructive asymptotic analysis.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="border-b border-white/10 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Privacy Policy</h2>
                <p className="text-xs text-slate-400 mt-1">How candidate credentials, code submissions, and practice telemetry are collected and protected.</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  1. Data Security & Storage
                </h3>
                <p>
                  Candidate passwords are never stored in plaintext; all credentials are salted and hashed using industry-standard bcrypt. Session tokens are transmitted exclusively through secure HTTP-only cookies to prevent cross-site scripting (XSS) extraction.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  2. Student Telemetry Privacy
                </h3>
                <p>
                  Your algorithmic performance profiles, voice mock simulation transcripts, and personalized career roadmaps are tied strictly to your authenticated session. Anonymous visitors cannot view or query another student's dossier or advisor history.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                  3. Zero Third-Party Monetization
                </h3>
                <p>
                  We do not sell, rent, or distribute candidate telemetry or personal contact details to third-party ad networks or recruitment brokers without explicit candidate authorization.
                </p>
              </section>
            </div>
          )}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-slate-500">
            Have questions regarding governance or data privacy?{' '}
            <Link to="/#section-contact" className="text-[#2DD4D0] hover:underline font-mono">
              Contact our engineering team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
