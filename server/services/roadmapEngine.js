/**
 * InterviewX Deterministic Career Roadmap Engine
 * 
 * Takes a structured goal profile, level, timeline, and hours to deterministically
 * generate a structurally distinct, phased engineering roadmap.
 * Guaranteed determinism (keyed by goal hash) and works with zero AI dependencies.
 */

const crypto = require('crypto');
const { TARGET_PROFILES, MODULE_LIBRARY } = require('../data/roadmapKnowledgeBase');

class RoadmapEngine {

  /**
   * Normalize user input into standard structured Goal Profile
   */
  static normalizeGoal(raw = {}) {
    const targetTypeRaw = (raw.targetType || raw.companyType || 'big_tech').toLowerCase();
    let targetType = 'big_tech';
    if (targetTypeRaw.includes('startup')) targetType = 'startup';
    else if (targetTypeRaw.includes('service') || targetTypeRaw.includes('tcs') || targetTypeRaw.includes('infosys') || targetTypeRaw.includes('consulting')) targetType = 'it_services';
    else if (targetTypeRaw.includes('product')) targetType = 'product';
    else if (targetTypeRaw.includes('gcc') || targetTypeRaw.includes('bank')) targetType = 'gcc';
    else if (targetTypeRaw.includes('research') || targetTypeRaw.includes('higher') || targetTypeRaw.includes('phd') || targetTypeRaw.includes('ms')) targetType = 'higher_studies';

    const companyRaw = (raw.company || raw.targetCompany || '').toLowerCase().trim();
    let company = '';
    if (companyRaw.includes('microsoft')) company = 'microsoft';
    else if (companyRaw.includes('google')) company = 'google';
    else if (companyRaw.includes('amazon')) company = 'amazon';
    else if (companyRaw.includes('tcs')) company = 'tcs';
    else if (companyRaw.includes('infosys')) company = 'infosys';

    // If company is Microsoft/Google/Amazon, ensure targetType is big_tech
    if (company === 'microsoft' || company === 'google' || company === 'amazon') {
      targetType = 'big_tech';
    } else if (company === 'tcs' || company === 'infosys') {
      targetType = 'it_services';
    }

    const roleRaw = (raw.role || raw.targetRole || 'backend').toLowerCase();
    let role = 'backend';
    if (roleRaw.includes('front')) role = 'frontend';
    else if (roleRaw.includes('full')) role = 'fullstack';
    else if (roleRaw.includes('data') || roleRaw.includes('ml') || roleRaw.includes('ai')) role = 'data_ml';
    else if (roleRaw.includes('devops') || roleRaw.includes('sre') || roleRaw.includes('cloud')) role = 'devops';
    else if (roleRaw.includes('qa') || roleRaw.includes('sdet') || roleRaw.includes('test')) role = 'qa';

    const regionRaw = (raw.region || 'india').toLowerCase();
    let region = 'india';
    if (regionRaw.includes('europe') || regionRaw.includes('uk') || regionRaw.includes('germany') || regionRaw.includes('berlin') || regionRaw.includes('amsterdam') || regionRaw.includes('netherlands')) region = 'europe';
    else if (regionRaw.includes('us') || regionRaw.includes('america') || regionRaw.includes('silicon')) region = 'us';
    else if (regionRaw.includes('remote') || regionRaw.includes('flexible')) region = 'remote';

    const timelineMonths = Math.max(1, Math.min(24, Number(raw.timelineMonths) || 6));
    const hoursPerWeek = Math.max(5, Math.min(50, Number(raw.hoursPerWeek) || 12));
    const currentLevel = (raw.currentLevel || raw.level || 'intermediate').toLowerCase(); // beginner | intermediate | advanced

    const skills = Array.isArray(raw.skills) ? raw.skills : [];
    const country = raw.country || (region === 'europe' ? 'Germany' : region === 'india' ? 'India' : 'US');

    return {
      targetType,
      company,
      role,
      region,
      country,
      timelineMonths,
      hoursPerWeek,
      currentLevel: ['beginner', 'intermediate', 'advanced'].includes(currentLevel) ? currentLevel : 'intermediate',
      skills,
      rawInput: raw
    };
  }

  /**
   * Deterministic SHA-256 hash representing the full goal profile
   */
  static computeGoalHash(goal) {
    const canonical = {
      t: goal.targetType,
      c: goal.company,
      r: goal.role,
      reg: goal.region,
      tm: goal.timelineMonths,
      hpw: goal.hoursPerWeek,
      lvl: goal.currentLevel,
      sk: [...goal.skills].sort()
    };
    return crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex').substring(0, 16);
  }

  /**
   * Blend skill weights based on Target Type + Company + Role
   */
  static getEffectiveWeights(goal) {
    const baseType = TARGET_PROFILES.types[goal.targetType] || TARGET_PROFILES.types.big_tech;
    const weights = { ...baseType.skillWeights };

    // Apply company modifications
    if (goal.company && TARGET_PROFILES.companies[goal.company]) {
      const comp = TARGET_PROFILES.companies[goal.company];
      if (comp.weightMod) {
        for (const [skill, mod] of Object.entries(comp.weightMod)) {
          weights[skill] = Math.max(0, (weights[skill] || 0) + mod);
        }
      }
    }

    // Apply role modifications
    if (goal.role && TARGET_PROFILES.roles[goal.role]) {
      const roleProfile = TARGET_PROFILES.roles[goal.role];
      if (roleProfile.weightMod) {
        for (const [skill, mod] of Object.entries(roleProfile.weightMod)) {
          weights[skill] = Math.max(0, (weights[skill] || 0) + mod);
        }
      }
    }

    // Region extra track presence
    if (goal.region === 'europe') {
      weights.extra_tracks = 0.12;
    } else if (goal.targetType === 'startup') {
      weights.extra_tracks = 0.10;
    } else if (goal.targetType === 'it_services') {
      weights.extra_tracks = 0.10;
    } else {
      weights.extra_tracks = 0.05;
    }

    // Normalize weights so they sum to 1.0
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    const normalized = {};
    for (const [k, v] of Object.entries(weights)) {
      normalized[k] = Number((v / total).toFixed(3));
    }
    return normalized;
  }

  /**
   * Score, select, and topologically order learning modules to fit the time budget
   */
  static selectModules(goal, weights) {
    const totalWeeks = Math.round(goal.timelineMonths * 4.33);
    const totalBudgetHours = Math.round(totalWeeks * goal.hoursPerWeek * 0.90); // 10% safety buffer

    // Evaluate skill gaps based on level and user skills
    const levelMultipliers = {
      beginner: { beginner: 1.0, intermediate: 0.8, advanced: 0.4 },
      intermediate: { beginner: 0.2, intermediate: 1.0, advanced: 0.7 },
      advanced: { beginner: 0.05, intermediate: 0.4, advanced: 1.0 }
    };
    const mults = levelMultipliers[goal.currentLevel] || levelMultipliers.intermediate;

    // Filter relevant modules (e.g. region-specific extra tracks)
    const candidateModules = MODULE_LIBRARY.filter(m => {
      if (m.skillArea === 'extra_tracks') {
        if (m.id === 'extra_eu_visa_cv') return goal.region === 'europe';
        if (m.id === 'extra_startup_shipping_equity') return goal.targetType === 'startup';
        if (m.id === 'extra_it_services_accelerator') return goal.targetType === 'it_services';
        return false;
      }
      return true;
    });

    // Score every candidate module
    const scored = candidateModules.map(m => {
      const targetWeight = weights[m.skillArea] || 0.05;
      const difficultyFactor = (m.skillArea === 'extra_tracks' || m.skillArea === 'aptitude') ? 1.0 : (mults[m.difficulty] || 0.6);
      const costFactor = 1 / Math.sqrt(m.estimatedHours);
      
      // Calculate priority score
      let priority = targetWeight * difficultyFactor * costFactor * 100;
      
      // Mandatory / dedicated extra tracks for specified region or company type
      if (m.skillArea === 'extra_tracks') {
        if (goal.region === 'europe' && m.id === 'extra_eu_visa_cv') priority *= 2.8;
        if (goal.targetType === 'startup' && m.id === 'extra_startup_shipping_equity') priority *= 2.8;
        if (goal.targetType === 'it_services' && m.id === 'extra_it_services_accelerator') priority *= 2.8;
      }

      // If student is beginner and module is beginner prerequisite, boost it
      if (goal.currentLevel === 'beginner' && m.difficulty === 'beginner') {
        priority *= 1.4;
      }
      // If student is advanced, penalize elementary modules
      if (goal.currentLevel === 'advanced' && m.difficulty === 'beginner' && m.skillArea !== 'extra_tracks') {
        priority *= 0.15;
      }

      return {
        ...m,
        score: priority,
        inclusionReason: `Prioritized because ${m.skillArea.replace('_', ' ').toUpperCase()} is weighted ${(targetWeight * 100).toFixed(0)}% for ${goal.targetType.replace('_', ' ')}.`
      };
    });

    // Sort descending by priority score
    scored.sort((a, b) => b.score - a.score);

    // Greedy selection respecting budget
    let accumulatedHours = 0;
    const selectedIds = new Set();
    const selectedModules = [];
    const deprioritized = [];

    // Ensure prerequisites are included
    const ensurePrerequisites = (mod) => {
      if (!mod.prerequisites || mod.prerequisites.length === 0) return true;
      for (const preId of mod.prerequisites) {
        if (!selectedIds.has(preId)) {
          const preMod = MODULE_LIBRARY.find(m => m.id === preId);
          if (preMod && (accumulatedHours + preMod.estimatedHours <= totalBudgetHours || selectedModules.length < 3)) {
            selectedIds.add(preMod.id);
            selectedModules.push({
              ...preMod,
              score: mod.score * 0.9,
              inclusionReason: `Included as required foundational prerequisite for ${mod.title}.`
            });
            accumulatedHours += preMod.estimatedHours;
            ensurePrerequisites(preMod);
          } else {
            return false;
          }
        }
      }
      return true;
    };

    for (const mod of scored) {
      if (selectedIds.has(mod.id)) continue;
      if (accumulatedHours + mod.estimatedHours <= totalBudgetHours || selectedModules.length < 3) {
        const prereqsSatisfied = ensurePrerequisites(mod);
        if (prereqsSatisfied && !selectedIds.has(mod.id)) {
          selectedIds.add(mod.id);
          selectedModules.push(mod);
          accumulatedHours += mod.estimatedHours;
        }
      } else {
        deprioritized.push({
          id: mod.id,
          title: mod.title,
          skillArea: mod.skillArea,
          reason: `Exceeded available timeline budget (${accumulatedHours}h used of ${totalBudgetHours}h cap).`
        });
      }
    }

    // Topological Sort of selected modules based on prerequisites
    const ordered = [];
    const visited = new Set();
    const visiting = new Set();

    const visit = (m) => {
      if (visited.has(m.id)) return;
      if (visiting.has(m.id)) return; // prevent cyclic loops
      visiting.add(m.id);
      if (m.prerequisites) {
        for (const pId of m.prerequisites) {
          const pMod = selectedModules.find(s => s.id === pId);
          if (pMod) visit(pMod);
        }
      }
      visiting.delete(m.id);
      visited.add(m.id);
      ordered.push(m);
    };

    for (const m of selectedModules) {
      visit(m);
    }

    return {
      selected: ordered,
      deprioritized,
      totalHours: accumulatedHours,
      budgetHours: totalBudgetHours
    };
  }

  /**
   * Structure selected modules into distinct chronological phases with milestones
   */
  static buildPhases(goal, selectedModules, weights) {
    const targetInfo = TARGET_PROFILES.types[goal.targetType] || TARGET_PROFILES.types.big_tech;
    const companyInfo = goal.company ? TARGET_PROFILES.companies[goal.company] : null;
    const regionInfo = TARGET_PROFILES.regions[goal.region] || TARGET_PROFILES.regions.india;

    const totalWeeks = Math.max(4, Math.round(goal.timelineMonths * 4.33));
    const modules = selectedModules;
    
    // Choose number of phases: 3 phases for short timelines (<=6w), 4 phases for standard, 5 for extensive (>20w)
    let numPhases = totalWeeks <= 6 ? 3 : totalWeeks > 20 ? 5 : 4;
    numPhases = Math.min(numPhases, Math.max(2, modules.length));
    const phases = [];
    const weeksPerPhase = Math.max(1, Math.floor(totalWeeks / numPhases));

    // Distribute modules evenly across phases
    const chunkSize = Math.max(1, Math.ceil(modules.length / numPhases));

    // Dynamic phase templates based on target
    let phaseNames = [];
    let phaseFocuses = [];
    let checkpoints = [];

    if (goal.targetType === 'startup') {
      phaseNames = [
        'Phase 1: 0-to-1 Architecture & Core Foundation',
        'Phase 2: MVP Product Engineering & Fast Shipping',
        'Phase 3: Deep-Dive System Defensibility & Scale',
        'Phase 4: Founder Alignment & Production Deployment'
      ];
      phaseFocuses = [
        'Master rapid prototyping, full-stack state invariants, and clean schema design.',
        'Ship a functional, end-to-end production MVP with CI/CD and authenticated endpoints.',
        'Optimize distributed latency, caching trade-offs, and defend architectural choices.',
        'Conduct live pairing simulations, equity negotiation review, and portfolio demo.'
      ];
      checkpoints = [
        'Prototype Schema & Repository Bootstrap Milestone',
        'Take-Home Challenge Simulation (24h Sprint Benchmark)',
        'Live Code Walkthrough & Trade-off Defense Mock',
        'Founder Autonomy & Culture Fit Simulation'
      ];
    } else if (goal.targetType === 'it_services') {
      phaseNames = [
        'Phase 1: Speed Quantitative & Logical Reasoning Sprint',
        'Phase 2: Core CS Theory, SQL & Programming Invariants',
        'Phase 3: National Qualifier Test (NQT) Full Diagnostic',
        'Phase 4: Corporate Business English & Managerial Review'
      ];
      phaseFocuses = [
        'Drill speed arithmetic, shortcut formulas, and rapid seating/puzzle problem solving.',
        'Master relational normalization, DBMS BCNF, OOP inheritance, and basic array coding.',
        'Simulate full-length TCS NQT / Infosys InfyTQ assessments under strict timed cutoffs.',
        'Calibrate clear articulation, client communication etiquette, and managerial viva answers.'
      ];
      checkpoints = [
        'Quantitative Speed Diagnostic (45s per problem)',
        'C/Java/Python Syntax & Core CS Viva Milestone',
        'TCS/Infosys National Qualifier Test Diagnostic (120m)',
        'Managerial HR Communication & Competency Simulation'
      ];
    } else {
      // Big Tech / Product
      const companyLabel = companyInfo ? companyInfo.name : 'Big Tech';
      phaseNames = [
        `Phase 1: Algorithmic Invariants & Speed Foundations`,
        `Phase 2: Non-Linear Structures & Complex Optimization`,
        `Phase 3: Distributed Systems Architecture & Database Scale`,
        `Phase 4: ${companyLabel} Bar-Raiser & STAR Leadership Simulation`
      ];
      phaseFocuses = [
        'Master two-pointer sliding windows, prefix-sums, and prove Big-O bounds before coding.',
        'Solve trees, graphs, DAG topological traversals, and dynamic programming state compression.',
        'Design high-throughput distributed architectures, Redis caching, and database partitioning.',
        `Execute timed ${companyLabel} mock interviews, STAR leadership answers, and eliminate algorithmic entropy.`
      ];
      checkpoints = companyInfo?.checkpoints || [
        'Online Assessment (OA) 90m Benchmark',
        'Non-Linear Data Structures Coding Milestone',
        'High-Scale Distributed System Design Mock',
        'Bar-Raiser 16 Principles STAR Interview Simulation'
      ];
    }

    let moduleIndex = 0;
    for (let i = 0; i < numPhases; i++) {
      const phaseStartWeek = i * weeksPerPhase + 1;
      const phaseEndWeek = (i === numPhases - 1) ? totalWeeks : (i + 1) * weeksPerPhase;
      const phaseMods = modules.slice(moduleIndex, moduleIndex + chunkSize);
      moduleIndex += chunkSize;

      const tasks = [];
      const resources = [];

      for (const m of phaseMods) {
        tasks.push(`Master ${m.title} (${m.estimatedHours}h estimated commitment)`);
        for (const out of m.outcomes) {
          tasks.push(`• ${out}`);
        }
        for (const link of m.links) {
          resources.push(`${link.title} → ${link.url}`);
        }
      }

      // Add phase checkpoint milestone
      if (checkpoints[i]) {
        tasks.push(`🎯 MILESTONE: ${checkpoints[i]}`);
      }

      phases.push({
        phaseNumber: i + 1,
        name: phaseNames[i] || `Phase ${i + 1}: Technical Progression`,
        timing: `Week ${phaseStartWeek} - ${phaseEndWeek}`,
        focus: phaseFocuses[i] || 'Targeted technical development and execution.',
        color: i === 0 ? 'accent-primary' : i === 1 ? 'accent-secondary' : i === 2 ? 'color-info' : 'color-warning',
        tasks,
        resources: Array.from(new Set(resources)),
        milestone: checkpoints[i] || 'Phase Evaluation Checkpoint'
      });
    }

    return phases.filter(p => p.tasks && p.tasks.length > 0);
  }

  /**
   * Main Generation Pipeline
   */
  static generate(rawInputs = {}) {
    const goal = this.normalizeGoal(rawInputs);
    const goalHash = this.computeGoalHash(goal);
    const effectiveWeights = this.getEffectiveWeights(goal);
    const { selected, deprioritized, totalHours, budgetHours } = this.selectModules(goal, effectiveWeights);
    const phases = this.buildPhases(goal, selected, effectiveWeights);

    // Calculate skill area breakdown
    const hoursByArea = {};
    for (const m of selected) {
      hoursByArea[m.skillArea] = (hoursByArea[m.skillArea] || 0) + m.estimatedHours;
    }

    const targetTypeInfo = TARGET_PROFILES.types[goal.targetType] || TARGET_PROFILES.types.big_tech;
    const companyInfo = goal.company ? TARGET_PROFILES.companies[goal.company] : null;
    const regionInfo = TARGET_PROFILES.regions[goal.region] || TARGET_PROFILES.regions.india;

    const companyLabel = companyInfo ? companyInfo.name : targetTypeInfo.name;
    const roleLabel = (TARGET_PROFILES.roles[goal.role] || {}).name || goal.role;

    // Build plain-language "Why this roadmap"
    const whySummary = [
      `Roadmap engineered specifically for ${roleLabel} at ${companyLabel} (${regionInfo.name}).`,
      `Target skill weights allocate ${(effectiveWeights.dsa * 100).toFixed(0)}% to DSA, ${(effectiveWeights.system_design * 100).toFixed(0)}% to Systems Design, ${(effectiveWeights.projects_shipping * 100).toFixed(0)}% to Shipping/Projects, and ${(effectiveWeights.aptitude * 100).toFixed(0)}% to Aptitude.`,
      `Tailored to your current ${goal.currentLevel.toUpperCase()} level over a ${goal.timelineMonths}-month (${goal.hoursPerWeek} hrs/week) commitment.`
    ].join(' ');

    const sources = [
      ...(companyInfo?.sources || []),
      ...(targetTypeInfo.sources || []),
      ...(regionInfo.extraTracks ? regionInfo.extraTracks.flatMap(t => t.sources || []) : [])
    ];

    const roadmapData = {
      id: `roadmap-${goalHash}`,
      goalHash,
      title: `${roleLabel} Blueprint · ${companyLabel}`,
      summary: whySummary,
      stats: {
        phases: phases.length,
        modules: selected.length,
        totalHours,
        budgetHours,
        problems: goal.targetType === 'it_services' ? 45 : goal.targetType === 'startup' ? 60 : 150,
        interviews: phases.length,
        hoursByArea
      },
      effectiveWeights,
      phases,
      deprioritized,
      sources,
      lastVerifiedDate: sources[0]?.date || '2026-02-15',
      confidenceLevel: sources[0]?.confidence || 'high',
      legalDisclaimer: 'Hiring processes and round structures evolve over time. Always verify latest requirements on official company careers portals.',
      inputs: goal
    };

    return roadmapData;
  }

  /**
   * Compare two roadmaps and return structural difference metrics
   */
  static diff(planA, planB) {
    if (!planA || !planB) return null;

    const modulesA = new Set(planA.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')).map(t => t.replace('Master ', ''))));
    const modulesB = new Set(planB.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')).map(t => t.replace('Master ', ''))));

    const allModules = new Set([...modulesA, ...modulesB]);
    let sharedCount = 0;
    for (const m of modulesA) {
      if (modulesB.has(m)) sharedCount++;
    }
    const moduleDiffShare = allModules.size > 0 ? (allModules.size - sharedCount) / allModules.size : 0;

    // Hour reallocation difference across skill areas
    const areas = new Set([...Object.keys(planA.stats?.hoursByArea || {}), ...Object.keys(planB.stats?.hoursByArea || {})]);
    let totalHourDiff = 0;
    const totalHoursA = planA.stats?.totalHours || 1;
    const totalHoursB = planB.stats?.totalHours || 1;

    for (const area of areas) {
      const shareA = (planA.stats?.hoursByArea?.[area] || 0) / totalHoursA;
      const shareB = (planB.stats?.hoursByArea?.[area] || 0) / totalHoursB;
      totalHourDiff += Math.abs(shareA - shareB);
    }
    const hoursReallocatedShare = totalHourDiff / 2; // Manhattan distance on simplex

    const phasesDiffer = JSON.stringify(planA.phases.map(p => p.name)) !== JSON.stringify(planB.phases.map(p => p.name));
    const milestonesDiffer = JSON.stringify(planA.phases.map(p => p.milestone)) !== JSON.stringify(planB.phases.map(p => p.milestone));

    return {
      moduleDiffShare: Number(moduleDiffShare.toFixed(3)),
      hoursReallocatedShare: Number(hoursReallocatedShare.toFixed(3)),
      phasesDiffer,
      milestonesDiffer,
      planATitle: planA.title,
      planBTitle: planB.title
    };
  }

  /**
   * Deterministic Natural Language Goal Parser
   */
  static parseFreeTextGoal(text = '') {
    const lower = text.toLowerCase();
    const result = {
      targetType: 'big_tech',
      company: '',
      role: 'backend',
      region: 'india',
      country: '',
      timelineMonths: 6,
      hoursPerWeek: 12
    };

    // Target / Company
    if (lower.includes('microsoft')) { result.company = 'microsoft'; result.targetType = 'big_tech'; }
    else if (lower.includes('google')) { result.company = 'google'; result.targetType = 'big_tech'; }
    else if (lower.includes('amazon')) { result.company = 'amazon'; result.targetType = 'big_tech'; }
    else if (lower.includes('tcs')) { result.company = 'tcs'; result.targetType = 'it_services'; }
    else if (lower.includes('infosys')) { result.company = 'infosys'; result.targetType = 'it_services'; }
    else if (lower.includes('startup') || lower.includes('y combinator') || lower.includes('seed')) { result.targetType = 'startup'; }
    else if (lower.includes('service') || lower.includes('consulting')) { result.targetType = 'it_services'; }
    else if (lower.includes('product') || lower.includes('atlassian') || lower.includes('uber')) { result.targetType = 'product'; }

    // Role
    if (lower.includes('front') || lower.includes('react') || lower.includes('ui')) result.role = 'frontend';
    else if (lower.includes('full') || lower.includes('fullstack') || lower.includes('full-stack')) result.role = 'fullstack';
    else if (lower.includes('data') || lower.includes('ml') || lower.includes('machine learning') || lower.includes('ai')) result.role = 'data_ml';
    else if (lower.includes('devops') || lower.includes('sre') || lower.includes('cloud')) result.role = 'devops';
    else if (lower.includes('qa') || lower.includes('testing') || lower.includes('sdet')) result.role = 'qa';
    else if (lower.includes('software engineer') || lower.includes('sde') || lower.includes('backend')) result.role = 'backend';

    // Region & Country
    if (lower.includes('berlin') || lower.includes('germany')) { result.region = 'europe'; result.country = 'Germany'; }
    else if (lower.includes('london') || lower.includes('uk') || lower.includes('united kingdom')) { result.region = 'europe'; result.country = 'United Kingdom'; }
    else if (lower.includes('amsterdam') || lower.includes('netherlands')) { result.region = 'europe'; result.country = 'Netherlands'; }
    else if (lower.includes('europe')) { result.region = 'europe'; result.country = 'Germany'; }
    else if (lower.includes('us') || lower.includes('usa') || lower.includes('silicon valley') || lower.includes('seattle')) { result.region = 'us'; result.country = 'USA'; }
    else if (lower.includes('india') || lower.includes('bangalore') || lower.includes('hyderabad') || lower.includes('pune')) { result.region = 'india'; result.country = 'India'; }
    else if (lower.includes('remote')) { result.region = 'remote'; }

    // Timeline
    const monthMatch = lower.match(/(\d+)\s*(?:month|mo)/);
    if (monthMatch) result.timelineMonths = parseInt(monthMatch[1], 10);
    const weekMatch = lower.match(/(\d+)\s*(?:week|wk)/);
    if (weekMatch) result.timelineMonths = Math.max(1, Math.round(parseInt(weekMatch[1], 10) / 4.33));

    // Hours
    const hourMatch = lower.match(/(\d+)\s*(?:hours|hrs|h)\s*(?:\/|per)?\s*(?:week|wk)/);
    if (hourMatch) result.hoursPerWeek = parseInt(hourMatch[1], 10);

    return result;
  }
}

module.exports = RoadmapEngine;
module.exports.RoadmapEngine = RoadmapEngine;
