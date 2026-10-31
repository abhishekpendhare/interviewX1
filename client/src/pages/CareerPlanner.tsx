import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Building2, 
  Globe2, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  BookOpen, 
  Award, 
  Code2, 
  BrainCircuit, 
  Layers, 
  Check, 
  AlertCircle,
  Sliders,
  Send,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Info
} from 'lucide-react';
import { PageLoader } from '@/components/ui/PageLoader';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

// ─── Step Options Definition ──────────────────────────────────────────

const TARGET_ROLES = [
  { id: 'backend', title: 'Backend Engineer', subtitle: 'Distributed services, databases, caching, concurrency & APIs', icon: Code2 },
  { id: 'fullstack', title: 'Full-Stack Engineer', subtitle: 'End-to-end web apps, React/Node, DB modeling & shipping', icon: Layers },
  { id: 'frontend', title: 'Frontend Engineer', subtitle: 'Modern UI/UX, state management, CSS performance & browser APIs', icon: Sliders },
  { id: 'data_ml', title: 'ML / Data Engineer', subtitle: 'Data pipelines, Spark, SQL, model deployment & inference', icon: BrainCircuit },
  { id: 'devops', title: 'DevOps / SRE', subtitle: 'CI/CD, Docker/K8s, Linux systems, cloud infrastructure & telemetry', icon: Award }
];

const COMPANY_TYPES = [
  { id: 'big_tech', title: 'FAANG / Big Tech', subtitle: 'Google, Microsoft, Amazon, Meta (High algorithmic DSA bar)', tag: 'Tier-1' },
  { id: 'startup', title: 'High-Growth Startup', subtitle: 'Seed to Series B (0-to-1 building, practical take-home & MVP velocity)', tag: 'Fast-Track' },
  { id: 'product', title: 'Product Company', subtitle: 'Mid-sized tech firms (balanced DSA, LLD and system design)', tag: 'Core SDE' },
  { id: 'it_services', title: 'IT Services / Prime', subtitle: 'TCS Prime, Infosys Specialist, Accenture (Speed aptitude & core CS)', tag: 'High-Volume' },
  { id: 'gcc', title: 'Global Capability Center (GCC)', subtitle: 'Enterprise multinational tech headquarters in India (12-24 LPA)', tag: 'Enterprise' },
  { id: 'higher_studies', title: 'Higher Studies / R&D', subtitle: 'Master’s / PhD preparation, research depth and core theory', tag: 'Deep-Tech' }
];

const POPULAR_COMPANIES = [
  { id: '', label: 'None / General Archetype' },
  { id: 'microsoft', label: 'Microsoft' },
  { id: 'google', label: 'Google' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'tcs', label: 'TCS (Prime / Digital)' },
  { id: 'infosys', label: 'Infosys (Specialist / DSE)' }
];

const REGIONS = [
  { id: 'india', title: 'India', subtitle: 'Bengaluru, Hyderabad, NCR, Pune tech corridors' },
  { id: 'europe', title: 'Europe', subtitle: 'Germany, Netherlands, UK (EU Blue Card, visa sponsorship)' },
  { id: 'us', title: 'USA', subtitle: 'Silicon Valley, Seattle, NYC (H1B/F1 or local)' },
  { id: 'remote', title: 'Remote / Global', subtitle: 'Global remote-first engineering teams' }
];

const EUROPE_COUNTRIES = ['Germany', 'Netherlands', 'United Kingdom', 'Sweden', 'Ireland'];

const SKILLS_LIST = [
  'DSA',
  'System Design',
  'OS',
  'Networks',
  'DBMS',
  'OOP',
  'Git',
  'REST APIs',
  'Cloud',
  'Docker/K8s',
  'ML Basics',
  'Projects',
  'Competitive Programming',
  'Communication'
];

interface RoadmapStats {
  phases: number;
  modules: number;
  totalHours: number;
  budgetHours: number;
  problems: number;
  interviews: number;
  hoursByArea?: Record<string, number>;
}

interface RoadmapPhase {
  phaseNumber: number;
  name: string;
  timing: string;
  color: string;
  focus: string;
  milestone?: string;
  tasks: string[];
  resources: string[];
}

interface DeprioritizedModule {
  id: string;
  title: string;
  skillArea: string;
  reason: string;
}

interface RoadmapData {
  id: string;
  goalHash: string;
  title: string;
  summary: string;
  stats: RoadmapStats;
  phases: RoadmapPhase[];
  deprioritized?: DeprioritizedModule[];
  sources?: Array<{ name?: string; title?: string; url: string; date?: string; confidence?: string }>;
  lastVerifiedDate?: string;
  confidenceLevel?: string;
  legalDisclaimer?: string;
  inputs: {
    targetType: string;
    company: string;
    role: string;
    region: string;
    country?: string;
    timelineMonths: number;
    hoursPerWeek: number;
    currentLevel: string;
    skills: string[];
  };
}

interface RoadmapRecord {
  id: string;
  studentId: string;
  version?: number;
  updatedAt: string;
  roadmap: RoadmapData;
  inputs: RoadmapData['inputs'];
  diff?: {
    moduleDiffShare: number;
    hoursReallocatedShare: number;
    phasesDiffer: boolean;
    milestonesDiffer: boolean;
    planATitle: string;
    planBTitle: string;
  };
}

export default function CareerPlanner() {
  const { user } = useAuth();

  // Step state (1 to 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [parsingGoal, setParsingGoal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Natural Language free-text input
  const [freeTextGoal, setFreeTextGoal] = useState<string>('');

  // Form selections
  const [targetRole, setTargetRole] = useState<string>('backend');
  const [companyType, setCompanyType] = useState<string>('big_tech');
  const [company, setCompany] = useState<string>('');
  const [region, setRegion] = useState<string>('india');
  const [country, setCountry] = useState<string>('India');
  const [timelineMonths, setTimelineMonths] = useState<number>(6);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(12);
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['DSA', 'DBMS', 'OOP', 'REST APIs', 'Git']);

  // Saved Roadmap state
  const [savedRecord, setSavedRecord] = useState<RoadmapRecord | null>(null);
  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [showDeprioritized, setShowDeprioritized] = useState<boolean>(false);

  // 1. Fetch existing saved roadmap on load
  useEffect(() => {
    fetch('/api/planner', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data && data.roadmapRecord) {
          setSavedRecord(data.roadmapRecord);
          // Restore selections if present
          if (data.roadmapRecord.inputs) {
            const inp = data.roadmapRecord.inputs;
            if (inp.role) setTargetRole(inp.role);
            if (inp.targetType) setCompanyType(inp.targetType);
            if (inp.company) setCompany(inp.company);
            if (inp.region) setRegion(inp.region);
            if (inp.country) setCountry(inp.country);
            if (inp.timelineMonths) setTimelineMonths(inp.timelineMonths);
            if (inp.hoursPerWeek) setHoursPerWeek(inp.hoursPerWeek);
            if (inp.currentLevel) setCurrentLevel(inp.currentLevel as any);
            if (inp.skills) setSelectedSkills(inp.skills);
          }
        }
      })
      .catch(err => console.error("Could not load existing roadmap:", err))
      .finally(() => setLoadingInitial(false));
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const togglePhaseAccordion = (idx: number) => {
    setExpandedPhases(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Free-text goal parsing via NLP endpoint
  const handleParseFreeText = async () => {
    if (!freeTextGoal.trim()) return;
    setParsingGoal(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/planner/parse-goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: freeTextGoal })
      });
      const data = await res.json();
      if (res.ok && data.goal) {
        const g = data.goal;
        if (g.role) setTargetRole(g.role);
        if (g.targetType) setCompanyType(g.targetType);
        if (g.company !== undefined) setCompany(g.company);
        if (g.region) setRegion(g.region);
        if (g.country) setCountry(g.country);
        if (g.timelineMonths) setTimelineMonths(g.timelineMonths);
        if (g.hoursPerWeek) setHoursPerWeek(g.hoursPerWeek);
        setCurrentStep(5); // Jump straight to confirmation
      } else {
        throw new Error(data.error || 'Failed to parse goal.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to parse natural language goal.';
      setErrorMsg(msg);
    } finally {
      setParsingGoal(false);
    }
  };

  // 2. Submit form to generate personalized roadmap
  const handleGenerateRoadmap = async () => {
    setErrorMsg('');
    setGenerating(true);

    try {
      const res = await fetch('/api/planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetRole,
          companyType,
          company,
          region,
          country,
          timelineMonths,
          hoursPerWeek,
          currentLevel,
          skills: selectedSkills
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('unauthenticated'))) {
          throw new Error('Please sign in or create an account to generate and save your roadmap.');
        }
        throw new Error(data.error || 'Failed to generate roadmap.');
      }

      setSavedRecord(data.roadmapRecord);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate roadmap.';
      setErrorMsg(msg);
    } finally {
      setGenerating(false);
    }
  };

  // 3. Clear stored roadmap & Start Over
  const handleStartOver = async () => {
    try {
      await fetch('/api/planner/reset', {
        method: 'POST',
        credentials: 'include'
      });
      setSavedRecord(null);
      setCurrentStep(1);
    } catch (err) {
      console.error("Failed to reset roadmap:", err);
    }
  };

  if (loadingInitial) {
    return <PageLoader />;
  }

  return (
    <div className="flex-1 bg-[#0B1020] text-white min-h-[calc(100vh-5rem)] flex flex-col justify-start relative overflow-hidden py-8 px-4 sm:px-6 lg:px-8">
      {/* Background ambient gradient glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/3 w-[36rem] h-[36rem] bg-[#6D5CFF]/15 blur-[140px] rounded-full pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-[#2DD4D0]/10 blur-[130px] rounded-full pointer-events-none" 
      />

      <div className="max-w-5xl mx-auto w-full relative z-10 space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-[#2DD4D0] uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Deterministic Engineering Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-sans">
            Career Roadmap <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] via-[#818CF8] to-[#2DD4D0]">Planner</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            A goal-aware deterministic planner that allocates study hours, phases, milestones, and extra tracks based on company type, geography, and your current level.
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CASE A: ROADMAP DISPLAY (If student already has a roadmap saved)
           ══════════════════════════════════════════════════════════════════ */}
        {savedRecord ? (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Top Tag Row & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#10172D]/80 backdrop-blur-xl border border-white/10 shadow-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">Target Profile:</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#6D5CFF]/20 text-[#8B7BFF] border border-[#6D5CFF]/30 capitalize">
                  {savedRecord.inputs.role}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#2DD4D0]/15 text-[#2DD4D0] border border-[#2DD4D0]/30 capitalize">
                  {savedRecord.inputs.company || savedRecord.inputs.targetType.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 capitalize">
                  {savedRecord.inputs.country || savedRecord.inputs.region}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-slate-300 border border-white/10">
                  {savedRecord.inputs.timelineMonths} Months ({savedRecord.inputs.hoursPerWeek}h/wk • {savedRecord.inputs.currentLevel})
                </span>
                {savedRecord.version && (
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    v{savedRecord.version}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setSavedRecord(null); setCurrentStep(1); }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#6D5CFF] hover:bg-[#5B4AE0] transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Edit Goal</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* WHAT CHANGED DIFF BANNER (If this plan was rebalanced) */}
            {savedRecord.diff && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 text-xs text-slate-200 shadow-md flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <strong>Plan Rebalanced from Previous Goal:</strong> {(savedRecord.diff.moduleDiffShare * 100).toFixed(0)}% of modules changed, {(savedRecord.diff.hoursReallocatedShare * 100).toFixed(0)}% of study hours reallocated.
                  </div>
                </div>
                <span className="font-mono text-[11px] text-emerald-400 font-semibold uppercase">Deterministic Diff Applied</span>
              </div>
            )}

            {/* EXTRA TRACKS CALLOUT (Region or Startup or IT Services) */}
            {savedRecord.inputs.region === 'europe' && (
              <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 flex items-start gap-3">
                <Globe2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white mb-0.5">🇪🇺 European Tech Career & Visa Relocation Track Included</h4>
                  <p className="text-blue-300/90 leading-relaxed">
                    This roadmap includes specialized modules on EU Blue Card requirements, CV conventions for {savedRecord.inputs.country || 'Europe'}, and language proficiency expectations.
                  </p>
                </div>
              </div>
            )}
            {savedRecord.inputs.targetType === 'startup' && (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 flex items-start gap-3">
                <Layers className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white mb-0.5">🚀 Startup Accelerator Track Included</h4>
                  <p className="text-purple-300/90 leading-relaxed">
                    Prioritizes 0-to-1 MVP shipping, clean API contracts, take-home challenge simulations, and startup equity compensation mechanics.
                  </p>
                </div>
              </div>
            )}
            {savedRecord.inputs.targetType === 'it_services' && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white mb-0.5">⚡ IT Services & Prime Accelerator Track Included</h4>
                  <p className="text-amber-300/90 leading-relaxed">
                    Focuses heavily on speed quantitative reasoning, logical deduction cutoffs, core CS viva memory drills, and corporate business communication.
                  </p>
                </div>
              </div>
            )}

            {/* Strategic Summary Box */}
            <div className="p-6 rounded-3xl bg-[#10172D]/90 backdrop-blur-xl border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {savedRecord.roadmap.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#2DD4D0] bg-[#2DD4D0]/10 border border-[#2DD4D0]/20 px-3 py-1 rounded-full">
                    Deterministic Roadmap
                  </span>
                  {savedRecord.roadmap.confidenceLevel && (
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{savedRecord.roadmap.confidenceLevel.toUpperCase()} CONFIDENCE</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Why This Roadmap
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {savedRecord.roadmap.summary}
                </p>
              </div>

              {/* Summary Stat Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Roadmap Phases</p>
                  <p className="text-2xl font-extrabold text-white">{savedRecord.roadmap.stats.phases}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Hours</p>
                  <p className="text-2xl font-extrabold text-[#2DD4D0]">{savedRecord.roadmap.stats.totalHours}h</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Target Problems</p>
                  <p className="text-2xl font-extrabold text-[#8B7BFF]">{savedRecord.roadmap.stats.problems}+</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-center space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Mock Checkpoints</p>
                  <p className="text-2xl font-extrabold text-amber-400">{savedRecord.roadmap.stats.interviews}</p>
                </div>
              </div>

              {/* Skill Area Allocation Bar */}
              {savedRecord.roadmap.stats.hoursByArea && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-mono uppercase text-slate-400 tracking-wider">Skill Hours Distribution:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(savedRecord.roadmap.stats.hoursByArea).map(([area, hrs]) => (
                      <span key={area} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                        <strong className="text-cyan-300 uppercase">{area.replace('_', ' ')}</strong>: {hrs}h ({((hrs / (savedRecord.roadmap.stats.totalHours || 1)) * 100).toFixed(0)}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion / Timeline Phases */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white uppercase tracking-wider px-1">
                Phase-by-Phase Execution Schedule
              </h3>

              {savedRecord.roadmap.phases.map((phase, idx) => {
                const isOpen = !!expandedPhases[idx];
                return (
                  <div 
                    key={idx}
                    className="rounded-3xl bg-[#10172D]/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-md transition-colors hover:border-white/20"
                  >
                    <button
                      type="button"
                      onClick={() => togglePhaseAccordion(idx)}
                      className="w-full p-5 sm:p-6 text-left flex items-start sm:items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:bg-white/5"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6D5CFF]/20 to-[#2DD4D0]/20 border border-white/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 font-mono text-xs font-bold text-[#2DD4D0]">
                          0{idx + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
                              {phase.name}
                            </h4>
                            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                              {phase.timing}
                            </span>
                            {phase.milestone && (
                              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold">
                                {phase.milestone}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-400">
                            {phase.focus}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 p-1 rounded-lg bg-white/5 text-slate-400 mt-1 sm:mt-0">
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="px-5 sm:px-6 pb-6 pt-2 border-t border-white/5 space-y-4"
                        >
                          {/* Tasks */}
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                              Phase Tasks & Milestones
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                              {phase.tasks.map((task, tIdx) => {
                                const isMilestone = task.includes('🎯 MILESTONE');
                                return (
                                  <div key={tIdx} className={`flex items-start gap-2.5 p-3 rounded-xl border ${isMilestone ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/[0.02] border-white/5'}`}>
                                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isMilestone ? 'text-amber-400' : 'text-[#2DD4D0]'}`} />
                                    <span className={`text-xs leading-relaxed ${isMilestone ? 'text-amber-200 font-bold' : 'text-slate-200'}`}>{task}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Recommended Resources (Clickable Links) */}
                          {phase.resources && phase.resources.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                Linked Practice Challenges & Journal Modules
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {phase.resources.map((resItem, rIdx) => {
                                  const parts = resItem.split(' → ');
                                  const title = parts[0];
                                  const url = parts[1] || '/practice';
                                  return (
                                    <Link 
                                      key={rIdx} 
                                      to={url}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6D5CFF]/10 hover:bg-[#6D5CFF]/20 border border-[#6D5CFF]/30 text-xs font-medium text-[#8B7BFF] hover:text-white transition-colors"
                                    >
                                      <BookOpen className="w-3 h-3 text-[#2DD4D0]" />
                                      <span>{title}</span>
                                      <ExternalLink className="w-3 h-3 text-white/40" />
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* DEPRIORITIZED MODULES ACCORDION */}
            {savedRecord.roadmap.deprioritized && savedRecord.roadmap.deprioritized.length > 0 && (
              <div className="rounded-3xl bg-[#10172D]/60 border border-white/10 p-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowDeprioritized(!showDeprioritized)}
                  className="w-full flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-400 font-semibold">
                    <TrendingDown className="w-4 h-4 text-slate-400" />
                    <span>Modules Deprioritized for this Goal ({savedRecord.roadmap.deprioritized.length})</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showDeprioritized ? 'rotate-90' : ''}`} />
                </button>

                {showDeprioritized && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {savedRecord.roadmap.deprioritized.map((dep, dIdx) => (
                      <div key={dIdx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{dep.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">{dep.skillArea}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{dep.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TARGET PROFILE METADATA & DISCLAIMER */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p>
                  <strong>Profile Verified:</strong> {savedRecord.roadmap.lastVerifiedDate || '2026-10-31'} • <strong>Confidence:</strong> {savedRecord.roadmap.confidenceLevel || 'High'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {savedRecord.roadmap.legalDisclaimer || 'Hiring processes and round structures evolve over time. Always verify latest requirements on official company careers portals.'}
                </p>
              </div>
              {savedRecord.roadmap.sources && savedRecord.roadmap.sources.length > 0 && (
                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase text-slate-500">Sources:</span>
                  {savedRecord.roadmap.sources.slice(0, 2).map((s, sIdx) => (
                    <a key={sIdx} href={s.url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-[11px]">
                      {s.name || s.title || 'Official Careers'}
                    </a>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════
              CASE B: 5-STEP ROADMAP GENERATOR WIZARD + FREE TEXT
             ══════════════════════════════════════════════════════════════════ */
          <div className="bg-[#10172D]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] space-y-8">
            
            {/* NLP Free Text Input Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#6D5CFF]/10 via-[#2DD4D0]/10 to-transparent border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#2DD4D0] font-bold">
                <Sparkles className="w-4 h-4 text-[#2DD4D0]" />
                <span>Natural Language Goal Auto-Fill</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Describe your target in plain English (e.g. <em>"Software engineer at Microsoft in Europe"</em> or <em>"Join a fintech startup in India"</em>). Our parser will instantly populate your profile.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={freeTextGoal}
                  onChange={e => setFreeTextGoal(e.target.value)}
                  placeholder="e.g. Software engineer at Microsoft in Europe (Germany), 6 months"
                  className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#2DD4D0]"
                />
                <button
                  type="button"
                  onClick={handleParseFreeText}
                  disabled={parsingGoal || !freeTextGoal.trim()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6D5CFF] to-[#2DD4D0] text-white font-semibold text-xs disabled:opacity-50 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  {parsingGoal ? <span>Parsing...</span> : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Auto-Fill</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Wizard Step Progress Indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-400 font-mono">
                  STEP {currentStep} OF 5
                </span>
                <span className="text-[#2DD4D0] font-mono">
                  {currentStep === 1 && 'Target Engineering Role'}
                  {currentStep === 2 && 'Company Archetype & Specific Firm'}
                  {currentStep === 3 && 'Regional Target & Country'}
                  {currentStep === 4 && 'Timeline, Hours & Experience Level'}
                  {currentStep === 5 && 'Verify Goal & Confirmation'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#6D5CFF] to-[#2DD4D0] rounded-full"
                  animate={{ width: `${(currentStep / 5) * 100}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes('sign in') && (
                  <Link
                    to="/login?redirect=/planner"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white font-semibold text-xs hover:opacity-90 transition-opacity shrink-0"
                  >
                    <span>Sign In / Sign Up</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}

            {/* Step Card Views with Animations */}
            <AnimatePresence mode="wait">
              {/* STEP 1: TARGET ROLE */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                      What is your target engineering role?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      We calibrate problem difficulty, algorithmic depth, and architectural expectations to your chosen domain.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {TARGET_ROLES.map(role => {
                      const isSelected = targetRole === role.id;
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => setTargetRole(role.id)}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-[#182346] border-[#6D5CFF] shadow-[0_0_25px_rgba(109,92,255,0.25)]'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-[#6D5CFF]/30 border-[#6D5CFF] text-[#2DD4D0]' : 'bg-white/5 border-white/10 text-slate-400'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{role.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4D0]" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{role.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* STEP 2: COMPANY TYPE & SPECIFIC FIRM */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                      Select target company archetype & firm
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      FAANG heavily weights algorithmic proofs; startups evaluate shipping velocity and take-homes; IT services test speed aptitude.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {COMPANY_TYPES.map(comp => {
                      const isSelected = companyType === comp.id;
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          onClick={() => setCompanyType(comp.id)}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#182346] border-[#6D5CFF] shadow-[0_0_25px_rgba(109,92,255,0.25)]'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#2DD4D0]">
                              {comp.tag}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-[#2DD4D0]" />}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-white block">{comp.title}</span>
                            <p className="text-xs text-slate-400 mt-1">{comp.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Specific Company Picker */}
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Specific Company Target (Optional):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_COMPANIES.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCompany(c.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                            company === c.id 
                              ? 'bg-[#2DD4D0]/20 border-[#2DD4D0] text-[#2DD4D0]' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: REGION & COUNTRY */}
              {currentStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                      Where is your target job market?
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Selecting international regions (such as Europe) automatically injects visa sponsorship, Blue Card, and relocation tracks.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {REGIONS.map(reg => {
                      const isSelected = region === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            setRegion(reg.id);
                            if (reg.id === 'europe') setCountry('Germany');
                            else if (reg.id === 'india') setCountry('India');
                            else if (reg.id === 'us') setCountry('USA');
                          }}
                          className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-[#182346] border-[#6D5CFF] shadow-[0_0_25px_rgba(109,92,255,0.25)]'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected ? 'bg-[#6D5CFF]/30 border-[#6D5CFF] text-[#2DD4D0]' : 'bg-white/5 border-white/10 text-slate-400'
                          }`}>
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{reg.title}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#2DD4D0]" />}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{reg.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Country Picker for Europe */}
                  {region === 'europe' && (
                    <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
                      <label className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                        Select Target European Country (for visa & relocation tailoring):
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {EUROPE_COUNTRIES.map(ctry => (
                          <button
                            key={ctry}
                            type="button"
                            onClick={() => setCountry(ctry)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                              country === ctry 
                                ? 'bg-[#2DD4D0]/20 border-[#2DD4D0] text-[#2DD4D0]' 
                                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                            }`}
                          >
                            {ctry}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 4: TIMELINE, HOURS & EXPERIENCE LEVEL */}
              {currentStep === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                      Timeline, Weekly Hours & Current Level
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      The planner scores and fits modules to your exact budget: short timelines cut depth; long timelines add architecture and projects.
                    </p>
                  </div>

                  {/* Experience Level */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Current Assessed Technical Level:
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCurrentLevel(lvl)}
                          className={`p-3 rounded-2xl border text-center text-xs font-bold uppercase tracking-wider transition-colors capitalize ${
                            currentLevel === lvl 
                              ? 'bg-[#6D5CFF]/20 border-[#6D5CFF] text-[#2DD4D0]' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Timeline Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 uppercase tracking-wider">Preparation Timeline:</span>
                      <span className="font-mono text-[#2DD4D0] font-bold text-sm">{timelineMonths} Months</span>
                    </div>
                    <input 
                      type="range"
                      min={1}
                      max={12}
                      step={1}
                      value={timelineMonths}
                      onChange={e => setTimelineMonths(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#2DD4D0]"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>1 Month (Fast Sprint)</span>
                      <span>6 Months (Standard)</span>
                      <span>12 Months (Comprehensive)</span>
                    </div>
                  </div>

                  {/* Weekly Hours Slider */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300 uppercase tracking-wider">Weekly Commitment:</span>
                      <span className="font-mono text-[#8B7BFF] font-bold text-sm">{hoursPerWeek} Hours / Week</span>
                    </div>
                    <input 
                      type="range"
                      min={5}
                      max={40}
                      step={1}
                      value={hoursPerWeek}
                      onChange={e => setHoursPerWeek(Number(e.target.value))}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#8B7BFF]"
                    />
                    <div className="flex justify-between text-[11px] font-mono text-slate-500">
                      <span>5h (Light)</span>
                      <span>15h (Balanced)</span>
                      <span>40h (Full-Time Boot)</span>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* STEP 5: VERIFICATION & CONFIRMATION PREVIEW */}
              {currentStep === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                      Verify Goal & Skills Assessment
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400">
                      Review how the planner understood your parameters before generating your blueprint.
                    </p>
                  </div>

                  {/* "YOUR GOAL AS UNDERSTOOD" PREVIEW CARD */}
                  <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#16203D] to-[#10172D] border border-[#2DD4D0]/30 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2DD4D0]">
                        ✓ Your Goal as Understood
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Total Budget: ≈ {Math.round(timelineMonths * 4.33 * hoursPerWeek * 0.9)} Study Hours
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Target Role</span>
                        <p className="font-bold text-white capitalize">{targetRole}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Company</span>
                        <p className="font-bold text-white capitalize">{company || companyType.replace('_', ' ')}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Region</span>
                        <p className="font-bold text-white capitalize">{country || region}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-0.5">
                        <span className="text-slate-400 text-[10px] uppercase font-mono">Timeline & Level</span>
                        <p className="font-bold text-white capitalize">{timelineMonths}mo • {currentLevel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills Selection */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                      Select Topics You Have Already Studied (To Prioritize Remaining Gaps):
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS_LIST.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-[#6D5CFF]/20 border-[#6D5CFF] text-[#2DD4D0]' 
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wizard Navigation Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || generating}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A72FF] to-[#6D5CFF] text-white font-semibold text-xs hover:opacity-95 transition-opacity"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateRoadmap}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6D5CFF] to-[#2DD4D0] text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-[0_0_30px_rgba(45,212,208,0.3)] disabled:opacity-50"
                >
                  {generating ? (
                    <span>Generating Deterministic Blueprint...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Deterministic Blueprint</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
