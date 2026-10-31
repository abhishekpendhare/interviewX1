import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Database, 
  Cpu, 
  Globe, 
  Code, 
  BrainCircuit, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Play, 
  RotateCcw, 
  RefreshCw, 
  Zap,
  Calculator,
  PieChart,
  TrendingUp,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Target,
  Hash,
  BarChart3,
  ArrowRight,
  Award,
  Check,
  Flame,
  BookOpen
} from 'lucide-react';
import { api } from '@/lib/api';
import type { SprintBenchmark, AptitudeTopic, AptitudeTelemetry } from '@/lib/types';

// Map icon string name to Lucide component
const TOPIC_ICON_MAP: Record<string, React.ElementType> = {
  Calculator,
  Clock,
  Zap,
  Hash,
  TrendingUp,
  Sparkles,
  PieChart,
  BrainCircuit
};

export default function FoundationsHub() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'modules' | 'aptitude' | 'sprints'>('aptitude');
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeRemainingSec, setTimeRemainingSec] = useState<number>(600);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [sprintResult, setSprintResult] = useState<any>(null);

  // Aptitude interactive workspace state
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [preLaunchTopic, setPreLaunchTopic] = useState<AptitudeTopic | null>(null);
  const [preLaunchCount, setPreLaunchCount] = useState<number>(3);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  // Queries
  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['sprints'],
    queryFn: api.getSprints
  });

  const { data: aptitudeTopics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['aptitudeTopics'],
    queryFn: api.getAptitudeTopics
  });

  const { data: aptitudeTelemetry } = useQuery<AptitudeTelemetry>({
    queryKey: ['aptitudeTelemetry'],
    queryFn: api.getAptitudeTelemetry
  });

  const { data: activeSprint, isLoading: activeSprintLoading } = useQuery({
    queryKey: ['sprintDetails', selectedSprintId],
    queryFn: () => selectedSprintId ? api.getSprintDetails(selectedSprintId) : null,
    enabled: !!selectedSprintId
  });

  // Countdown timer effect
  useEffect(() => {
    if (!timerActive || timeRemainingSec <= 0 || sprintResult) return;
    const interval = setInterval(() => {
      setTimeRemainingSec(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeRemainingSec, sprintResult]);

  // Submit Sprint / Session Mutation
  const submitSprintMutation = useMutation({
    mutationFn: () => {
      const answersArray = Object.entries(selectedAnswers).map(([qid, opt]) => ({
        questionId: qid,
        selectedOption: opt,
        timeSpentSec: 45
      }));
      return api.submitSprintAttempt(selectedSprintId!, answersArray);
    },
    onSuccess: (data) => {
      setSprintResult(data);
      setTimerActive(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['aptitudeTelemetry'] });
    }
  });

  const handleStartSprint = (sprintId: string, durationMins: number = 15) => {
    setSelectedSprintId(sprintId);
    setSelectedAnswers({});
    setSprintResult(null);
    setTimeRemainingSec(durationMins * 60);
    setTimerActive(true);
    setOpenHints({});
  };

  const handleLaunchAptitudeSession = async (topicTitle?: string, difficulty?: string, limit: number = 3) => {
    setIsStartingSession(true);
    try {
      const session = await api.createAptitudeSession({
        topic: topicTitle,
        difficulty: difficulty !== 'All' ? difficulty : undefined,
        limit,
        title: topicTitle 
          ? `Aptitude Practice: ${topicTitle} (${difficulty || 'All Levels'})` 
          : `Mixed Quantitative & Logic Diagnostic Sprint`
      });

      await queryClient.invalidateQueries({ queryKey: ['sprintDetails', session.id] });
      setPreLaunchTopic(null);
      handleStartSprint(session.id, session.durationMinutes || 10);
    } catch (err) {
      console.error('Failed to create aptitude practice session:', err);
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleRetryMissedQuestions = async () => {
    if (!sprintResult || !sprintResult.answers) return;
    const missedIds = sprintResult.answers
      .filter((a: any) => !a.isCorrect)
      .map((a: any) => a.questionId);

    if (missedIds.length === 0) return;

    setIsStartingSession(true);
    try {
      const session = await api.createAptitudeSession({
        questionIds: missedIds,
        title: `Targeted Review: Missed Questions (${missedIds.length})`
      });

      await queryClient.invalidateQueries({ queryKey: ['sprintDetails', session.id] });
      handleStartSprint(session.id, session.durationMinutes || Math.max(5, missedIds.length * 2));
    } catch (err) {
      console.error('Failed to create retry session:', err);
    } finally {
      setIsStartingSession(false);
    }
  };

  const toggleHint = (qid: string) => {
    setOpenHints(prev => ({ ...prev, [qid]: !prev[qid] }));
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const coreModules = [
    {
      id: 'dbms',
      title: 'Database Management Systems',
      icon: Database,
      badge: 'HIGH FREQUENCY',
      gradient: 'from-emerald-500/20 to-teal-500/10',
      borderGlow: 'hover:border-emerald-500/40',
      badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      concepts: [
        { name: 'B+ Tree Indexing Internals', desc: 'Leaf node linked list traversal and internal node fan-out minimizing disk I/O.' },
        { name: 'BCNF vs 3NF Normalization', desc: 'Strict determinant superkey rule in BCNF vs prime attribute allowance in 3NF.' },
        { name: 'Transaction Isolation & Phantom Reads', desc: 'Serializable gap locks vs Repeatable Read row locking mechanisms.' },
        { name: 'SQL Window Functions (DENSE_RANK)', desc: 'Unbroken ranking sequences over partitions in enterprise SQL queries.' }
      ]
    },
    {
      id: 'os',
      title: 'Operating Systems & Kernel Core',
      icon: Cpu,
      badge: 'SYSTEMS SDE',
      gradient: 'from-cyan-500/20 to-blue-500/10',
      borderGlow: 'hover:border-cyan-500/40',
      badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
      concepts: [
        { name: 'Virtual Memory & Thrashing Mitigation', desc: 'Working-set model and degree of multiprogramming reduction.' },
        { name: 'Process vs Thread Context Switching', desc: 'TLB cache flushing on process switch vs preserved address space on thread switch.' },
        { name: 'Coffman Deadlock Conditions', desc: 'Mutual exclusion, hold and wait, no preemption, and circular wait invariants.' },
        { name: 'Mutex vs Binary Semaphore', desc: 'Ownership semantics in mutexes vs signaling primitives in semaphores.' }
      ]
    },
    {
      id: 'networks',
      title: 'Computer Networks & Concurrency',
      icon: Globe,
      badge: 'INTERVIEW ESSENTIAL',
      gradient: 'from-amber-500/20 to-orange-500/10',
      borderGlow: 'hover:border-amber-500/40',
      badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      concepts: [
        { name: 'TCP TIME_WAIT (2*MSL) Drain State', desc: 'Ensuring final ACK delivery and preventing stale duplicate packet collisions.' },
        { name: 'HTTP/3 QUIC over UDP', desc: 'Elimination of transport-layer Head-of-Line (HoL) blocking across streams.' },
        { name: 'TLS 1.3 Handshake Protocol', desc: '1-RTT cryptographic key exchange via Elliptic Curve Diffie-Hellman.' }
      ]
    },
    {
      id: 'lld',
      title: 'Object-Oriented Design & SOLID',
      icon: Code,
      badge: 'DAY-0 LLD',
      gradient: 'from-violet-500/20 to-purple-500/10',
      borderGlow: 'hover:border-violet-500/40',
      badgeColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
      concepts: [
        { name: 'Liskov Substitution Principle (LSP)', desc: 'Rectangle vs Square subtype invariant preservation.' },
        { name: 'Dependency Inversion Principle (DIP)', desc: 'High-level modules depending on abstractions rather than low-level concretions.' },
        { name: 'Strategy & Observer Patterns', desc: 'Runtime behavioral composition and decoupled publisher-subscriber events.' }
      ]
    },
    {
      id: 'system-design',
      title: 'System Design Fundamentals',
      icon: Layers,
      badge: 'STAFF ARCHITECTURE',
      gradient: 'from-rose-500/20 to-pink-500/10',
      borderGlow: 'hover:border-rose-500/40',
      badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
      concepts: [
        { name: 'PACELC Theorem Trade-offs', desc: 'Latency vs Consistency in normal operation vs Partition Availability.' },
        { name: 'Cache Invalidation (Cache-Aside vs Write-Through)', desc: 'Deleting cache keys on DB updates to eliminate race-condition stale states.' },
        { name: 'Consistent Hashing & Virtual Nodes', desc: 'Minimizing key remapping on node cluster scale up and scale down.' }
      ]
    },
    {
      id: 'aptitude',
      title: 'Quantitative & Analytical Aptitude',
      icon: BrainCircuit,
      badge: 'SCREENING GATEWAY // 8 DOMAINS',
      gradient: 'from-[#2DD4D0]/20 via-[#6D5CFF]/15 to-transparent',
      borderGlow: 'border-[#2DD4D0]/40 shadow-[0_0_30px_rgba(45,212,208,0.12)]',
      badgeColor: 'text-[#2DD4D0] border-[#2DD4D0]/40 bg-[#2DD4D0]/10',
      concepts: [
        { name: 'Arithmetic & Dynamic Rate Invariants', desc: 'Percentages, partnerships, work-pipe fractions, and relative speed vectors.' },
        { name: 'Number Cycles & Permutation Models', desc: 'Cyclicity of remainders, modular arithmetic, and restricted arrangements.' },
        { name: 'Data Interpretation & Syllogism Logic', desc: 'Tabular CAGR growth metrics, pie chart ratios, and deductive Venn validity.' }
      ]
    }
  ];

  return (
    <main className="relative min-h-screen bg-[#0B1020] text-slate-100 px-4 sm:px-6 lg:px-8 pt-8 pb-32 overflow-hidden">
      {/* Cinematic Ambient Background Glow Orbs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#6D5CFF]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 rounded-full bg-[#2DD4D0]/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#2DD4D0]/10 via-[#6D5CFF]/10 to-transparent border border-[#2DD4D0]/30 text-xs font-semibold text-[#2DD4D0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INTERVIEWX FOUNDATIONS // APTITUDE & CS CORE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
              Engineering Foundations & Aptitude Studio
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              Master the core technical disciplines tested in technical screening loops: Quantitative Reasoning, CS Core Systems, and Timed Assessment Sprints.
            </p>
          </div>

          {/* Glassmorphic Pill Tab Switcher */}
          {!selectedSprintId && (
            <div className="inline-flex items-center bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-2xl shrink-0 self-start md:self-auto">
              <button
                onClick={() => { setActiveTab('aptitude'); setSelectedSprintId(null); }}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'aptitude'
                    ? 'text-white shadow-[0_0_20px_rgba(45,212,208,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === 'aptitude' && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2DD4D0] to-[#4A72FF] -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <BrainCircuit className="w-4 h-4" />
                <span className={activeTab === 'aptitude' ? 'text-slate-950 font-bold' : ''}>Aptitude Studio</span>
              </button>

              <button
                onClick={() => { setActiveTab('modules'); setSelectedSprintId(null); }}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'modules'
                    ? 'text-white shadow-[0_0_20px_rgba(109,92,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === 'modules' && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6D5CFF] to-[#4A72FF] -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Layers className="w-4 h-4" />
                <span>CS Core Modules</span>
              </button>

              <button
                onClick={() => { setActiveTab('sprints'); setSelectedSprintId(null); }}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  activeTab === 'sprints'
                    ? 'text-white shadow-[0_0_20px_rgba(109,92,255,0.3)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {activeTab === 'sprints' && (
                  <motion.div
                    layoutId="activeTabBadge"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6D5CFF] to-[#4A72FF] -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Clock className="w-4 h-4" />
                <span>Sprint Benchmarks</span>
              </button>
            </div>
          )}
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            MODE 1: Quantitative & Aptitude Practice Studio (Default / Hero)
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'aptitude' && !selectedSprintId && (
          <div className="space-y-8">
            {/* Live Telemetry Bento Strip */}
            <div className="bg-[#10172D]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2DD4D0]/20 to-[#6D5CFF]/20 border border-[#2DD4D0]/40 flex items-center justify-center text-[#2DD4D0] shadow-[0_0_20px_rgba(45,212,208,0.2)]">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight font-heading">
                      Candidate Quantitative Telemetry
                    </h2>
                    <p className="text-xs text-slate-400">
                      Grounded strictly in verified assessment attempts & speed benchmarks.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleLaunchAptitudeSession(undefined, 'All', 5)}
                  disabled={isStartingSession}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2DD4D0] to-[#6D5CFF] hover:opacity-95 text-slate-950 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(45,212,208,0.25)] cursor-pointer disabled:opacity-50"
                >
                  {isStartingSession ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-slate-950" />}
                  <span>Launch Mixed 8-Domain Diagnostic</span>
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Attempts</p>
                  <p className="text-2xl font-extrabold text-white">
                    {aptitudeTelemetry?.totalAttempts || 0}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">sessions</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Questions Answered</p>
                  <p className="text-2xl font-extrabold text-[#2DD4D0]">
                    {aptitudeTelemetry?.totalQuestions || 0}
                    <span className="text-xs font-normal text-slate-400 ml-1.5">
                      ({aptitudeTelemetry?.totalCorrect || 0} correct)
                    </span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Overall Accuracy</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl font-extrabold ${
                      (aptitudeTelemetry?.accuracyPct || 0) >= 70 ? 'text-emerald-400' :
                      (aptitudeTelemetry?.accuracyPct || 0) >= 50 ? 'text-amber-400' : 'text-slate-300'
                    }`}>
                      {aptitudeTelemetry?.hasData ? `${aptitudeTelemetry.accuracyPct}%` : '—'}
                    </p>
                    {aptitudeTelemetry?.hasData && (
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        (aptitudeTelemetry.accuracyPct || 0) >= 70 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {(aptitudeTelemetry.accuracyPct || 0) >= 70 ? 'Benchmark Met' : 'Calibrating'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Average Pace</p>
                  <p className="text-2xl font-extrabold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{aptitudeTelemetry?.averageTimePerQuestionSec ? `${aptitudeTelemetry.averageTimePerQuestionSec}s` : '—'}</span>
                    <span className="text-xs font-normal text-slate-400">/ q</span>
                  </p>
                </div>
              </div>

              {!aptitudeTelemetry?.hasData && (
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/15 text-xs text-slate-400 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#2DD4D0]/10 border border-[#2DD4D0]/30 flex items-center justify-center text-[#2DD4D0] shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span>
                    No verified aptitude attempts recorded yet. Launch a topic practice session or mixed diagnostic below to establish your initial quantitative velocity baseline.
                  </span>
                </div>
              )}
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-heading">
                  <Target className="w-4 h-4 text-[#2DD4D0]" />
                  <span>Curated Syllabus Modules (8 Core Domains)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose any domain to configure personalized practice or filter by target difficulty.
                </p>
              </div>

              {/* Difficulty Segmented Filter */}
              <div className="inline-flex items-center bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-lg text-xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 px-2.5 font-bold">Difficulty:</span>
                {(['All', 'Easy', 'Medium', 'Hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedDifficulty === diff
                        ? 'bg-[#2DD4D0]/20 text-[#2DD4D0] border border-[#2DD4D0]/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* 8-Domain Interactive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {aptitudeTopics.map((topic, idx) => {
                const IconComponent = TOPIC_ICON_MAP[topic.icon] || Calculator;
                const title = topic.title || topic.name || 'Topic';
                const topicStat = aptitudeTelemetry?.topicStats?.[title];

                return (
                  <div
                    key={topic.id}
                    className="group bg-[#10172D]/80 backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-3xl p-6 shadow-xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Icon + Question Count Badge */}
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: `${topic.color}15`,
                            borderColor: `${topic.color}40`,
                            color: topic.color
                          }}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 font-semibold">
                          {topic.questionCount} Questions
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#2DD4D0] transition-colors tracking-tight font-heading">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {topic.description}
                        </p>
                      </div>

                      {/* Subtopic Pills */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {topic.subtopics.slice(0, 3).map((sub, sIdx) => (
                          <span 
                            key={sIdx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-300"
                          >
                            {sub}
                          </span>
                        ))}
                        {topic.subtopics.length > 3 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-slate-400">
                            +{topic.subtopics.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Telemetry Progress if practiced */}
                      {topicStat && topicStat.total > 0 && (
                        <div className="text-xs text-slate-400 pt-3 border-t border-white/10 flex items-center justify-between font-mono">
                          <span>Practiced: {topicStat.total} q</span>
                          <span className="text-[#2DD4D0] font-bold">
                            {Math.round((topicStat.correct / topicStat.total) * 100)}% Acc
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="pt-5 border-t border-white/10 mt-4">
                      <button
                        onClick={() => {
                          setPreLaunchTopic(topic);
                          setPreLaunchCount(Math.min(3, topic.questionCount));
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#2DD4D0]/15 border border-white/10 hover:border-[#2DD4D0]/50 text-slate-200 hover:text-[#2DD4D0] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Configure Practice</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pre-Launch Configuration Modal */}
            <AnimatePresence>
              {preLaunchTopic && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.2 }}
                    className="bg-[#10172D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#2DD4D0]/10 blur-[80px] pointer-events-none" />

                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#2DD4D0] font-bold block">
                          [ PRACTICE WORKSPACE PREVIEW ]
                        </span>
                        <h3 className="text-xl font-bold text-white mt-1 font-heading">
                          {preLaunchTopic.title || preLaunchTopic.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => setPreLaunchTopic(null)}
                        className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                      {preLaunchTopic.description}
                    </p>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Difficulty</span>
                        <div className="text-sm font-bold text-[#2DD4D0]">{selectedDifficulty}</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Batch Size</span>
                        <div className="text-sm font-bold text-white">{preLaunchCount} Questions</div>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase">Target Timer</span>
                        <div className="text-sm font-bold text-amber-400">{Math.max(5, preLaunchCount * 2)} Mins</div>
                      </div>
                    </div>

                    {/* Batch Size Selector */}
                    <fieldset className="space-y-2">
                      <legend className="text-xs font-semibold text-slate-300 block">
                        Select Question Batch Size:
                      </legend>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(cnt => (
                          <button
                            key={cnt}
                            type="button"
                            onClick={() => setPreLaunchCount(cnt)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              preLaunchCount === cnt
                                ? 'bg-gradient-to-r from-[#2DD4D0]/20 to-[#6D5CFF]/20 border-[#2DD4D0]/60 text-white shadow-md'
                                : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {cnt} Question{cnt > 1 ? 's' : ''}
                          </button>
                        ))}
                      </div>
                    </fieldset>

                    <div className="p-4 rounded-2xl bg-[#2DD4D0]/5 border border-[#2DD4D0]/20 space-y-1 text-xs text-slate-300">
                      <div className="font-bold text-[#2DD4D0] flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5" />
                        <span>Practice Evaluation Rules:</span>
                      </div>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] pt-1">
                        <li>+10 Marks for each mathematically correct answer</li>
                        <li>No negative marks; accuracy & pacing benchmarks recorded</li>
                        <li>Comprehensive derivations provided on submission with retry options</li>
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => setPreLaunchTopic(null)}
                        className="flex-1 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleLaunchAptitudeSession(preLaunchTopic.title || preLaunchTopic.name, selectedDifficulty, preLaunchCount)}
                        disabled={isStartingSession}
                        className="flex-[2] py-3 px-6 rounded-xl bg-gradient-to-r from-[#2DD4D0] to-[#6D5CFF] hover:opacity-95 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(45,212,208,0.3)] cursor-pointer disabled:opacity-50"
                      >
                        {isStartingSession ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-slate-950" />}
                        <span>Start Practice Session</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE 2: Core CS Modules Deep Dive
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'modules' && !selectedSprintId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreModules.map(mod => {
              const IconComponent = mod.icon;
              const isAptitudeModule = mod.id === 'aptitude';

              return (
                <div
                  key={mod.id}
                  className={`bg-[#10172D]/80 backdrop-blur-xl border ${
                    isAptitudeModule 
                      ? 'border-[#2DD4D0]/50 shadow-[0_0_30px_rgba(45,212,208,0.1)]' 
                      : 'border-white/10 hover:border-white/20'
                  } rounded-3xl p-6 sm:p-7 shadow-xl transition-all duration-300 flex flex-col justify-between group`}
                >
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-200 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold border ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight font-heading">
                        {mod.title}
                      </h3>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-white/10">
                      {mod.concepts.map((concept, cIdx) => (
                        <div key={cIdx} className="space-y-0.5">
                          <div className="text-xs font-semibold text-slate-200">{concept.name}</div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">{concept.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mt-5">
                    {isAptitudeModule ? (
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => setActiveTab('aptitude')}
                          className="py-2.5 px-3 rounded-xl bg-[#2DD4D0]/10 hover:bg-[#2DD4D0]/20 border border-[#2DD4D0]/40 text-[#2DD4D0] text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>Open Studio</span>
                        </button>
                        <button
                          onClick={() => {
                            const aptiSprint = sprints.find(s => s.id === 'sprint-aptitude-core') || sprints.find(s => s.subject.toLowerCase().includes('aptitude'));
                            if (aptiSprint) handleStartSprint(aptiSprint.id, aptiSprint.durationMinutes);
                            else setActiveTab('aptitude');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6D5CFF] to-[#4A72FF] hover:opacity-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Diagnostic</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          const sprint = sprints.find(s => s.subject.toLowerCase().includes(mod.id) || s.topic.toLowerCase().includes(mod.id)) || sprints[0];
                          if (sprint) handleStartSprint(sprint.id, sprint.durationMinutes);
                        }}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 text-[#2DD4D0]" />
                        <span>Launch Topic Sprint</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE 3: Assessment Sprints Catalog
           ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sprints' && !selectedSprintId && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight font-heading">
                  All Timed Assessment Sprints
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full catalog of timed evaluation benchmarks covering CS systems and quantitative speed rounds.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">{sprints.length} Total Sprints</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sprints.map(s => {
                const isAptitude = s.subject.toLowerCase().includes('aptitude') || s.topic.toLowerCase().includes('aptitude');
                return (
                  <div
                    key={s.id}
                    className={`bg-[#10172D]/80 backdrop-blur-xl border ${
                      isAptitude ? 'border-[#2DD4D0]/30 hover:border-[#2DD4D0]/60' : 'border-white/10 hover:border-white/20'
                    } rounded-3xl p-6 shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base font-bold text-white font-heading">{s.title}</span>
                        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                          isAptitude 
                            ? 'bg-[#2DD4D0]/10 border-[#2DD4D0]/40 text-[#2DD4D0]' 
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {s.tierLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{s.topic}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
                      <span>⏱️ {s.durationMinutes} mins • {s.questionCount} Questions</span>
                      <button
                        onClick={() => handleStartSprint(s.id, s.durationMinutes)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAptitude 
                            ? 'bg-gradient-to-r from-[#2DD4D0] to-[#6D5CFF] text-slate-950 hover:opacity-95 shadow-[0_0_15px_rgba(45,212,208,0.25)]' 
                            : 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 hover:opacity-95 shadow-md'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Assessment</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            MODE 4: In-Session Practice Runner & Post-Submission Review
           ═══════════════════════════════════════════════════════════════════ */}
        {selectedSprintId && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Active Session Top Bar */}
            <div className="bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2DD4D0]/10 border border-[#2DD4D0]/30 text-[11px] font-mono font-bold text-[#2DD4D0]">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4D0] animate-pulse" />
                    LIVE SESSION
                  </span>
                  <span className="text-slate-500 text-xs">•</span>
                  <span className="text-xs font-mono text-slate-400">{activeSprint?.subject || 'Quantitative Aptitude'}</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 font-heading">{activeSprint?.title}</h2>
              </div>

              <div className="flex items-center gap-3">
                {/* Countdown Timer with Alert Glow */}
                <div className={`px-4 py-2 rounded-2xl border text-sm font-mono font-bold flex items-center gap-2 shadow-inner ${
                  timeRemainingSec < 120 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse' 
                    : 'bg-white/[0.04] border-white/10 text-white'
                }`}>
                  <Clock className="w-4 h-4 text-[#2DD4D0]" />
                  <span>{formatTimer(timeRemainingSec)}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedSprintId(null);
                    setSprintResult(null);
                  }}
                  className="px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Exit Session
                </button>
              </div>
            </div>

            {/* Sub-View: Results Screen vs Taking Form */}
            {sprintResult ? (
              /* Evaluation Report Screen */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#10172D]/90 backdrop-blur-xl border border-[#2DD4D0]/40 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#2DD4D0]/10 blur-[100px] pointer-events-none" />

                <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#2DD4D0] uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-[#2DD4D0]" />
                      <span>SESSION EVALUATION & STEP-BY-STEP REVIEW</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-heading">
                      Score: <span className="text-[#2DD4D0]">{sprintResult.score}</span> / {sprintResult.totalQuestions * 10}
                      <span className="text-slate-400 text-base font-normal ml-3">
                        ({sprintResult.accuracyPct}% Accuracy)
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 mt-3">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                        {sprintResult.correctCount} Correct
                      </span>
                      <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
                        {sprintResult.incorrectCount} Incorrect
                      </span>
                      {sprintResult.skippedCount > 0 && (
                        <span className="px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-400 font-bold">
                          {sprintResult.skippedCount} Skipped
                        </span>
                      )}
                      <span>⏱️ Avg Pace: {sprintResult.avgTimePerQ}s / question</span>
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    {sprintResult.incorrectCount + sprintResult.skippedCount > 0 && (
                      <button
                        onClick={handleRetryMissedQuestions}
                        disabled={isStartingSession}
                        className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] cursor-pointer disabled:opacity-50"
                      >
                        {isStartingSession ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                        <span>Retry Missed ({sprintResult.incorrectCount + sprintResult.skippedCount})</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedSprintId(null);
                        setSprintResult(null);
                        setActiveTab('aptitude');
                      }}
                      className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      Return to Studio
                    </button>
                  </div>
                </div>

                {/* Step-by-Step Question Breakdown */}
                <div className="space-y-6">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-heading">
                    <BrainCircuit className="w-4 h-4 text-[#2DD4D0]" />
                    <span>Detailed Mathematical & Deductive Breakdown</span>
                  </h4>

                  {sprintResult.answers?.map((ans: any, idx: number) => {
                    const isCorrect = ans.isCorrect;
                    const isSkipped = ans.isSkipped;
                    return (
                      <div
                        key={idx}
                        className={`p-6 rounded-3xl border text-sm space-y-4 bg-white/[0.02] ${
                          isCorrect 
                            ? 'border-emerald-500/30' 
                            : 'border-rose-500/30'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">
                              Q{idx + 1}: {ans.title}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">[{ans.topic} • {ans.difficulty}]</span>
                          </div>

                          <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold self-start sm:self-auto ${
                            isCorrect 
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
                              : isSkipped
                              ? 'text-slate-400 bg-slate-500/10 border border-slate-500/30'
                              : 'text-rose-400 bg-rose-500/10 border border-rose-500/30'
                          }`}>
                            {isCorrect ? '✓ CORRECT' : isSkipped ? '⚪ SKIPPED' : '✗ INCORRECT'}
                          </span>
                        </div>

                        {/* Selected vs Correct Key */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Your Selection:</span>
                            <span className={`text-sm font-semibold mt-1 block ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {ans.selectedOption !== null && ans.selectedOption !== undefined && ans.selectedOption >= 0
                                ? `Option ${String.fromCharCode(65 + ans.selectedOption)}`
                                : 'None (Skipped)'}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/30">
                            <span className="text-[10px] text-emerald-400 uppercase font-bold block">Correct Answer Key:</span>
                            <span className="text-sm font-semibold text-emerald-300 mt-1 block">
                              Option {String.fromCharCode(65 + ans.correctAnswerIndex)}
                            </span>
                          </div>
                        </div>

                        {/* Mathematical Step-by-Step Derivation */}
                        <div className="bg-[#0B1020]/90 p-5 rounded-2xl border border-white/10 space-y-2">
                          <div className="flex items-center gap-2 text-[#2DD4D0] font-bold text-xs font-heading">
                            <Calculator className="w-4 h-4" />
                            <span>Step-by-Step Mathematical Derivation:</span>
                          </div>
                          <div className="whitespace-pre-line text-slate-300 text-xs sm:text-sm font-sans leading-relaxed pt-1">
                            {ans.explanation}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Footer Return Actions */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setSelectedSprintId(null);
                      setSprintResult(null);
                      setActiveTab('aptitude');
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2DD4D0] to-[#6D5CFF] hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                  >
                    Return to Aptitude Studio
                  </button>

                  {sprintResult.incorrectCount + sprintResult.skippedCount > 0 && (
                    <button
                      onClick={handleRetryMissedQuestions}
                      disabled={isStartingSession}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-md"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry {sprintResult.incorrectCount + sprintResult.skippedCount} Missed Questions</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* Question Taking Form */
              <div className="space-y-6">
                {activeSprint?.questions?.map((q, idx) => {
                  const isHintOpen = openHints[q.id];
                  return (
                    <div
                      key={q.id}
                      className="bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl relative overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-bold text-[#2DD4D0]">
                            QUESTION {idx + 1} OF {activeSprint.questions?.length}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">[{q.topic} • {q.subtopic}]</span>
                        </div>

                        <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold border self-start sm:self-auto ${
                          q.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                          q.difficulty === 'Medium' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
                          'text-rose-400 border-rose-500/30 bg-rose-500/10'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug font-heading">
                        {q.title}
                      </h3>

                      <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                        {q.description}
                      </div>

                      {/* Strategic Hint Accordion */}
                      {q.hints && q.hints.length > 0 && (
                        <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                          <button
                            type="button"
                            onClick={() => toggleHint(q.id)}
                            className="w-full px-4 py-2.5 hover:bg-white/[0.04] text-slate-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2 text-amber-400">
                              <HelpCircle className="w-4 h-4" />
                              <span>Strategic Hint ({isHintOpen ? 'Hide' : 'Reveal'})</span>
                            </span>
                            {isHintOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          {isHintOpen && (
                            <div className="p-4 bg-amber-500/5 text-xs text-slate-300 border-t border-white/10 space-y-1.5">
                              {q.hints.map((hint, hIdx) => (
                                <div key={hIdx} className="flex items-start gap-2">
                                  <span className="text-amber-400 font-bold">•</span>
                                  <span className="leading-relaxed">{hint}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Multiple Choice Options */}
                      <div className="space-y-3 pt-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => setSelectedAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                              className={`w-full text-left p-4 rounded-2xl text-xs sm:text-sm transition-all flex items-start gap-3.5 border cursor-pointer ${
                                isSelected
                                  ? 'bg-gradient-to-r from-[#2DD4D0]/15 to-[#6D5CFF]/15 border-[#2DD4D0]/60 text-white shadow-[0_0_20px_rgba(45,212,208,0.2)] font-medium'
                                  : 'bg-white/[0.02] border-white/10 text-slate-300 hover:bg-white/[0.05] hover:border-white/20'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                                isSelected 
                                  ? 'bg-[#2DD4D0] text-slate-950 shadow-sm' 
                                  : 'bg-white/[0.06] border border-white/10 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-relaxed pt-0.5">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Big Gradient Submit Button */}
                <button
                  onClick={() => submitSprintMutation.mutate()}
                  disabled={submitSprintMutation.isPending}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2DD4D0] via-[#6D5CFF] to-[#4A72FF] hover:opacity-95 text-slate-950 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-[0_0_30px_rgba(45,212,208,0.3)] cursor-pointer disabled:opacity-50"
                >
                  {submitSprintMutation.isPending ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  <span>Submit Session & Compute Placement Telemetry</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
