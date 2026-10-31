import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Code2, 
  Database, 
  Cpu, 
  Globe, 
  Layers, 
  Workflow, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface PlanetNode {
  id: string;
  name: string;
  category: string;
  orbitIndex: number; // 1 to 4
  angleDeg: number;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
  mastery: number;
  status: 'Mastered' | 'In Progress' | 'Target Sprint';
  targetPath: string;
  problemsCount: number;
}

const PLANETS: PlanetNode[] = [
  // Orbit 1: Core Foundations (Radius: ~110px)
  {
    id: 'dsa',
    name: 'DSA & Algorithms',
    category: 'Core Problem Solving',
    orbitIndex: 1,
    angleDeg: 30,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/15',
    borderColor: 'border-indigo-500/40',
    icon: Code2,
    mastery: 92,
    status: 'Mastered',
    targetPath: '/compiler',
    problemsCount: 3555
  },
  {
    id: 'dbms',
    name: 'DBMS & Storage',
    category: 'Relational & NoSQL',
    orbitIndex: 1,
    angleDeg: 210,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/15',
    borderColor: 'border-cyan-500/40',
    icon: Database,
    mastery: 86,
    status: 'In Progress',
    targetPath: '/foundations',
    problemsCount: 420
  },

  // Orbit 2: Systems Engineering (Radius: ~180px)
  {
    id: 'os',
    name: 'OS & Concurrency',
    category: 'Virtual Memory & Threads',
    orbitIndex: 2,
    angleDeg: 120,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/40',
    icon: Cpu,
    mastery: 78,
    status: 'In Progress',
    targetPath: '/foundations',
    problemsCount: 380
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    category: 'TCP/IP & Web Protocols',
    orbitIndex: 2,
    angleDeg: 300,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/15',
    borderColor: 'border-teal-500/40',
    icon: Globe,
    mastery: 84,
    status: 'Mastered',
    targetPath: '/foundations',
    problemsCount: 340
  },

  // Orbit 3: Enterprise Backend (Radius: ~250px)
  {
    id: 'java',
    name: 'Java 21 Foundation',
    category: 'JVM & Collections',
    orbitIndex: 3,
    angleDeg: 75,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
    borderColor: 'border-amber-500/40',
    icon: Layers,
    mastery: 88,
    status: 'Mastered',
    targetPath: '/foundations',
    problemsCount: 260
  },
  {
    id: 'spring',
    name: 'Spring Boot & JPA',
    category: 'Microservices & Security',
    orbitIndex: 3,
    angleDeg: 255,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
    borderColor: 'border-purple-500/40',
    icon: Workflow,
    mastery: 72,
    status: 'Target Sprint',
    targetPath: '/foundations',
    problemsCount: 290
  },

  // Orbit 4: Architecture & Leadership (Radius: ~320px)
  {
    id: 'system-design',
    name: 'System Design',
    category: 'Distributed Scale',
    orbitIndex: 4,
    angleDeg: 160,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    icon: Sparkles,
    mastery: 68,
    status: 'Target Sprint',
    targetPath: '/advisor',
    problemsCount: 180
  },
  {
    id: 'star-mock',
    name: 'STAR & Bar Raiser',
    category: 'Behavioral & Leadership',
    orbitIndex: 4,
    angleDeg: 340,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
    borderColor: 'border-blue-500/40',
    icon: Award,
    mastery: 85,
    status: 'Mastered',
    targetPath: '/simulator',
    problemsCount: 150
  }
];

export function SolarSystemRoadmap() {
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetNode>(PLANETS[0]);
  const [isRotating, setIsRotating] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const orbitRadii = [0, 110, 175, 240, 305]; // Radii in pixels from center
  const orbitDurations = [0, 48, 64, 80, 96]; // Seconds per full revolution

  return (
    <div className="bento-card p-6 sm:p-8 lg:p-10 border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-xl rounded-2xl relative overflow-hidden">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)] mb-8 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            CELESTIAL SKILL ROADMAP
          </div>
          <h3 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
            Autonomous Placement Orbital Engine
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Subject competencies revolving dynamically around your target engineering milestone.
          </p>
        </div>

        {/* Orbit Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setIsRotating(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isRotating ? 'Pause Orbit' : 'Resume Orbit'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left/Center: The Interactive Solar System Stage */}
        <div className="lg:col-span-8 flex items-center justify-center min-h-[420px] sm:min-h-[540px] relative overflow-hidden">
          {/* Orbital Container */}
          <div className="relative w-[360px] h-[360px] sm:w-[500px] sm:h-[500px] lg:w-[620px] lg:h-[620px] flex items-center justify-center">
            
            {/* 1. Center Star: The Student's Goal */}
            <div className="absolute z-20 flex flex-col items-center justify-center text-center">
              <div className="relative group cursor-pointer">
                {/* Radiant Pulsing Sun Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-indigo-500/30 to-teal-500/30 rounded-full blur-xl animate-pulse"></div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 border-2 border-indigo-400/60 flex flex-col items-center justify-center p-2 text-white shadow-2xl relative z-10 transition-transform hover:scale-105">
                  <Award className="w-6 h-6 text-amber-300" />
                  <span className="text-[10px] sm:text-[11px] font-bold font-heading mt-1 tracking-tight leading-none text-center">
                    TIER-1 SDE
                  </span>
                  <span className="text-[8px] font-mono text-indigo-200 mt-0.5">TARGET GOAL</span>
                </div>
              </div>
            </div>

            {/* 2. Concentric Orbit Tracks & Orbiting Planets */}
            {[1, 2, 3, 4].map(orbitIdx => {
              const radius = orbitRadii[orbitIdx];
              const duration = orbitDurations[orbitIdx];
              const planetsOnThisOrbit = PLANETS.filter(p => p.orbitIndex === orbitIdx);

              return (
                <div
                  key={orbitIdx}
                  className="absolute rounded-full border border-[var(--border-subtle)]/60 pointer-events-none flex items-center justify-center"
                  style={{
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                  }}
                >
                  {/* Rotating Ring Container for planets */}
                  <motion.div
                    className="w-full h-full relative pointer-events-auto"
                    animate={
                      !shouldReduceMotion && isRotating
                        ? { rotate: 360 }
                        : { rotate: 0 }
                    }
                    transition={{
                      duration: duration,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  >
                    {planetsOnThisOrbit.map(planet => {
                      const rad = (planet.angleDeg * Math.PI) / 180;
                      // Place planet on perimeter
                      const leftPercent = 50 + 50 * Math.cos(rad);
                      const topPercent = 50 + 50 * Math.sin(rad);
                      const isSelected = selectedPlanet.id === planet.id;
                      const Icon = planet.icon;

                      return (
                        <div
                          key={planet.id}
                          style={{
                            position: 'absolute',
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          {/* Counter-rotate planet content so text/icon remains upright */}
                          <motion.div
                            animate={
                              !shouldReduceMotion && isRotating
                                ? { rotate: -360 }
                                : { rotate: 0 }
                            }
                            transition={{
                              duration: duration,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                          >
                            <button
                              onClick={() => setSelectedPlanet(planet)}
                              className={`group relative p-2 sm:p-2.5 rounded-full ${planet.bgColor} border ${
                                isSelected 
                                  ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-125' 
                                  : `${planet.borderColor} hover:scale-115`
                              } transition-all duration-200 cursor-pointer flex items-center justify-center`}
                              title={`${planet.name} (${planet.mastery}% Mastery)`}
                            >
                              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${planet.color}`} />

                              {/* Mini Orbit status beacon */}
                              {planet.status === 'Mastered' && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
                              )}
                            </button>
                          </motion.div>
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Planet Telemetry Card */}
        <div className="lg:col-span-4 space-y-4">
          <motion.div
            key={selectedPlanet.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedPlanet.bgColor} border ${selectedPlanet.borderColor} flex items-center justify-center`}>
                  {React.createElement(selectedPlanet.icon, { className: `w-5 h-5 ${selectedPlanet.color}` })}
                </div>
                <div>
                  <h4 className="text-base font-bold font-heading text-[var(--text-primary)]">
                    {selectedPlanet.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{selectedPlanet.category}</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                selectedPlanet.status === 'Mastered' 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {selectedPlanet.status}
              </span>
            </div>

            {/* Mastery Progress */}
            <div className="space-y-2 py-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">MASTERY BENCHMARK:</span>
                <span className="text-indigo-400 font-bold text-sm">{selectedPlanet.mastery}%</span>
              </div>
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${selectedPlanet.mastery}%` }}
                />
              </div>
            </div>

            {/* Telemetry Stats */}
            <div className="grid grid-cols-2 gap-2.5 font-mono text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-slate-400">TOTAL PROBLEMS</div>
                <div className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedPlanet.problemsCount}+</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-slate-400">ORBIT LEVEL</div>
                <div className="text-sm font-bold text-indigo-400 mt-0.5">Tier {selectedPlanet.orbitIndex}</div>
              </div>
            </div>

            {/* Action Jump */}
            <div className="pt-5">
              <Link
                to={selectedPlanet.targetPath}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all hover:scale-102"
              >
                <span>Enter Practice Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
