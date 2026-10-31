import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Code2, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Activity, 
  Clock, 
  Tag, 
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import type { CodingProblem, ProblemsResponse } from '@/lib/types';

export default function CompilerArena() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 30;

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: responseData, isLoading, isFetching } = useQuery<ProblemsResponse>({
    queryKey: ['codingProblems', { page, limit: pageSize, category: selectedCategory, difficulty: selectedDifficulty, company: selectedCompany, search: debouncedSearch }],
    queryFn: () => api.getCodingProblems({
      page,
      limit: pageSize,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      company: selectedCompany,
      search: debouncedSearch
    }),
    placeholderData: (previousData) => previousData
  });

  const problems = responseData?.problems || [];
  const total = responseData?.total || 0;
  const totalPages = responseData?.totalPages || 1;
  const totalSolved = responseData?.totalSolved || 0;
  const totalCatalog = responseData?.totalCatalog || 0;
  const categories = useMemo(() => {
    const rawList = responseData?.categories || ['All'];
    const seen = new Set<string>();
    const list: string[] = [];
    for (const cat of rawList) {
      const trimmed = cat.trim();
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        list.push(trimmed);
      }
    }
    return list;
  }, [responseData?.categories]);
  const companies = responseData?.companies || ['All'];

  const startRecord = total > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="flex-1 bg-[var(--bg-base)] text-[var(--text-primary)] p-4 lg:p-8 space-y-8 tech-grid-bg">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-indigo-400 font-semibold">
            <Code2 className="w-4 h-4" />
            <span>ALGORITHMIC PROVING GROUND // 3,555+ INGESTED PROBLEMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white mt-1">
            Algorithmic Problem Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            High-frequency placement problems engineered for strictly O(n) & O(1) runtime constraints with Judge0 sandboxed execution.
          </p>
        </div>

        {/* Telemetry Counter Bento Widget */}
        <div className="flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3.5 shadow-sm text-xs font-mono">
          <div>
            <div className="text-slate-500 text-[10px] uppercase">SOLVED PROGRESS</div>
            <div className="text-sm font-bold text-white">
              <span className="text-indigo-400">{totalSolved}</span> / {totalCatalog || 3555}
            </div>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <div className="text-slate-500 text-[10px] uppercase">EXECUTION SANDBOX</div>
            <div className="text-sm font-bold text-teal-400">JUDGE0 V8/JIT</div>
          </div>
        </div>
      </div>

      {/* Guest Mode Notice */}
      {!user && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-[#6D5CFF]/10 to-teal-500/10 border border-indigo-500/30 text-xs text-slate-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              <strong>Guest Exploration Mode:</strong> You can explore and practice all 3,555+ algorithmic problems. Sign in to submit solutions, verify edge cases with AI, and track solved progress.
            </span>
          </div>
          <Link
            to="/login?redirect=/compiler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white font-semibold text-xs hover:opacity-95 transition-opacity shrink-0 shadow"
          >
            <span>Sign In to Track</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bento-card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search 3,555+ problems by title, algorithm, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Topic Domains' : cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy (SDE-1 Baseline)</option>
              <option value="Medium">Medium (Core Hiring Bar)</option>
              <option value="Hard">Hard (FAANG / Staff Bar)</option>
            </select>
          </div>
        </div>

        {/* Company Quick-Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
          <span className="text-[11px] text-slate-400 mr-2 font-mono flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Company Loops:
          </span>
          {companies.slice(0, 8).map(comp => (
            <button
              key={comp}
              onClick={() => { setSelectedCompany(comp); setPage(1); }}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-all ${
                selectedCompany === comp
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-[var(--bg-elevated)] hover:bg-slate-700 text-slate-400 hover:text-white border border-[var(--border-subtle)]'
              }`}
            >
              {comp}
            </button>
          ))}
          {selectedCompany !== 'All' && (
            <button
              onClick={() => { setSelectedCompany('All'); setPage(1); }}
              className="text-[10px] text-rose-400 hover:underline ml-2 font-mono"
            >
              ✕ Clear Company
            </button>
          )}
        </div>
      </div>

      {/* Problems Table / List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <div>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Loading problem set...</span>
              </span>
            ) : (
              <span>Showing <strong className="text-white">{startRecord}–{endRecord}</strong> of <strong className="text-indigo-400">{total}</strong> problems</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="space-y-2">
          {problems.map(prob => {
            const isSolved = prob.isSolved;
            const diffColor = 
              prob.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              prob.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30';

            return (
              <Link
                key={prob.id}
                to={`/compiler/${prob.slug}`}
                className="group bento-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isSolved ? 'text-emerald-400' : 'text-slate-600'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors font-heading">
                        {prob.title}
                      </span>
                      <span className={`text-[10px] px-2 py-0.2 rounded font-bold border font-mono ${diffColor}`}>
                        {prob.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      {prob.category} • {prob.companyTags?.slice(0, 3).join(', ') || 'Core Algorithms'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-500 hidden md:block">
                    Acceptance: <span className="text-slate-300">{prob.acceptance || '82%'}</span>
                  </span>
                  <div className="px-3.5 py-1.5 rounded-lg bg-indigo-600/15 group-hover:bg-indigo-600 group-hover:text-white border border-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1.5 transition-all">
                    <span>Solve in IDE</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)] text-xs font-mono">
          <div className="text-slate-400">
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page <= 1 || isLoading}
              className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-slate-300 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            <span className="px-3 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-bold">
              {page}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-slate-300 hover:text-white disabled:opacity-30 transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-slate-300 hover:text-white disabled:opacity-30 transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
