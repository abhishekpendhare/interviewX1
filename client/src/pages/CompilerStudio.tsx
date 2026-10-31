import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor, { loader } from '@monaco-editor/react';

// Configure CDN path for Monaco Editor assets
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});
import { 
  Play, 
  Send, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database, 
  ArrowLeft, 
  Terminal, 
  Sparkles,
  HelpCircle,
  Zap,
  RefreshCw,
  FileText,
  History,
  BookOpen,
  Lock,
  Unlock,
  AlertTriangle,
  Award,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';
import type { CodeSubmission } from '@/lib/types';

export default function CompilerStudio() {
  const { slug = 'two-sum' } = useParams();
  const queryClient = useQueryClient();

  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [code, setCode] = useState('');
  const [approachText, setApproachText] = useState('');
  const [leftTab, setLeftTab] = useState<'problem' | 'hints' | 'editorial' | 'approach' | 'submissions'>('problem');
  const [activeConsoleTab, setActiveConsoleTab] = useState<'tests' | 'custom' | 'aiAudit'>('tests');
  const [customInput, setCustomInput] = useState('');
  
  // Hint reveal state
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  const [isRevealingHint, setIsRevealingHint] = useState(false);

  // Editorial state
  const [editorialData, setEditorialData] = useState<any>(null);
  const [editorialError, setEditorialError] = useState<string | null>(null);
  const [isLoadingEditorial, setIsLoadingEditorial] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [editorialLang, setEditorialLang] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');

  // Screen reader verdict announcement
  const [srAnnouncement, setSrAnnouncement] = useState('');

  const { data: problem, isLoading } = useQuery({
    queryKey: ['codingProblem', slug],
    queryFn: () => api.getCodingProblem(slug)
  });

  const { data: pastSubmissions = [], refetch: refetchSubmissions } = useQuery<CodeSubmission[]>({
    queryKey: ['problemSubmissions', problem?.id || slug],
    queryFn: () => api.getProblemSubmissions(problem?.id || slug),
    enabled: !!problem
  });

  // Draft persistence in localStorage
  const draftKey = `strata_draft_${problem?.id || slug}_${language}`;

  useEffect(() => {
    if (problem && problem.starterCode) {
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft !== null && savedDraft.trim().length > 0) {
        setCode(savedDraft);
      } else {
        setCode(problem.starterCode[language] || problem.starterCode.javascript || '');
      }
    }
  }, [problem, language, draftKey]);

  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode || '';
    setCode(val);
    try {
      localStorage.setItem(draftKey, val);
    } catch {}
  };

  const handleResetToStarter = () => {
    if (problem && problem.starterCode) {
      const starter = problem.starterCode[language] || '';
      setCode(starter);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
    }
  };

  const runMutation = useMutation({
    mutationFn: () => api.runCode({
      problemId: problem?.id || slug,
      code,
      language,
      customInput: customInput.trim() ? customInput : undefined
    }),
    onSuccess: (data) => {
      setActiveConsoleTab('tests');
      setSrAnnouncement(`Run completed: Status ${data.status}. Latency ${data.executionTime}.`);
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => api.submitCode({
      problemId: problem?.id || slug,
      code,
      language,
      approachText
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['codingProblems'] });
      queryClient.invalidateQueries({ queryKey: ['codingProblem', slug] });
      refetchSubmissions();
      setActiveConsoleTab('tests');
      setSrAnnouncement(`Submission evaluation verdict: ${data.status}. ${data.passedTestCases} of ${data.totalTestCases} test cases passed.`);
      
      // Auto-unlock editorial if solved
      if (data.status === 'Accepted' && !editorialData) {
        fetchEditorial(false);
      }
    }
  });

  // Reveal next hint
  const handleRevealNextHint = async () => {
    if (!problem) return;
    setIsRevealingHint(true);
    try {
      const nextIndex = revealedHints.length;
      const res = await api.getProblemHint(problem.id, nextIndex);
      if (res && res.text) {
        setRevealedHints(prev => [...prev, res.text]);
      }
    } catch (err: any) {
      console.error("Hint reveal error:", err);
    } finally {
      setIsRevealingHint(false);
    }
  };

  // Fetch editorial
  const fetchEditorial = useCallback(async (giveUp: boolean = false) => {
    if (!problem) return;
    setIsLoadingEditorial(true);
    setEditorialError(null);
    try {
      const res = await api.getProblemEditorial(problem.id, giveUp);
      if (res.unlocked && res.editorial) {
        setEditorialData(res);
        setShowGiveUpConfirm(false);
      }
    } catch (err: any) {
      setEditorialError(err?.response?.data?.error || "Editorial is currently locked.");
    } finally {
      setIsLoadingEditorial(false);
    }
  }, [problem]);

  // Load editorial if already solved
  useEffect(() => {
    if (problem && problem.isSolved && !editorialData && !isLoadingEditorial) {
      fetchEditorial(false);
    }
  }, [problem, editorialData, isLoadingEditorial, fetchEditorial]);

  // Keyboard Shortcuts: Ctrl+Enter (Run) & Ctrl+Shift+Enter (Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          if (!submitMutation.isPending) submitMutation.mutate();
        } else {
          if (!runMutation.isPending) runMutation.mutate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [submitMutation, runMutation]);

  const aiAuditMutation = useMutation({
    mutationFn: () => api.queryAdvisor({
      query: `Analyze this ${language} solution for "${problem?.title}". Provide Big-O time and space complexity audit, detect any edge case vulnerabilities, and suggest optimal algorithmic improvements:\n\n\`\`\`${language}\n${code}\n\`\`\``,
      mode: 'code_audit'
    })
  });

  const handleInsertApproachTemplate = () => {
    const template = `### 1. Intuition & High-Level Strategy
Explain your immediate conceptual insight for solving this problem...

### 2. Algorithmic Steps
- Step 1: Initialize data structure / pointers
- Step 2: Traverse input elements and compute state
- Step 3: Return resulting answer or boundary condition

### 3. Complexity Invariants
- **Time Complexity:** O(n) amortized time
- **Space Complexity:** O(n) auxiliary space

### 4. Edge Cases Handled
- Empty input or single element
- Duplicate keys or negative values
- Boundary limit overflows`;
    setApproachText(template);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 bg-[#0b0f19] text-indigo-400 font-mono text-xs">
        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
        LOADING PROBLEM RUNTIME CONSOLE...
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#0b0f19] text-slate-300 font-mono space-y-4">
        <p>Problem specification not found in repository.</p>
        <Link to="/compiler" className="text-indigo-400 hover:underline text-xs flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const isSolved = problem.isSolved || pastSubmissions.some(s => s.status === 'Accepted');
  const hintsCount = problem.hintsCount || 3;

  return (
    <div className="flex-1 flex flex-col bg-[#0b0f19] text-slate-200 h-[calc(100vh-60px)] overflow-hidden font-sans">
      {/* Screen reader live region */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {srAnnouncement}
      </div>

      {/* Studio Header Bar */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2.5">
          <Link
            to="/compiler"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Return to Arena"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs sm:text-sm font-heading">{problem.title}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border font-mono ${
              problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
              problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
              'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {problem.difficulty}
            </span>
            {isSolved && (
              <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 font-mono">
                <Check className="w-3 h-3" /> SOLVED
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="bg-[#0b0f19] border border-[#1e293b] text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-mono"
            aria-label="Target Programming Language"
          >
            <option value="javascript">JavaScript (Node)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ 20 (GCC)</option>
            <option value="java">Java 17 (OpenJDK)</option>
          </select>

          <button
            onClick={handleResetToStarter}
            className="p-1.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 text-slate-400 border border-[#1e293b] transition-colors"
            title="Reset code boilerplate to empty starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => runMutation.mutate()}
            disabled={runMutation.isPending}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
            title="Run against sample test case (Ctrl+Enter)"
          >
            {runMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Run</span>
          </button>

          <button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending}
            className="px-3 sm:px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 text-xs"
            title="Submit to hidden test suite (Ctrl+Shift+Enter)"
          >
            {submitMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Split IDE Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Problem Inspector Tabs (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0f172a] border-r border-[#1e293b] flex flex-col overflow-hidden">
          
          {/* Sub-nav tabs */}
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#1e293b] bg-[#0b0f19] text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setLeftTab('problem')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'problem'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setLeftTab('hints')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'hints'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hints ({revealedHints.length}/{hintsCount})</span>
            </button>

            <button
              onClick={() => {
                setLeftTab('editorial');
                if (!editorialData && !isLoadingEditorial) fetchEditorial(false);
              }}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'editorial'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {editorialData ? <Unlock className="w-3.5 h-3.5 text-emerald-300" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Editorial</span>
            </button>

            <button
              onClick={() => setLeftTab('approach')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'approach'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>My Approach {approachText.trim().length > 0 && '✓'}</span>
            </button>

            <button
              onClick={() => setLeftTab('submissions')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
                leftTab === 'submissions'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions ({pastSubmissions.length})</span>
            </button>
          </div>

          {/* Left Tab Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 text-xs font-sans">
            
            {/* TAB 1: Problem Description */}
            {leftTab === 'problem' && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Statement</h2>
                  <div className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {problem.description}
                  </div>
                </div>

                {/* Sample Examples (Never hidden tests) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Sample Examples</h3>
                  {problem.examples?.map((ex, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[#0b0f19] border border-[#1e293b] space-y-1.5 font-mono">
                      <div className="text-indigo-400 font-bold">Example {idx + 1}:</div>
                      <div className="text-slate-300"><span className="text-slate-500">Input:</span> {ex.input}</div>
                      <div className="text-slate-300"><span className="text-slate-500">Output:</span> {ex.output}</div>
                      {ex.explanation && (
                        <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-900">
                          <span className="text-slate-500">Explanation:</span> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Formal Constraints */}
                <div className="space-y-2 font-mono">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Formal Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    {problem.constraints?.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>

                {/* Company Tag Badges */}
                <div className="p-3 bg-[#0b0f19] rounded-lg border border-[#1e293b] space-y-2">
                  <div className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    <Zap className="w-3.5 h-3.5" />
                    <span>COMPANY PLACEMENT LOOP FREQUENCY</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {problem.companyTags?.map(tag => (
                      <span key={tag} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Hints (Revealed one at a time) */}
            {leftTab === 'hints' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Algorithmic Hints</span>
                  </h2>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {revealedHints.length} of {hintsCount} revealed
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hints guide your conceptual intuition step-by-step without giving away the full solution. Revealing hints is recorded for learning analytics.
                </p>

                {revealedHints.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 bg-[#0b0f19] rounded-lg border border-[#1e293b]">
                    No hints revealed yet. Try formulating your approach first!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {revealedHints.map((hintText, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-[#0b0f19] border border-amber-500/20 space-y-1">
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                          Hint {idx + 1}
                        </div>
                        <div className="text-slate-300 leading-relaxed">
                          {hintText}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {revealedHints.length < hintsCount && (
                  <button
                    onClick={handleRevealNextHint}
                    disabled={isRevealingHint}
                    className="w-full py-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold flex items-center justify-center gap-2 transition-colors text-xs disabled:opacity-50"
                  >
                    {isRevealingHint ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HelpCircle className="w-3.5 h-3.5" />}
                    <span>Reveal Hint {revealedHints.length + 1}</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 3: Editorial (Locked until Accepted or confirmed Give Up) */}
            {leftTab === 'editorial' && (
              <div className="space-y-4">
                {isLoadingEditorial ? (
                  <div className="p-8 text-center text-indigo-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Loading verified editorial analysis...</span>
                  </div>
                ) : editorialData?.editorial ? (
                  <div className="space-y-4">
                    {editorialData.warning && (
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{editorialData.warning}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-sm">
                        <Award className="w-4 h-4" />
                        <span>Official Reference Editorial</span>
                      </div>
                      <div className="text-slate-300 whitespace-pre-line leading-relaxed p-3.5 bg-[#0b0f19] rounded-lg border border-[#1e293b]">
                        {editorialData.editorial.approach}
                      </div>
                    </div>

                    {/* Complexity Analysis */}
                    {editorialData.editorial.complexity && (
                      <div className="p-3.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] space-y-2 font-mono text-xs">
                        <div className="font-bold text-white uppercase tracking-wider">Complexity Invariants</div>
                        <div className="text-emerald-400"><span className="text-slate-500">Time:</span> {editorialData.editorial.complexity.time}</div>
                        <div className="text-cyan-400"><span className="text-slate-500">Space:</span> {editorialData.editorial.complexity.space}</div>
                      </div>
                    )}

                    {/* Reference Implementation Code */}
                    {editorialData.editorial.code && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white uppercase tracking-wider font-mono text-xs">Reference Implementation</span>
                          <div className="flex gap-1">
                            {['javascript', 'python', 'cpp', 'java'].map(lang => (
                              <button
                                key={lang}
                                onClick={() => setEditorialLang(lang as any)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${editorialLang === lang ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                              >
                                {lang}
                              </button>
                            ))}
                          </div>
                        </div>
                        <pre className="p-3 bg-[#060911] rounded-lg border border-slate-900 text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed">
                          {editorialData.editorial.code[editorialLang] || "// Code not available for this language"}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-4 bg-[#0b0f19] rounded-lg border border-[#1e293b]">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-white text-sm font-mono">Official Editorial is Locked</h3>
                      <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                        The reference solution and complexity proofs unlock automatically when you achieve an <strong className="text-emerald-400">Accepted</strong> submission.
                      </p>
                    </div>

                    {!showGiveUpConfirm ? (
                      <button
                        onClick={() => setShowGiveUpConfirm(true)}
                        className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold transition-colors"
                      >
                        Give Up and View Editorial
                      </button>
                    ) : (
                      <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-lg space-y-2 text-left">
                        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Forfeit Rewards Confirmation</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Viewing the editorial before solving will forfeit coins and streak progress for this problem. You will not earn placement velocity bonuses.
                        </p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => fetchEditorial(true)}
                            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors"
                          >
                            Confirm & View Solution
                          </button>
                          <button
                            onClick={() => setShowGiveUpConfirm(false)}
                            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: My Approach */}
            {leftTab === 'approach' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>My Solution Approach</span>
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Write your reasoning and complexity bounds. This is saved with your submission.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInsertApproachTemplate}
                    className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-slate-700 text-teal-300 text-[11px] font-semibold transition-colors"
                  >
                    Load Template
                  </button>
                </div>

                <textarea
                  value={approachText}
                  onChange={(e) => setApproachText(e.target.value)}
                  placeholder="Explain your approach here (Markdown supported):&#10;&#10;1. What data structures did you pick and why?&#10;2. What is the time complexity (e.g. O(n)) and space complexity?&#10;3. What edge cases did you protect against?"
                  rows={12}
                  className="w-full bg-[#0b0f19] border border-[#1e293b] rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            )}

            {/* TAB 5: Submissions History */}
            {leftTab === 'submissions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-400" />
                    <span>Candidate Submission History</span>
                  </h2>
                  <span className="text-[11px] text-slate-500 font-mono">{pastSubmissions.length} records</span>
                </div>

                {pastSubmissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-[#0b0f19] rounded-lg border border-[#1e293b]">
                    No past submissions recorded for this problem yet.
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    {pastSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-lg bg-[#0b0f19] border border-[#1e293b] space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {sub.status}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(sub.submittedAt).toLocaleTimeString()} · {new Date(sub.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center gap-3">
                          <span>Lang: <span className="text-white">{sub.language}</span></span>
                          <span>Runtime: <span className="text-emerald-400">{sub.runtime}</span></span>
                          <span>Memory: <span className="text-slate-300">{sub.memory}</span></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col bg-[#0b0f19] overflow-hidden">
          
          {/* Top Half: Monaco Code Editor */}
          <div className="flex-1 relative border-b border-[#1e293b] min-h-[300px]">
            <Editor
              height="100%"
              language={language === 'cpp' ? 'cpp' : language === 'python' ? 'python' : language === 'java' ? 'java' : 'javascript'}
              theme="vs-dark"
              value={code}
              onChange={handleCodeChange}
              loading={
                <div className="flex flex-col items-center justify-center h-full text-slate-400 font-mono text-xs gap-2">
                  <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading Code Editor...</span>
                </div>
              }
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* Bottom Half: Execution Console & Test Results */}
          <div className="h-64 sm:h-72 bg-[#0f172a] flex flex-col">
            {/* Console Tab Header */}
            <div className="bg-[#0b0f19] border-b border-[#1e293b] px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveConsoleTab('tests')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeConsoleTab === 'tests' ? 'bg-[#1e293b] text-indigo-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Test Results
                </button>
                <button
                  onClick={() => setActiveConsoleTab('custom')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeConsoleTab === 'custom' ? 'bg-[#1e293b] text-cyan-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Custom Input
                </button>
                <button
                  onClick={() => setActiveConsoleTab('aiAudit')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    activeConsoleTab === 'aiAudit' ? 'bg-[#1e293b] text-indigo-400 border border-slate-700' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Complexity Audit
                </button>
              </div>

              <div className="text-[11px] text-slate-500 font-mono hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>SANDBOXED JUDGE</span>
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono space-y-3">
              {activeConsoleTab === 'tests' && (
                <div>
                  {/* Submit evaluation verdict banner */}
                  {submitMutation.isSuccess && (
                    <div className={`p-3.5 rounded-lg mb-3 space-y-2 ${
                      submitMutation.data.status === 'Accepted'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : submitMutation.data.status === 'Wrong Answer'
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                          : submitMutation.data.status === 'Compilation Error'
                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                            : 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
                    }`}>
                      <div className="font-bold flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-4 h-4 ${submitMutation.data.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`} />
                          <span className="text-sm">
                            {submitMutation.data.status} — {submitMutation.data.passedTestCases}/{submitMutation.data.totalTestCases} cases passed
                          </span>
                        </div>
                        {submitMutation.data.coinsAwarded > 0 && (
                          <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            +{submitMutation.data.coinsAwarded} Coins
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-4">
                        <span>Runtime: <span className="text-white">{submitMutation.data.runtime}</span></span>
                        <span>Memory: <span className="text-white">{submitMutation.data.memory}</span></span>
                        {submitMutation.data.isFirstSolve && (
                          <span className="text-emerald-400 font-bold">First Solve Verified</span>
                        )}
                      </div>

                      {/* First failing test case inspection */}
                      {submitMutation.data.firstFailingCase && (
                        <div className="mt-2 pt-2 border-t border-rose-500/20 space-y-1.5 text-xs font-mono">
                          <div className="text-rose-300 font-bold">
                            Failing Test Case #{submitMutation.data.firstFailingCase.testCaseIndex}:
                          </div>
                          <div className="p-2 bg-[#060911] rounded border border-rose-900/40 space-y-1">
                            <div><span className="text-slate-500">Input:</span> {JSON.stringify(submitMutation.data.firstFailingCase.input)}</div>
                            <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-400">{JSON.stringify(submitMutation.data.firstFailingCase.expectedOutput)}</span></div>
                            <div><span className="text-slate-500">Actual:</span> <span className="text-rose-400">{JSON.stringify(submitMutation.data.firstFailingCase.actualOutput)}</span></div>
                          </div>
                        </div>
                      )}

                      {/* Compilation or runtime error output */}
                      {submitMutation.data.compileOutput && (
                        <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs text-amber-300">
                          <div className="font-bold mb-1">Compiler Diagnostics:</div>
                          <pre className="p-2 bg-[#060911] rounded border border-amber-900/40 overflow-x-auto text-[11px] leading-relaxed">
                            {submitMutation.data.compileOutput}
                          </pre>
                        </div>
                      )}

                      {submitMutation.data.stderr && !submitMutation.data.firstFailingCase && (
                        <div className="mt-2 pt-2 border-t border-rose-500/20 text-xs text-rose-300">
                          <div className="font-bold mb-1">Execution Diagnostics:</div>
                          <pre className="p-2 bg-[#060911] rounded border border-rose-900/40 overflow-x-auto text-[11px] leading-relaxed">
                            {submitMutation.data.stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Run Results */}
                  {runMutation.data ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-slate-400 text-[11px] border-b border-slate-800 pb-2">
                        <span className={`font-bold ${runMutation.data.status === 'Accepted' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          Status: {runMutation.data.status}
                        </span>
                        <span>Latency: {runMutation.data.executionTime}</span>
                        <span>Memory: {runMutation.data.memoryAllocated}</span>
                      </div>

                      <div className="space-y-2">
                        {runMutation.data.testResults?.map((res: any, idx: number) => (
                          <div key={idx} className="p-2.5 rounded bg-[#0b0f19] border border-[#1e293b] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-300">Sample Case {res.testCaseNumber}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                res.passed === true
                                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                  : res.passed === false
                                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                    : 'text-slate-300 bg-slate-500/10 border-slate-500/20'
                              }`}>
                                {res.passed === true ? 'PASSED' : res.passed === false ? 'FAILED' : 'OUTPUT ONLY'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px]"><span className="text-slate-500">Input:</span> {res.input}</div>
                            <div className="text-slate-300 text-[11px]"><span className="text-slate-500">Output:</span> {res.actualOutput}</div>
                          </div>
                        ))}
                        {runMutation.data.stderr && (
                          <p role="status" className="text-rose-300 text-xs">{runMutation.data.stderr}</p>
                        )}
                        {runMutation.data.compileOutput && (
                          <p role="status" className="text-amber-300 text-xs">{runMutation.data.compileOutput}</p>
                        )}
                      </div>
                    </div>
                  ) : !submitMutation.data ? (
                    <div className="text-slate-500 text-center py-6">
                      Click <strong className="text-indigo-400">Run</strong> to test on sample input, or <strong className="text-indigo-400">Submit</strong> to evaluate against the hidden test suite.
                    </div>
                  ) : null}
                </div>
              )}

              {activeConsoleTab === 'custom' && (
                <div className="space-y-2">
                  <label htmlFor="custom-test-input" className="text-slate-400 text-[11px]">Custom Test Input (JSON format):</label>
                  <textarea
                    id="custom-test-input"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder='{"nums": [2, 7, 11, 15], "target": 9}'
                    className="w-full h-28 bg-[#0b0f19] border border-[#1e293b] rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[10px] text-slate-500">
                    When custom input is provided, clicking "Run" executes against this input instead of the default sample case.
                  </p>
                </div>
              )}

              {activeConsoleTab === 'aiAudit' && (
                <div>
                  {aiAuditMutation.isPending ? (
                    <div className="flex items-center gap-2 text-indigo-400 py-6">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Auditing time complexity invariants and edge case vulnerabilities...</span>
                    </div>
                  ) : aiAuditMutation.data ? (
                    <div className="whitespace-pre-line leading-relaxed text-slate-300 text-xs font-mono">
                      {aiAuditMutation.data.content}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-center py-6">
                      Click "Audit Code Complexity" to generate Big-O analysis and edge case alerts.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
