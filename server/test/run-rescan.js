const http = require('http');

async function testRescan() {
    console.log("=== PHASE 0 RE-SCAN AFTER MIGRATION ===");
    
    // 1. Sign up a new user to authenticate
    const email = `rescan-${Date.now()}@example.com`;
    const signupData = JSON.stringify({
        name: 'Rescan Auditor',
        email,
        password: 'Password123!',
        agreedToTerms: true
    });

    const cookie = await new Promise((resolve) => {
        const req = http.request('http://127.0.0.1:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(signupData)
            }
        }, (res) => {
            const cookies = res.headers['set-cookie'];
            resolve(cookies ? cookies[0].split(';')[0] : '');
        });
        req.write(signupData);
        req.end();
    });

    // 2. Fetch problem list
    const catalogRes = await new Promise((resolve) => {
        const req = http.request('http://127.0.0.1:3000/api/compiler/problems', {
            headers: { 'Cookie': cookie }
        }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => resolve(JSON.parse(data)));
        });
        req.end();
    });

    console.log(`Published problems in catalog: ${catalogRes.problems.length}`);

    let totalLeaks = 0;

    for (const p of catalogRes.problems) {
        // Fetch full problem details
        const prob = await new Promise((resolve) => {
            const req = http.request(`http://127.0.0.1:3000/api/compiler/problems/${p.id}`, {
                headers: { 'Cookie': cookie }
            }, (res) => {
                let data = '';
                res.on('data', c => data += c);
                res.on('end', () => resolve(JSON.parse(data)));
            });
            req.end();
        });

        const leaks = [];

        // Check for leaked private fields
        ['testCases', 'hiddenTestCases', 'solution', 'editorial', 'referenceSolutions'].forEach(field => {
            if (prob[field] !== undefined) {
                leaks.push(`Private field present: ${field}`);
            }
        });

        // Check starterCode for algorithms/loops
        if (prob.starterCode) {
            for (const [lang, code] of Object.entries(prob.starterCode)) {
                if (/for\s*\(|while\s*\(|seen\[|\.set\(|\.map\(|\.find\(|\.containsKey|unordered_map|seen\s*=/.test(code)) {
                    leaks.push(`Starter code has algorithm logic in ${lang}`);
                }
            }
        }

        if (leaks.length > 0) {
            console.error(`❌ LEAK FOUND in problem ${p.id}:`, leaks);
            totalLeaks += leaks.length;
        } else {
            console.log(`✅ [CLEAN] Problem ${p.id} (${p.title}): Zero leaks. Starter code contains skeleton only.`);
        }
    }

    console.log(`\n==============================================`);
    console.log(`TOTAL LEAKS DETECTED: ${totalLeaks}`);
    console.log(`==============================================`);
}

testRescan();
