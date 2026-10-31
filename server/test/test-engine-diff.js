const RoadmapEngine = require('../services/roadmapEngine');

const goalA = {
  targetRole: 'Software Engineer',
  companyType: 'big_tech',
  company: 'microsoft',
  region: 'europe',
  country: 'Germany',
  timelineMonths: 6,
  hoursPerWeek: 10,
  currentLevel: 'intermediate',
  skills: ['DSA', 'OOP']
};

const goalB = {
  targetRole: 'Software Engineer',
  companyType: 'startup',
  region: 'india',
  country: 'India',
  timelineMonths: 3,
  hoursPerWeek: 15,
  currentLevel: 'intermediate',
  skills: ['React', 'Node.js']
};

const resA = RoadmapEngine.generate(goalA);
const resB = RoadmapEngine.generate(goalB);

console.log("=== ROADMAP A ===");
console.log("Title:", resA.title);
console.log("Stats:", resA.stats);
console.log("Phases:", resA.phases.map(p => ({ name: p.name, tasksCount: p.tasks.length, milestone: p.milestone })));

console.log("\n=== ROADMAP B ===");
console.log("Title:", resB.title);
console.log("Stats:", resB.stats);
console.log("Phases:", resB.phases.map(p => ({ name: p.name, tasksCount: p.tasks.length, milestone: p.milestone })));

const diff = RoadmapEngine.diff(resA, resB);
console.log("\n=== DIFF METRICS ===");
console.log(diff);
