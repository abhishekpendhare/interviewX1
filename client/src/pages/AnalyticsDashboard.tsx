import React, { useState } from 'react';
import { isAxiosError } from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Activity,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  Code2,
  Layers,
  Mic,
  Compass,
  Target,
  ChevronRight,
  ShieldAlert,
  Zap,
  BarChart3
} from 'lucide-react';
import { api } from '@/lib/api';
import type { 
  AnalyticsProfileResponse
} from '@/lib/types';

export default function AnalyticsDashboard() {
  const queryClient = useQueryClient();
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<'all' | 'high' | 'focus'>('all');

  const { data, isLoading, isError, error, refetch } = useQuery<AnalyticsProfileResponse>({
    queryKey: ['analytics-profile'],
    queryFn: () => api.getAnalyticsProfile(false),
    retry: (failureCount, queryError) => {
      if (isAxiosError(queryError) && queryError.response?.status === 401) return false;
      return failureCount < 1;
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: () => api.reanalyzeProfile(),
    onSuccess: (updated) => {
      queryClient.setQueryData(['analytics-profile'], updated);
    }
  });

  const handleReanalyze = () => {
    reanalyzeMutation.mutate();
  };

  // If loading, show glassmorphic skeleton loader
  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-[#0B1020] text-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-14 w-72 rounded-2xl bg-white/[0.04] border border-white/10 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 rounded-2xl bg-[#10172D]/60 border border-white/10 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 rounded-2xl bg-[#10172D]/60 border border-white/10 animate-pulse" />
            <div className="h-72 rounded-2xl bg-[#10172D]/60 border border-white/10 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-[#10172D]/60 border border-white/10 animate-pulse" />
            <div className="h-80 rounded-2xl bg-[#10172D]/60 border border-white/10 animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  // If error, show recovery banner or sign-in prompt
  if (isError || !data) {
    // Detect 401 Unauthenticated — show a clear sign-in prompt, not a server-fault message
    const is401 = isAxiosError(error) && error.response?.status === 401;
    if (is401) {
      return (
        <main className="relative min-h-screen bg-[#0B1020] text-slate-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-[#10172D]/90 border border-indigo-500/30 rounded-2xl p-6 text-center shadow-2xl">
            <ShieldAlert className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-white">Sign In to View Analytics</h2>
            <p className="text-sm text-slate-400 mt-2 mb-6">
              Your performance dashboard is only available to signed-in students. Log in to see your diagnostic metrics and insights.
            </p>
            <Link
              to={`/login?redirect=/analytics`}
              className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white text-sm font-medium hover:opacity-95 transition-opacity"
            >
              Sign In
            </Link>
            <Link to="/" className="block mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors">
              Back to Home
            </Link>
          </div>
        </main>
      );
    }

    // Non-401 error — genuine service failure
    return (
      <main className="relative min-h-screen bg-[#0B1020] text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#10172D]/90 border border-rose-500/30 rounded-2xl p-6 text-center shadow-2xl">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-white">Telemetry Pipeline Unavailable</h2>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Could not compute student diagnostic metrics. Please verify connectivity or retry.
          </p>
          <button
            onClick={() => refetch()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white text-sm font-medium hover:opacity-95 transition-opacity"
          >
            Retry Analysis
          </button>
        </div>
      </main>
    );
  }

  // Empty state: student has no attempts, submissions, or interviews
  if (!data.hasData || !data.analysis) {
    return (
      <main className="relative min-h-screen bg-[#0B1020] text-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="border-b border-white/10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-semibold text-indigo-300 mb-3">
              <Activity className="w-3.5 h-3.5 text-[#2DD4D0]" />
              Placement Analytics & Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Performance Analytics Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Personalized technical evaluation profile and skill-vector diagnostics.
            </p>
          </header>

          {/* Inviting Empty State Glass Card */}
          <section className="bg-[#10172D]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/15 blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_30px_rgba(45,212,208,0.2)]">
                <Activity className="w-8 h-8" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white">
                No Practice Activity Recorded Yet
              </h2>

              <p className="text-sm leading-relaxed text-slate-300">
                Your performance analytics dashboard analyzes your real technical work.
                Solve problems in the coding arena, complete timed foundation sprints, or practice voice mock interviews to generate diagnostic telemetry and actionable AI recommendations.
              </p>

              <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                <Link
                  to="/compiler"
                  className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 mb-3 group-hover:scale-105 transition-transform">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                      Coding Arena
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Solve 3,555+ algorithmic challenges with Big-O analysis.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-indigo-400">
                    <span>Practice now</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  to="/foundations"
                  className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                      Core Sprints
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Take 15-min diagnostic sprints on DBMS, OS & Networks.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-400">
                    <span>Start sprint</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>

                <Link
                  to="/simulator"
                  className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-105 transition-transform">
                      <Mic className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-[#2DD4D0] transition-colors">
                      Voice Mock
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Simulate FAANG Staff Engineer behavioral & system design rounds.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-cyan-400">
                    <span>Begin mock</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const { analysis, computedStats } = data;
  const overallScore = analysis.overall_score || computedStats?.overallScore || 70;
  const strengths = analysis.strengths || [];
  const weaknesses = analysis.weaknesses || [];
  const allTopics = analysis.topic_breakdown || computedStats?.topicBreakdown || [];
  const suggestions = analysis.suggestions || [];
  const nextMilestone = analysis.next_milestone;
  const trendData = computedStats?.trendData || [];

  // Filter topics for the topic breakdown chart
  const displayedTopics = allTopics.filter(t => {
    if (selectedTopicFilter === 'high') return t.accuracy >= 70;
    if (selectedTopicFilter === 'focus') return t.accuracy < 70;
    return true;
  });

  return (
    <main className="relative min-h-screen bg-[#0B1020] text-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-36">
      {/* Background ambient radial glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 w-[36rem] h-[36rem] rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-96 right-10 w-[30rem] h-[30rem] rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header Strip */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-xs font-semibold text-indigo-300 mb-2">
              <Activity className="w-3.5 h-3.5 text-[#2DD4D0]" />
              Telemetry Verified
              {data.cached && (
                <span className="text-[10px] text-slate-400 ml-1">· Cached {data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Performance Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Candidate: <span className="text-white font-medium">{computedStats?.candidateName || 'Candidate'}</span> · Track: <span className="text-slate-300">{computedStats?.targetTrack || 'Tier-1 Product SDE'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReanalyze}
              disabled={reanalyzeMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4D0] cursor-pointer disabled:opacity-50"
              aria-label="Re-analyze performance data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#2DD4D0] ${reanalyzeMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{reanalyzeMutation.isPending ? 'Re-analyzing...' : 'Re-analyze'}</span>
            </button>
            <Link
              to="/dossier"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-xs font-semibold text-white shadow-[0_0_20px_rgba(109,92,255,0.3)] hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7BFF]"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Full Dossier</span>
            </Link>
          </div>
        </header>

        {/* 1. Quick Stats Strip */}
        <section aria-label="Key performance indicators" className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Overall Accuracy</span>
              <Activity className="w-4 h-4 text-[#2DD4D0]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {computedStats?.overallAccuracy || 70}%
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Across {computedStats?.totalQuestions || 0} sprint questions
            </div>
          </div>

          <div className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Coding Solved</span>
              <Code2 className="w-4 h-4 text-[#8B7BFF]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {computedStats?.codingSolvedCount || 0}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {computedStats?.totalCodeSubmissions || 0} total submissions ({computedStats?.codingAcceptedPct || 0}% accepted)
            </div>
          </div>

          <div className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Mock Interview Rating</span>
              <Mic className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {computedStats?.avgTechnicalScore || 78}/100
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {computedStats?.mockInterviewCount || 0} sessions completed
            </div>
          </div>

          <div className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Roadmap Progress</span>
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white tracking-tight">
              {computedStats?.roadmapProgressPct || 25}%
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Active milestone pacing
            </div>
          </div>
        </section>

        {/* 2. Top Bento Grid: Overall Score & Summary + Next Milestone */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Score Card (2 cols) */}
          <article className="lg:col-span-2 bg-[#10172D]/85 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Pure SVG Radial Gauge */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="transparent"
                  stroke="url(#score-gradient)"
                  strokeWidth="10"
                  strokeDasharray={`${(overallScore / 100) * 314.15} 314.15`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4D0" />
                    <stop offset="50%" stopColor="#6D5CFF" />
                    <stop offset="100%" stopColor="#8B7BFF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {overallScore}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Readiness
                </span>
              </div>
            </div>

            {/* Score Summary & Classification */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-xs font-semibold text-[#2DD4D0]">
                <Zap className="w-3.5 h-3.5" />
                {overallScore >= 85 ? 'Elite Placement Tier (Day-0 FAANG Ready)' :
                 overallScore >= 70 ? 'Tier-1 Tech Ready (Amazon / Unicorn)' :
                 'Foundational Calibration Underway'}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white">
                Diagnostic Placement Assessment
              </h2>

              <p className="text-sm leading-relaxed text-slate-300">
                {analysis.summary}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4D0]" />
                  Avg response: {computedStats?.averageTimePerQuestionSec || 120}s
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#8B7BFF]" />
                  Track: {computedStats?.targetTrack ? computedStats.targetTrack.split('(')[0] : 'SDE'}
                </span>
              </div>
            </div>
          </article>

          {/* Next Milestone Callout Card (1 col) */}
          <article className="bg-gradient-to-br from-[#10172D]/95 via-[#161F3B]/90 to-[#1A1838]/90 backdrop-blur-xl border border-indigo-400/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Target className="w-5 h-5 text-cyan-300" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Primary Placement Target
              </span>

              <h3 className="text-base font-semibold text-white leading-snug">
                Next Critical Milestone
              </h3>

              <p className="text-xs leading-relaxed text-slate-300">
                {nextMilestone}
              </p>
            </div>

            <div className="pt-5 mt-4 border-t border-white/10 relative z-10">
              <Link
                to="/compiler"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2DD4D0]"
              >
                <span>Execute milestone drills</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#2DD4D0]" />
              </Link>
            </div>
          </article>
        </section>

        {/* 3. Strengths vs Weaknesses Comparison Section */}
        <section aria-labelledby="comparison-heading" className="space-y-3">
          <h2 id="comparison-heading" className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#2DD4D0]" />
            Strengths vs. High-Priority Focus Areas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <article className="bg-[#10172D]/75 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Demonstrated Technical Strengths
                  </h3>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  {strengths.length} topics mastered
                </span>
              </div>

              <div className="space-y-3">
                {strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.topic}</span>
                      <span className="font-mono font-bold text-emerald-400">{item.score}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#2DD4D0] rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      {item.evidence}
                    </p>
                  </div>
                ))}
                {strengths.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">Complete additional sprints to verify strengths.</p>
                )}
              </div>
            </article>

            {/* Weaknesses Card */}
            <article className="bg-[#10172D]/75 backdrop-blur-xl border border-amber-500/20 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    High-Priority Vectors to Address
                  </h3>
                </div>
                <span className="text-xs font-semibold text-amber-400">
                  {weaknesses.length} flagged
                </span>
              </div>

              <div className="space-y-3">
                {weaknesses.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{item.topic}</span>
                      <span className="font-mono font-bold text-amber-400">{item.score}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, item.score)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      {item.evidence}
                    </p>

                    {item.why_it_matters && (
                      <div className="text-[10px] text-amber-300/90 font-medium flex items-center gap-1">
                        <span>Why it matters:</span>
                        <span className="text-slate-300">{item.why_it_matters}</span>
                      </div>
                    )}
                  </div>
                ))}
                {weaknesses.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">No critical weaknesses detected!</p>
                )}
              </div>
            </article>
          </div>
        </section>

        {/* 4. Topic Breakdown Chart & Performance Trend */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic Breakdown Bar Chart (2 cols) */}
          <article className="lg:col-span-2 bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Topic-Level Accuracy & Evaluation Volumes</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accuracy across DSA invariants, systems internals, and screening topics
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="inline-flex items-center p-1 rounded-xl bg-white/[0.05] border border-white/10 text-xs">
                <button
                  onClick={() => setSelectedTopicFilter('all')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedTopicFilter === 'all' ? 'bg-[#6D5CFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({allTopics.length})
                </button>
                <button
                  onClick={() => setSelectedTopicFilter('high')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedTopicFilter === 'high' ? 'bg-[#6D5CFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Mastered (≥70%)
                </button>
                <button
                  onClick={() => setSelectedTopicFilter('focus')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                    selectedTopicFilter === 'focus' ? 'bg-[#6D5CFF] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Needs Focus
                </button>
              </div>
            </div>

            {/* Pure SVG Bar Chart */}
            <div className="space-y-3">
              {displayedTopics.slice(0, 8).map((t, idx) => {
                const color = t.accuracy >= 75 ? '#2DD4D0' : t.accuracy >= 50 ? '#8B7BFF' : '#F59E0B';
                return (
                  <div key={idx} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-white truncate max-w-[200px] sm:max-w-xs">{t.topic}</span>
                        {t.trend === 'up' && (
                          <span className="inline-flex items-center text-[10px] text-emerald-400 font-mono gap-0.5">
                            <TrendingUp className="w-3 h-3" /> up
                          </span>
                        )}
                        {t.trend === 'down' && (
                          <span className="inline-flex items-center text-[10px] text-rose-400 font-mono gap-0.5">
                            <TrendingDown className="w-3 h-3" /> down
                          </span>
                        )}
                        {t.trend === 'flat' && (
                          <span className="inline-flex items-center text-[10px] text-slate-400 font-mono gap-0.5">
                            <Minus className="w-3 h-3" /> flat
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono">{t.attempts} attempts</span>
                        <span className="font-mono font-bold text-sm" style={{ color }}>{t.accuracy}%</span>
                      </div>
                    </div>

                    {/* SVG Bar */}
                    <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.max(4, t.accuracy)}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {displayedTopics.length === 0 && (
                <p className="text-xs text-slate-400 py-6 text-center">No topics match this filter.</p>
              )}
            </div>
          </article>

          {/* Performance Trend Line Chart (1 col) */}
          <article className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-1 border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#8B7BFF]" />
                Sprint Trajectory Trend
              </h3>
              <p className="text-xs text-slate-400">
                Evaluation accuracy across consecutive benchmarks
              </p>
            </div>

            {/* Pure SVG Sparkline / Line Chart */}
            <div className="py-2">
              {trendData.length >= 2 ? (
                <div className="relative w-full h-44">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D5CFF" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#6D5CFF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Compute points */}
                    {(() => {
                      const count = trendData.length;
                      const step = 280 / (count - 1);
                      const points = trendData.map((d, i) => {
                        const x = 10 + i * step;
                        const y = 110 - (d.accuracy / 100) * 90;
                        return { x, y, ...d };
                      });

                      const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
                      const areaD = `${pathD} L ${points[points.length - 1].x} 115 L ${points[0].x} 115 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#trend-fill)" />
                          <path d={pathD} fill="none" stroke="#2DD4D0" strokeWidth="2.5" strokeLinecap="round" />
                          {points.map((p, i) => (
                            <g key={i}>
                              <circle cx={p.x} cy={p.y} r="4" fill="#10172D" stroke="#2DD4D0" strokeWidth="2" />
                              <text
                                x={p.x}
                                y={p.y - 8}
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize="9"
                                fontFamily="monospace"
                              >
                                {p.accuracy}%
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-3">
                    <span>{trendData[0]?.label || 'Start'}</span>
                    <span>{trendData[trendData.length - 1]?.label || 'Latest'}</span>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center text-xs text-slate-400 p-4">
                  <Activity className="w-8 h-8 text-slate-600 mb-2" />
                  <span>Take 2 or more foundation sprints to visualize multi-session velocity delta.</span>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-3 text-xs text-slate-400">
              <span className="text-white font-medium">Trajectory: </span>
              {trendData.length >= 2 && trendData[trendData.length - 1].accuracy >= trendData[0].accuracy ? (
                <span className="text-emerald-400 font-semibold">Accelerating (+{trendData[trendData.length - 1].accuracy - trendData[0].accuracy}%)</span>
              ) : (
                <span className="text-indigo-300">Calibrating</span>
              )}
            </div>
          </article>
        </section>

        {/* 5. Concrete Actionable Next Steps / AI Suggestions */}
        <section aria-labelledby="suggestions-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="suggestions-heading" className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              Prioritized Action Plan
            </h2>
            <span className="text-xs text-slate-400">
              AI-calibrated against verified weak vectors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((sug, idx) => {
              const badgeStyle =
                sug.priority === 'high'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  : sug.priority === 'medium'
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';

              return (
                <article
                  key={idx}
                  className="bg-[#10172D]/75 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                        {sug.priority} Priority
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {sug.estimated_time}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-[#2DD4D0] transition-colors leading-snug">
                      {sug.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {sug.action}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5">
                    <Link
                      to="/compiler"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#8B7BFF] hover:text-[#2DD4D0] transition-colors"
                    >
                      <span>Start practicing</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
