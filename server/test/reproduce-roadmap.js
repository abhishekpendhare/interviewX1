const http = require('http');
const fs = require('fs');

function post(path, body, cookie = '') {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request('http://localhost:3000' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...(cookie ? { 'Cookie': cookie } : {})
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed
        });
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('=== PHASE 0: REPRODUCING ROADMAP DUPLICATION BUG ===\n');

  // 1. Authenticate user
  const userEmail = `repro-${Date.now()}@example.com`;
  const signup = await post('/api/auth/signup', {
    name: 'Repro Student',
    email: userEmail,
    password: 'Password123!Safe'
  });
  const cookie = signup.headers['set-cookie'][0].split(';')[0];
  console.log('Authenticated session token established.');

  // Goal A: Microsoft, software engineer, Europe
  const goalA = {
    targetRole: 'Software Engineer',
    companyType: 'FAANG/Big Tech',
    company: 'Microsoft',
    region: 'Europe',
    timelineMonths: 6,
    gradYear: '3rd year',
    skills: ['DSA', 'OOP']
  };

  // Goal B: join a startup, India only
  const goalB = {
    targetRole: 'Software Engineer',
    companyType: 'Early Startup',
    company: 'Stealth Startup',
    region: 'India',
    timelineMonths: 6,
    gradYear: '3rd year',
    skills: ['React', 'Node.js']
  };

  console.log('\n--- Requesting Goal A ---');
  console.log('Payload A:', JSON.stringify(goalA, null, 2));
  const resA = await post('/api/planner/generate', goalA, cookie);

  console.log('\n--- Requesting Goal B ---');
  console.log('Payload B:', JSON.stringify(goalB, null, 2));
  const resB = await post('/api/planner/generate', goalB, cookie);

  const roadmapA = resA.body?.roadmapRecord?.roadmap;
  const roadmapB = resB.body?.roadmapRecord?.roadmap;

  console.log('\n=== OUTPUT COMPARISON ===');
  console.log('Roadmap A Title:', roadmapA?.title);
  console.log('Roadmap B Title:', roadmapB?.title);

  console.log('\nRoadmap A Phases count:', roadmapA?.phases?.length);
  console.log('Roadmap B Phases count:', roadmapB?.phases?.length);

  for (let i = 0; i < (roadmapA?.phases?.length || 0); i++) {
    const pA = roadmapA.phases[i];
    const pB = roadmapB.phases[i];
    console.log(`\nPhase ${i + 1}:`);
    console.log(`  A Name: "${pA.name}"`);
    console.log(`  B Name: "${pB.name}"`);
    console.log(`  Name Match? ${pA.name === pB.name}`);
    console.log(`  A Focus: "${pA.focus}"`);
    console.log(`  B Focus: "${pB.focus}"`);
    console.log(`  Focus Match? ${pA.focus === pB.focus}`);
    console.log(`  A Tasks count: ${pA.tasks?.length}, B Tasks count: ${pB.tasks?.length}`);
    console.log(`  Tasks identical? ${JSON.stringify(pA.tasks) === JSON.stringify(pB.tasks)}`);
    console.log(`  Resources identical? ${JSON.stringify(pA.resources) === JSON.stringify(pB.resources)}`);
  }

  // Compare raw phase arrays
  const phasesAJson = JSON.stringify(roadmapA?.phases);
  const phasesBJson = JSON.stringify(roadmapB?.phases);
  console.log('\n>>> ARE ALL PHASES, TASKS, AND RESOURCES 100% IDENTICAL? <<<');
  console.log(`Result: ${phasesAJson === phasesBJson ? 'YES (BUG CONFIRMED)' : 'NO'}`);
}

run().catch(console.error);
