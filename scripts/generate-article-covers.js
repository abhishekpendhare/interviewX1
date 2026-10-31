/**
 * STRATA Article Cover SVG Generator
 * Generates local, ultra-fast, responsive SVG covers for all 24 journal articles.
 */

const fs = require('fs');
const path = require('path');

const targetDirs = [
    path.resolve(__dirname, '../client/public/assets/articles/covers'),
    path.resolve(__dirname, '../client/dist/assets/articles/covers')
];

for (const dir of targetDirs) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

const ARTICLES = [
    { slug: 'sliding-window-pattern-guide', cat: 'PREP GUIDES', title: 'Sliding Window Patterns', color: '#00E5FF' },
    { slug: 'mastering-two-pointer-invariants', cat: 'PREP GUIDES', title: 'Two-Pointer Invariants', color: '#00E5FF' },
    { slug: 'sql-joins-practice-queries', cat: 'PREP GUIDES', title: 'SQL Joins & Queries', color: '#00E5FF' },
    { slug: 'os-deadlocks-interview-guide', cat: 'PREP GUIDES', title: 'OS Deadlock Detection', color: '#00E5FF' },
    { slug: 'anatomy-big-tech-coding-interview', cat: 'INTERVIEW GUIDES', title: 'Big-Tech Interview Loop', color: '#A855F7' },
    { slug: 'it-services-hiring-rounds-guide', cat: 'INTERVIEW GUIDES', title: 'IT Services Hiring Rounds', color: '#A855F7' },
    { slug: 'startup-interviews-takehomes-guide', cat: 'INTERVIEW GUIDES', title: 'Startup Take-Homes', color: '#A855F7' },
    { slug: 'behavioral-interviews-star-method', cat: 'INTERVIEW GUIDES', title: 'STAR Behavioral Method', color: '#A855F7' },
    { slug: 'fresher-resume-recruiters-skim', cat: 'CAREER', title: '15-Second Fresher Resume', color: '#10B981' },
    { slug: 'linkedin-github-campus-placements', cat: 'CAREER', title: 'LinkedIn & GitHub Strategy', color: '#10B981' },
    { slug: 'offer-letters-ctc-vs-inhand', cat: 'CAREER', title: 'CTC vs In-Hand Salary', color: '#10B981' },
    { slug: 'working-in-europe-fresher-guide', cat: 'CAREER', title: 'Working in Europe: Visas', color: '#10B981' },
    { slug: 'spring-boot-controller-to-database', cat: 'TECH EXPLAINERS', title: 'Spring Boot Architecture', color: '#F59E0B' },
    { slug: 'java-collections-cheat-sheet', cat: 'TECH EXPLAINERS', title: 'Java Collections Internals', color: '#F59E0B' },
    { slug: 'system-design-load-balancers-caches', cat: 'TECH EXPLAINERS', title: 'Load Balancers & Caches', color: '#F59E0B' },
    { slug: 'git-workflows-student-projects', cat: 'TECH EXPLAINERS', title: 'Git Workflows for Teams', color: '#F59E0B' },
    { slug: 'tech-hiring-trends-2026-campus', cat: 'HIRING UPDATES', title: '2026 Campus Hiring Trends', color: '#EC4899' },
    { slug: 'gcc-hiring-boom-india-2026', cat: 'HIRING UPDATES', title: 'GCC Hiring Boom in India', color: '#EC4899' },
    { slug: 'ai-tools-software-engineering-2026', cat: 'HIRING UPDATES', title: 'AI Tools in Modern Dev', color: '#EC4899' },
    { slug: 'cloud-distributed-systems-skills-2026', cat: 'HIRING UPDATES', title: 'Cloud & Distributed Skills', color: '#EC4899' },
    { slug: 'voice-mock-interview-real-time-scoring', cat: 'PLATFORM UPDATES', title: 'Voice Mock Simulator', color: '#E02B20' },
    { slug: 'sandboxed-compiler-hidden-test-suites', cat: 'PLATFORM UPDATES', title: 'Sandboxed Code Judge', color: '#E02B20' },
    { slug: 'interactive-ai-study-roadmaps', cat: 'PLATFORM UPDATES', title: 'AI Personalized Roadmaps', color: '#E02B20' },
    { slug: 'company-targeted-prep-sheets', cat: 'PLATFORM UPDATES', title: '3,555+ Company Sheets', color: '#E02B20' }
];

function generateSvg({ cat, title, color }) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675" width="1200" height="675">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#080C14" />
      <stop offset="50%" stop-color="#0E1624" />
      <stop offset="100%" stop-color="#060910" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color}" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    </pattern>
  </defs>

  <rect width="1200" height="675" fill="url(#bg)" />
  <rect width="1200" height="675" fill="url(#grid)" />

  <!-- Ambient glow circle -->
  <circle cx="950" cy="200" r="280" fill="${color}" opacity="0.12" filter="blur(60px)" />
  <circle cx="200" cy="500" r="220" fill="${color}" opacity="0.08" filter="blur(50px)" />

  <!-- Decorative Circuit lines -->
  <path d="M 800 100 L 1050 250 L 1150 250" fill="none" stroke="${color}" stroke-width="2" opacity="0.3" />
  <circle cx="1050" cy="250" r="4" fill="${color}" opacity="0.6" />
  <circle cx="800" cy="100" r="4" fill="${color}" opacity="0.6" />

  <path d="M 750 500 L 950 400 L 1100 400" fill="none" stroke="${color}" stroke-width="2" opacity="0.25" />
  <circle cx="950" cy="400" r="4" fill="${color}" opacity="0.5" />

  <!-- Top Brand bar -->
  <rect x="80" y="70" width="10" height="10" fill="${color}" />
  <text x="105" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="14" font-weight="700" letter-spacing="4" fill="#94A3B8">STRATA // ENGINEERING JOURNAL</text>

  <!-- Category Tag -->
  <rect x="80" y="140" width="180" height="34" rx="4" fill="rgba(255,255,255,0.04)" stroke="${color}" stroke-width="1.5" />
  <text x="96" y="162" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="12" font-weight="800" letter-spacing="2.5" fill="${color}">${cat}</text>

  <!-- Title -->
  <text x="80" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="800" fill="#FFFFFF" letter-spacing="-1">${title}</text>
  <rect x="80" y="310" width="140" height="4" fill="${color}" />

  <!-- Subtitle telemetry text -->
  <text x="80" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="16" fill="#64748B" letter-spacing="1.5">TELEMETRY ARCHIVE // VERIFIED TECHNICAL CURRICULUM</text>
  <text x="80" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace" font-size="14" fill="#475569">AUTHORED BY INTERVIEWX EDITORIAL TEAM • 31 OCT 2026</text>

  <!-- Bottom Accent bar -->
  <rect x="0" y="665" width="1200" height="10" fill="url(#accent)" />
</svg>`;
}

for (const a of ARTICLES) {
    const svgContent = generateSvg(a);
    for (const dir of targetDirs) {
        fs.writeFileSync(path.join(dir, `${a.slug}.svg`), svgContent);
    }
}

// Generate default cover
const defaultSvg = generateSvg({ cat: 'TECHNICAL JOURNAL', title: 'InterviewX Engineering', color: '#00E5FF' });
for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, 'default.svg'), defaultSvg);
}

console.log(`Generated ${ARTICLES.length} SVG article covers in ${targetDirs.length} locations.`);
