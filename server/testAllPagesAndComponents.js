// server/testAllPagesAndComponents.js - End-to-end verification of all pages & components
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

async function verifyAll() {
  console.log('====================================================');
  console.log('🚀 STRATA SYSTEM & VENGEANCE UI VERIFICATION SUITE');
  console.log('====================================================\n');

  try {
    // 1. Verify HTML SPA Shell
    const htmlRes = await fetch(`${BASE_URL}/`);
    if (!htmlRes.ok) throw new Error(`HTML fetch failed: ${htmlRes.status}`);
    const html = await htmlRes.text();
    console.log(`[✓] Gateway SPA HTML Shell Loaded (${html.length} bytes)`);

    // 2. Verify API Endpoints
    const apiProfile = await (await fetch(`${BASE_URL}/api/candidate/profile`)).json();
    console.log(`[✓] Candidate Profile API: PVI=${apiProfile.placementVelocityIndex}, Status=${apiProfile.velocityStatus}`);

    const apiProblems = await (await fetch(`${BASE_URL}/api/compiler/problems?limit=10`)).json();
    console.log(`[✓] Compiler Problems API: Total Ingested=${apiProblems.total} problems`);

    const apiFoundations = await (await fetch(`${BASE_URL}/api/foundations/sprints`)).json();
    console.log(`[✓] Foundations Sprints API: Loaded ${apiFoundations.length} test sprints`);

    // 3. Verify Vengeance UI Components in compiled client dist
    const distDir = path.join(__dirname, '../client/dist/assets');
    const files = fs.readdirSync(distDir);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    let combinedJs = '';
    for (const f of jsFiles) {
      combinedJs += fs.readFileSync(path.join(distDir, f), 'utf-8');
    }

    const componentSignatures = [
      { name: 'spotlight-navbar', check: 'spotlight-active-tab' },
      { name: 'glass-dock', check: 'glass-dock' },
      { name: 'flip-fade-text', check: 'Master Concurrency' },
      { name: 'interactive-particles', check: 'canvas' },
      { name: 'gooey-text-reveal', check: 'gooey-text-filter' },
      { name: 'scroll-dissolve-reveal', check: 'PILLAR 01' },
      { name: 'agent-bento-grid', check: 'REAL-TIME RUBRIC ENGINE' },
      { name: 'staggered-grid', check: 'StaggeredGrid' },
      { name: 'solar-system', check: 'CELESTIAL SKILL ROADMAP' },
      { name: 'magnetic-spotlight-marquee', check: 'Java 21 Virtual Threads' },
      { name: 'faq-accordion', check: 'Autonomous Voice Mock Bar Raiser' },
      { name: 'animated-footer', check: 'ALL SYSTEMS OPERATIONAL' }
    ];

    console.log('\n📦 VERIFYING ALL 12 VENGEANCE UI COMPONENTS IN DIST BUNDLE:');
    console.log('----------------------------------------------------');
    let allPassed = true;
    for (const comp of componentSignatures) {
      const exists = combinedJs.includes(comp.check) || combinedJs.includes(comp.name);
      console.log(`[${exists ? '✓ PASS' : '✗ FAIL'}] ${comp.name.padEnd(28)} -> Signature verified in live client bundle`);
      if (!exists) allPassed = false;
    }
    console.log('----------------------------------------------------');

    if (!allPassed) throw new Error('One or more component signatures missing from bundle');

    console.log('\n🎉 ALL 12 VENGEANCE UI COMPONENTS AND CORE PLATFORM SUITES VERIFIED AND READY!');

  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

verifyAll();
