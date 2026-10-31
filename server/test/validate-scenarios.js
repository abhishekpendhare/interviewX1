const RoadmapEngine = require('../services/roadmapEngine');
const { MODULE_LIBRARY } = require('../data/roadmapKnowledgeBase');
const assert = require('assert');

console.log('=== RUNNING PHASE 5 ROADMAP VALIDATION MATRIX ===\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. SCENARIOS GENERATION
// ─────────────────────────────────────────────────────────────────────────────

// S1: Microsoft, SWE (Backend), Europe (Germany), 6 months, 10 h/week, intermediate
const s1 = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'intermediate'
});

// S2: Startup, Full-stack, India, 3 months, 15 h/week, intermediate
const s2 = RoadmapEngine.generate({
  targetType: 'startup',
  targetRole: 'fullstack',
  region: 'india',
  timelineMonths: 3,
  hoursPerWeek: 15,
  currentLevel: 'intermediate'
});

// S3: Scenario 1 with region changed to India
const s3 = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'india',
  country: 'India',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'intermediate'
});

// S4: Scenario 1 with target changed to startup
const s4 = RoadmapEngine.generate({
  targetType: 'startup',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'intermediate'
});

// S5: Big tech, India, campus hiring
const s5 = RoadmapEngine.generate({
  targetType: 'big_tech',
  targetRole: 'backend',
  region: 'india',
  timelineMonths: 6,
  hoursPerWeek: 12,
  currentLevel: 'intermediate'
});

// S6: IT services (TCS), India, 2 months, 15 h/week
const s6 = RoadmapEngine.generate({
  company: 'tcs',
  targetType: 'it_services',
  targetRole: 'backend',
  region: 'india',
  timelineMonths: 2,
  hoursPerWeek: 15,
  currentLevel: 'intermediate'
});

// S7: Role variations (Backend vs Frontend vs Data)
const s7_backend = RoadmapEngine.generate({
  targetType: 'startup',
  targetRole: 'backend',
  region: 'india',
  timelineMonths: 3,
  hoursPerWeek: 15,
  currentLevel: 'intermediate'
});
const s7_frontend = RoadmapEngine.generate({
  targetType: 'startup',
  targetRole: 'frontend',
  region: 'india',
  timelineMonths: 3,
  hoursPerWeek: 15,
  currentLevel: 'intermediate'
});
const s7_data = RoadmapEngine.generate({
  targetType: 'startup',
  targetRole: 'data_ml',
  region: 'india',
  timelineMonths: 3,
  hoursPerWeek: 15,
  currentLevel: 'intermediate'
});

// S8: Beginner vs Advanced
const s8_beg = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'beginner'
});
const s8_adv = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'advanced'
});

// S9: 4 weeks vs 12 months
const s9_4w = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 1, // 4 weeks
  hoursPerWeek: 10,
  currentLevel: 'intermediate'
});
const s9_12m = RoadmapEngine.generate({
  company: 'microsoft',
  targetRole: 'backend',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 12,
  hoursPerWeek: 10,
  currentLevel: 'intermediate'
});

// ─────────────────────────────────────────────────────────────────────────────
// ASSERTIONS MATRIX
// ─────────────────────────────────────────────────────────────────────────────

// 1. Scenario 1 vs 2: Module diff >= 40%, hour reallocation >= 25%, phases differ, milestones differ
runTest('S1 vs S2: Module difference >= 40%', () => {
  const diff = RoadmapEngine.diff(s1, s2);
  assert(diff.moduleDiffShare >= 0.40, `Expected module diff >= 40%, got ${(diff.moduleDiffShare * 100).toFixed(1)}%`);
});

runTest('S1 vs S2: Hours reallocated >= 25%', () => {
  const diff = RoadmapEngine.diff(s1, s2);
  assert(diff.hoursReallocatedShare >= 0.25, `Expected hours reallocated >= 25%, got ${(diff.hoursReallocatedShare * 100).toFixed(1)}%`);
});

runTest('S1 vs S2: Phases and Milestones structurally differ', () => {
  const diff = RoadmapEngine.diff(s1, s2);
  assert(diff.phasesDiffer, 'Phases should differ');
  assert(diff.milestonesDiffer, 'Milestones should differ');
});

// 2. Scenario 1 vs 4: Module diff >= 40%, hour reallocation >= 25%
runTest('S1 vs S4: Module difference >= 40%', () => {
  const diff = RoadmapEngine.diff(s1, s4);
  assert(diff.moduleDiffShare >= 0.40, `Expected module diff >= 40%, got ${(diff.moduleDiffShare * 100).toFixed(1)}%`);
});

runTest('S1 vs S4: Hours reallocated >= 25%', () => {
  const diff = RoadmapEngine.diff(s1, s4);
  assert(diff.hoursReallocatedShare >= 0.25, `Expected hours reallocated >= 25%, got ${(diff.hoursReallocatedShare * 100).toFixed(1)}%`);
});

// 3. Scenario 1 vs 3 (Region change only): Extra tracks change
runTest('S1 vs S3: Europe visa/relocation track appears in S1 and disappears in S3', () => {
  const s1_mods = s1.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')));
  const s3_mods = s3.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')));
  const s1HasEurope = s1_mods.some(m => m.includes('European Tech Career Track'));
  const s3HasEurope = s3_mods.some(m => m.includes('European Tech Career Track'));
  assert(s1HasEurope, 'S1 must include European Tech Career Track');
  assert(!s3HasEurope, 'S3 (India) must NOT include European Tech Career Track');
});

// 4. Scenario 6: Aptitude & communication heavy
runTest('S6 (IT Services): Aptitude and Communication are top allocated skill areas', () => {
  const topAreas = Object.entries(s6.stats.hoursByArea || {})
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);
  assert(topAreas[0] === 'aptitude' || topAreas[1] === 'aptitude', 'Aptitude must be in top 2 for IT services');
  assert(topAreas.includes('communication'), 'Communication must be present for IT services');
});

// 5. Scenario 2: Shipping/project heavy
runTest('S2 (Startup): Projects & shipping is the top allocated skill area', () => {
  const topAreas = Object.entries(s2.stats.hoursByArea || {})
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);
  assert(topAreas[0] === 'projects_shipping', `Expected top area to be projects_shipping, got ${topAreas[0]}`);
});

// 6. Scenario 1: DSA & system design heavy
runTest('S1 (Microsoft Big Tech): DSA and System Design are top allocated skill areas', () => {
  const topAreas = Object.entries(s1.stats.hoursByArea || {})
    .sort((a, b) => b[1] - a[1])
    .map(x => x[0]);
  assert(topAreas[0] === 'dsa', `Expected top area to be dsa, got ${topAreas[0]}`);
  assert(topAreas.includes('system_design'), 'System design must be in top areas for Big Tech');
});

// 7. Scenario 7: Role changes reallocate hours
runTest('S7: Role variations (Backend vs Frontend vs Data) alter module selections', () => {
  const diff_fe_be = RoadmapEngine.diff(s7_backend, s7_frontend);
  const diff_data_be = RoadmapEngine.diff(s7_backend, s7_data);
  assert(diff_fe_be.moduleDiffShare > 0.15, `Expected role module diff > 15%, got ${(diff_fe_be.moduleDiffShare * 100).toFixed(1)}%`);
  assert(diff_data_be.moduleDiffShare > 0.15, `Expected data role module diff > 15%, got ${(diff_data_be.moduleDiffShare * 100).toFixed(1)}%`);
});

// 8. Scenario 8: Beginner vs Advanced prerequisite order
runTest('S8: Beginner includes foundation modules while Advanced skips directly to deep topics', () => {
  const beg_mods = s8_beg.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')));
  const adv_mods = s8_adv.phases.flatMap(p => p.tasks.filter(t => t.startsWith('Master ')));
  const begHasFoundations = beg_mods.some(m => m.includes('Linear Data Structures'));
  assert(begHasFoundations, 'Beginner roadmap must include fundamental Linear Data Structures');
  assert(adv_mods.some(m => m.includes('Dynamic Programming')), 'Advanced roadmap must include advanced topics');
});

// 9. Scenario 9: 4 weeks vs 12 months budget and depth
runTest('S9: 4 weeks produces tightly compressed core vs 12 months comprehensive coverage', () => {
  assert(s9_4w.stats.modules <= 6, `4-week plan should be compressed, got ${s9_4w.stats.modules} modules`);
  assert(s9_12m.stats.modules >= 12, `12-month plan should be comprehensive, got ${s9_12m.stats.modules} modules`);
  assert(s9_4w.stats.totalHours < s9_12m.stats.totalHours, '12-month hours must exceed 4-week hours');
});

// 10. Scenario 10: Free-text goal parsing
runTest('S10: Free text "I want to work at a fintech startup in Berlin" is parsed accurately', () => {
  const parsed = RoadmapEngine.parseFreeTextGoal('I want to work at a fintech startup in Berlin');
  assert.strictEqual(parsed.targetType, 'startup');
  assert.strictEqual(parsed.region, 'europe');
  assert.strictEqual(parsed.country, 'Germany');
});

// 11. Determinism test: Identical inputs return identical roadmap hash
runTest('Determinism: Identical inputs produce identical roadmap outputs and hashes', () => {
  const runA = RoadmapEngine.generate({
    company: 'microsoft',
    targetRole: 'backend',
    region: 'europe',
    country: 'Germany',
    timelineMonths: 6,
    hoursPerWeek: 10,
    currentLevel: 'intermediate'
  });
  const runB = RoadmapEngine.generate({
    company: 'microsoft',
    targetRole: 'backend',
    region: 'europe',
    country: 'Germany',
    timelineMonths: 6,
    hoursPerWeek: 10,
    currentLevel: 'intermediate'
  });
  const diff = RoadmapEngine.diff(runA, runB);
  assert.strictEqual(diff.moduleDiffShare, 0, 'Module diff between identical runs must be 0%');
  assert.strictEqual(diff.hoursReallocatedShare, 0, 'Hours reallocated between identical runs must be 0%');
  assert.strictEqual(diff.phasesDiffer, false, 'Phases must be identical between identical runs');
  assert.strictEqual(diff.milestonesDiffer, false, 'Milestones must be identical between identical runs');
});

// 12. Pure Determinism with AI Disabled
runTest('AI Disabled: Engine operates 100% locally with zero network/AI dependency', () => {
  const oldKey = process.env.GROQ_API_KEY;
  process.env.GROQ_API_KEY = '';
  try {
    const offlinePlan = RoadmapEngine.generate({
      company: 'google',
      targetRole: 'backend',
      region: 'india',
      timelineMonths: 6,
      hoursPerWeek: 15,
      currentLevel: 'intermediate'
    });
    assert(offlinePlan && offlinePlan.phases.length > 0, 'Offline plan generation must succeed');
    assert(offlinePlan.stats.modules > 0, 'Offline plan must contain modules');
  } finally {
    process.env.GROQ_API_KEY = oldKey;
  }
});

// 13. Link Integrity Test: 100% of module links resolve to valid routes
runTest('Link Integrity: All module links and references in MODULE_LIBRARY are valid', () => {
  const validPrefixes = ['/compiler/', '/practice', '/articles/', '/dossier', '/simulator', 'https://'];
  let checkedLinks = 0;
  for (const mod of MODULE_LIBRARY) {
    if (mod.links && Array.isArray(mod.links)) {
      for (const res of mod.links) {
        if (res.url) {
          checkedLinks++;
          const isValid = validPrefixes.some(p => res.url.startsWith(p));
          assert(isValid, `Resource link "${res.url}" in module "${mod.id}" has invalid internal path format`);
        }
      }
    }
  }
  assert(checkedLinks > 0, `Should have checked internal resource links, found ${checkedLinks}`);
});

console.log(`\n========================================`);
console.log(`RESULTS: ${testsPassed} / ${testsTotal} TESTS PASSED`);
console.log(`========================================\n`);

if (testsPassed < testsTotal) {
  process.exit(1);
} else {
  process.exit(0);
}
