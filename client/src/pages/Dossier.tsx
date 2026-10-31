import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Award,
  BookOpenCheck,
  CheckCircle2,
  Code2,
  Compass,
  Download,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';

function StatCard({ label, value, detail, icon: Icon }: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Award;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#10172D]/75 p-4 shadow-lg shadow-black/10 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08] text-cyan-200">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
    </article>
  );
}

export default function Dossier() {
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    enabled: !!user
  });

  const hasData = !!profile?.hasData;
  const strengths = (profile?.masteredVectors ?? []).slice(0, 4);
  const focusAreas = (profile?.weakVectors ?? []).slice(0, 4);
  const subjects = Object.entries(profile?.subjectBreakdown ?? {})
    .sort(([, a], [, b]) => b.accuracyPct - a.accuracyPct)
    .slice(0, 4);

  return (
    <section className="relative flex-1 overflow-hidden bg-[#0B1020] px-4 pb-32 pt-6 text-slate-100 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="dossier-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
              Your InterviewX dossier
            </div>
            <h1 id="dossier-title" className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your progress, in one clear view.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">A practical snapshot of your completed assessments, demonstrated strengths, and the areas to practice next.</p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-slate-200 transition-[border-color,background-color,color] hover:border-violet-300/30 hover:bg-violet-300/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 print:hidden"
          >
            <Download aria-hidden="true" className="h-4 w-4 text-cyan-300" />
            Print progress report
          </button>
        </header>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3" aria-label="Loading your dossier" aria-busy="true">
            {[1, 2, 3].map(item => <div key={item} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />)}
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-white/10 bg-[#10172D]/90 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl space-y-5 max-w-2xl mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-400/30 flex items-center justify-center mx-auto text-cyan-300 shadow-[0_0_30px_rgba(109,92,255,0.25)]">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Candidate Placement Dossier</h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                Sign in to view your verified placement velocity, skill vector diagnostics, completed sprints, and personalized interview readiness dossier.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/login?redirect=/dossier"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A72FF] via-[#6D5CFF] to-[#8B7BFF] text-white font-semibold text-sm hover:opacity-95 shadow-[0_4px_20px_rgba(109,92,255,0.35)] transition-all"
              >
                <span>Sign In to View Dossier</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup?redirect=/dossier"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-sm transition-colors"
              >
                <span>Create Free Account</span>
              </Link>
            </div>
          </div>
        ) : isError || !profile ? (
          <div role="alert" className="rounded-2xl border border-rose-300/20 bg-rose-300/[0.06] p-5 text-sm text-rose-100">
            We couldn’t load your progress right now. Refresh the page or try again shortly.
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151C35] via-[#10172D] to-[#101D30] shadow-[0_20px_70px_rgba(0,0,0,0.24)]" aria-label="Candidate overview">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-5 sm:p-7 lg:p-8">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-100">
                      <Award aria-hidden="true" className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Candidate profile</p>
                      <h2 className="mt-1 truncate text-xl font-semibold text-white sm:text-2xl">{profile.candidateName || 'InterviewX learner'}</h2>
                      <p className="mt-1 text-sm text-slate-400">Preparing for <span className="font-medium text-violet-200">{profile.targetTrack || 'software engineering interviews'}</span></p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0B1020]/55 p-4 sm:p-5">
                    <div>
                      <p className="text-xs font-medium text-slate-400">Placement Velocity Index</p>
                      <p className="mt-1 text-3xl font-semibold tracking-tight text-white">{hasData ? profile.placementVelocityIndex.toFixed(1) : '—'}<span className="ml-2 text-sm font-medium text-slate-500">PVI</span></p>
                      <p className="mt-1 text-xs text-slate-500">{hasData ? profile.velocityStatus : 'Complete an assessment to establish a baseline.'}</p>
                    </div>
                    <TrendingUp aria-hidden="true" className="mb-1 h-6 w-6 text-cyan-300" />
                    {hasData && <div className="w-full" role="progressbar" aria-label="Placement Velocity Index" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(profile.placementVelocityIndex)}>
                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${Math.max(0, Math.min(100, profile.placementVelocityIndex))}%` }} />
                      </div>
                    </div>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-px border-t border-white/[0.08] bg-white/[0.06] sm:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0">
                  <StatCard label="Assessments" value={String(profile.totalSprints)} detail="Completed practice sprints" icon={BookOpenCheck} />
                  <StatCard label="Questions reviewed" value={String(profile.totalQuestions)} detail="Across your saved assessments" icon={Target} />
                  <StatCard label="Accepted solutions" value={String(profile.codingSolvedCount)} detail="Passed coding submissions" icon={Code2} />
                </div>
              </div>
            </section>

            {!hasData ? (
              <section className="rounded-3xl border border-white/10 bg-[#10172D]/75 p-6 text-center shadow-lg shadow-black/10 sm:p-9" aria-labelledby="empty-dossier-title">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200"><Compass aria-hidden="true" className="h-6 w-6" /></span>
                <h2 id="empty-dossier-title" className="mt-4 text-lg font-semibold text-white">Your skills report starts with practice.</h2>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-400">Complete an assessment or coding challenge and this page will summarize your measured results here. No progress is shown until you have saved practice data.</p>
                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link to="/foundations" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 text-sm font-semibold text-[#080e1d] transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    Start an assessment <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                  <Link to="/compiler" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                    Try a coding challenge
                  </Link>
                </div>
              </section>
            ) : (
              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-3xl border border-white/10 bg-[#10172D]/75 p-5 shadow-lg shadow-black/10 sm:p-6" aria-labelledby="strengths-title">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/15 bg-cyan-300/[0.08] text-cyan-200"><CheckCircle2 aria-hidden="true" className="h-5 w-5" /></span>
                    <div><h2 id="strengths-title" className="text-base font-semibold text-white">Demonstrated strengths</h2><p className="mt-1 text-xs leading-5 text-slate-500">Topics with strong results in your saved practice.</p></div>
                  </div>
                  {strengths.length ? (
                    <ul className="mt-5 space-y-3">
                      {strengths.map(skill => <li key={skill.topic} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#0B1020]/55 px-4 py-3">
                        <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-100">{skill.topic}</p><p className="mt-0.5 text-xs text-slate-500">{skill.subject}</p></div>
                        <span className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-xs font-semibold text-cyan-200">{skill.accuracyPct}% accuracy</span>
                      </li>)}
                    </ul>
                  ) : <p className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">Your saved results haven’t identified a strong topic yet. Keep practicing to build a clearer picture.</p>}
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#10172D]/75 p-5 shadow-lg shadow-black/10 sm:p-6" aria-labelledby="focus-title">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.08] text-violet-200"><Target aria-hidden="true" className="h-5 w-5" /></span>
                    <div><h2 id="focus-title" className="text-base font-semibold text-white">Good areas to practice next</h2><p className="mt-1 text-xs leading-5 text-slate-500">Based on topics that need more practice in your saved results.</p></div>
                  </div>
                  {focusAreas.length ? (
                    <ul className="mt-5 space-y-3">
                      {focusAreas.map(skill => <li key={skill.topic} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-[#0B1020]/55 px-4 py-3">
                        <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-100">{skill.topic}</p><p className="mt-0.5 text-xs text-slate-500">{skill.subject}</p></div>
                        <span className="shrink-0 rounded-full border border-violet-300/20 bg-violet-300/[0.07] px-2.5 py-1 text-xs font-semibold text-violet-200">{skill.accuracyPct}% accuracy</span>
                      </li>)}
                    </ul>
                  ) : <p className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-5 text-sm text-slate-400">No priority focus areas are recorded. Complete more practice to keep this summary current.</p>}
                </section>
              </div>
            )}

            {hasData && subjects.length > 0 && <section className="rounded-3xl border border-white/10 bg-[#10172D]/75 p-5 shadow-lg shadow-black/10 sm:p-6" aria-labelledby="subjects-title">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><h2 id="subjects-title" className="text-base font-semibold text-white">Subject snapshot</h2><p className="mt-1 text-xs text-slate-500">Accuracy across subjects with completed questions.</p></div>
                <span className="text-xs text-slate-500">{profile.totalQuestions} questions evaluated</span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {subjects.map(([subject, result]) => <article key={subject} className="rounded-2xl border border-white/[0.07] bg-[#0B1020]/55 p-4">
                  <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium leading-5 text-slate-200">{subject}</h3><span className="text-sm font-semibold tabular-nums text-cyan-200">{result.accuracyPct}%</span></div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300" style={{ width: `${Math.max(0, Math.min(100, result.accuracyPct))}%` }} /></div>
                  <p className="mt-2 text-[11px] text-slate-500">{result.totalEvaluated} questions answered</p>
                </article>)}
              </div>
            </section>}

            <p className="text-center text-xs text-slate-500">{hasData ? `Summary based on ${profile.totalSprints} saved assessment${profile.totalSprints === 1 ? '' : 's'}.` : 'Your report will update when you complete practice.'}</p>
          </>
        )}
      </div>
    </section>
  );
}
