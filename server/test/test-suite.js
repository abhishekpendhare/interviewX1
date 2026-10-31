/**
 * InterviewX Verification Test Suite
 * Automated tests for security gates, educational content, execution engines, and core APIs.
 */

const http = require('http');

const DEFAULT_PORT = process.env.PORT || 3000;
let BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
let ephemeralServer = null;

async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const reqOpts = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = http.request(reqOpts, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed
                });
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function ensureServerRunning() {
    try {
        const isUp = await new Promise((resolve) => {
            const ping = http.get(`http://127.0.0.1:${DEFAULT_PORT}/api/status`, { timeout: 600 }, (res) => {
                resolve(res.statusCode === 200);
            });
            ping.on('error', () => resolve(false));
            ping.on('timeout', () => {
                ping.destroy();
                resolve(false);
            });
        });

        if (isUp) {
            BASE_URL = `http://127.0.0.1:${DEFAULT_PORT}`;
            return;
        }
    } catch {
        // Fall back to booting ephemeral instance
    }

    const app = require('../index');
    await new Promise((resolve) => {
        ephemeralServer = app.listen(0, '127.0.0.1', () => {
            const port = ephemeralServer.address().port;
            BASE_URL = `http://127.0.0.1:${port}`;
            resolve();
        });
    });
}

async function runTests() {
    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  ✓ ${message}`);
            passed++;
        } else {
            console.error(`  ❌ FAILED: ${message}`);
            failed++;
        }
    }

    await ensureServerRunning();
    console.log(`🧪 Starting InterviewX Test Suite against ${BASE_URL}...\n`);

    // TEST 1: Two Sum Problem Specification
    console.log('[Suite 1] Algorithmic Problem Specifications');
    try {
        const res = await request('/api/compiler/problems/two-sum');
        assert(res.status === 200, 'GET /api/compiler/problems/two-sum returns 200');
        assert(res.body.title === 'Two Sum', 'Problem title is "Two Sum"');
        assert(res.body.examples && res.body.examples.length >= 3, 'Contains at least 3 concrete examples');
        assert(res.body.examples[0].input.includes('target'), 'Example 1 has concrete nums and target');
        assert(res.body.examples[0].output === '[0,1]' || res.body.examples[0].output === '[0, 1]', 'Example 1 output is indices [0,1]');
        assert(Array.isArray(res.body.constraints) && res.body.constraints.length >= 3, 'Contains formal asymptotic constraints');
        assert(res.body.constraints.some(c => c.includes('nums.length')), 'Constraints include array length bounds');
    } catch (err) {
        assert(false, `Two Sum test error: ${err.message}`);
    }

    // TEST 2: Problem Catalog for Guest Users
    console.log('\n[Suite 2] Guest Problem Directory Access');
    try {
        const res = await request('/api/compiler/problems?page=1&limit=10');
        assert(res.status === 200, 'GET /api/compiler/problems returns 200 for anonymous guests');
        assert(res.body.total >= 100, `Catalog contains ingested problem library (found ${res.body.total})`);
        assert(res.body.problems && res.body.problems.length > 0, 'Returns paginated problem list');
        assert(res.body.problems.every(p => p.isSolved === false), 'Guest users have isSolved=false (no data leak)');

        // Verify no duplicate categories (case-insensitive)
        const lowerSeen = new Set();
        let hasDuplicates = false;
        for (const cat of res.body.categories) {
            const lower = cat.toLowerCase().trim();
            if (lowerSeen.has(lower)) {
                hasDuplicates = true;
                break;
            }
            lowerSeen.add(lower);
        }
        assert(!hasDuplicates, 'Code Arena topic filter contains zero duplicate categories');
        assert(res.body.categories.includes('Greedy'), 'Contains canonical "Greedy" topic');
        assert(!res.body.categories.includes('GREEDY'), 'Raw uppercase "GREEDY" is normalized to "Greedy"');

        // Verify case-insensitive filtering returns matching problems
        const greedyRes = await request('/api/compiler/problems?category=Greedy');
        const greedyCapsRes = await request('/api/compiler/problems?category=GREEDY');
        assert(greedyRes.status === 200 && greedyCapsRes.status === 200, 'Filtering by category returns 200');
        assert(greedyRes.body.total > 0, 'Filtering by "Greedy" returns problems');
        assert(greedyRes.body.total === greedyCapsRes.body.total, 'Filtering by "Greedy" and "GREEDY" returns identical problem counts');
    } catch (err) {
        assert(false, `Problem catalog test error: ${err.message}`);
    }

    // TEST 3: Unauthenticated Data Protection
    console.log('\n[Suite 3] Private Student Data Protection');
    const protectedEndpoints = [
        '/api/candidate/profile',
        '/api/advisor/conversation',
        '/api/advisor/briefing',
        '/api/analytics/profile',
        '/api/auth/me'
    ];

    for (const ep of protectedEndpoints) {
        try {
            const res = await request(ep);
            assert(res.status === 401, `${ep} returns 401 Unauthorized for unauthenticated requests`);
        } catch (err) {
            assert(false, `${ep} protection check error: ${err.message}`);
        }
    }

    // TEST 4: Sign-up Field Validation Order
    console.log('\n[Suite 4] Authentication & Sign-Up Validation');
    try {
        const emptySignup = await request('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {}
        });
        assert(emptySignup.status === 400, 'Submitting empty sign-up form returns 400');
        assert(
            emptySignup.body.error === 'Name, email, and password are required.',
            'Empty sign-up reports missing credentials before terms agreement'
        );
    } catch (err) {
        assert(false, `Sign-up validation error: ${err.message}`);
    }

    // TEST 5: Guest Roadmap Generation
    console.log('\n[Suite 5] Career Roadmap Planning');
    try {
        const guestGet = await request('/api/planner');
        assert(guestGet.status === 200, 'GET /api/planner returns 200 for guest');
        assert(guestGet.body.roadmapRecord === null, 'Guest roadmapRecord is null (no shared state leak)');

        const guestPost = await request('/api/planner/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                targetRole: 'Software Engineer',
                companyType: 'FAANG/Big Tech',
                region: 'India',
                timelineMonths: 6,
                gradYear: '3rd year',
                skills: ['DSA', 'System Design']
            }
        });
        assert(guestPost.status === 200, 'POST /api/planner/generate succeeds for guest preview');
        assert(guestPost.body.isGuest === true, 'Returns isGuest: true without database persistence');
        assert(guestPost.body.roadmapRecord?.roadmap?.phases?.length > 0, 'Generates valid roadmap phases');
    } catch (err) {
        assert(false, `Roadmap planning error: ${err.message}`);
    }

    // TEST 6: Static SPA & Legal Policy Routes
    console.log('\n[Suite 6] SPA Routes & Legal Policy Delivery');
    const spaRoutes = ['/', '/terms', '/privacy', '/honor-code', '/compiler'];
    for (const route of spaRoutes) {
        try {
            const res = await request(route);
            assert(res.status === 200, `${route} serves SPA (200 OK)`);
        } catch (err) {
            assert(false, `${route} delivery error: ${err.message}`);
        }
    }

    // TEST 7: Telemetry & Judge0 Configuration
    console.log('\n[Suite 7] System Health & Judge0 Execution Configuration');
    try {
        const statusRes = await request('/api/status');
        assert(statusRes.status === 200, 'GET /api/status returns 200 OK');
        assert(statusRes.body.status === 'ONLINE', 'System status reports ONLINE');
        assert(statusRes.body.version === '3.2.0', 'Version label is consistent semantic 3.2.0 (no conflicting PROD tag in dev)');
        assert(typeof statusRes.body.environment === 'string', `Environment reported accurately: ${statusRes.body.environment}`);
        assert(statusRes.body.judge0 && statusRes.body.judge0.configured === true, 'judge0.configured is TRUE');
        assert(typeof statusRes.body.judge0.provider === 'string', `Execution provider configured: ${statusRes.body.judge0?.provider}`);
    } catch (err) {
        assert(false, `System status test error: ${err.message}`);
    }

    // TEST 8: Live Code Execution & Submission Verification
    console.log('\n[Suite 8] Sandboxed Code Execution & Test Evaluation');
    try {
        const testUserEmail = `coder_${Date.now()}@test.internal`;
        const signupRes = await request('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                name: 'Algorithmic Tester',
                email: testUserEmail,
                password: 'ValidPassword123!',
                termsAgreed: true
            }
        });
        assert(signupRes.status === 201 || signupRes.status === 200, 'Candidate sign-up successful for code execution verification');

        const rawCookies = signupRes.headers['set-cookie'] || [];
        const authCookie = Array.isArray(rawCookies) ? rawCookies.map(c => c.split(';')[0]).join('; ') : '';

        // 8a. Run correct Two Sum algorithm
        const validCode = `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff), i];
        map.set(nums[i], i);
    }
    return [];
}`;

        const runValidRes = await request('/api/compiler/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: {
                problemId: 'two-sum',
                language: 'javascript',
                code: validCode
            }
        });
        assert(runValidRes.status === 200, 'POST /api/compiler/run returns 200');
        assert(runValidRes.body.status === 'Accepted', 'Correct Two Sum code is Accepted on sample test case');
        assert(runValidRes.body.allPassed === true, 'allPassed is true for sample test case');

        // 8b. Run incorrect Two Sum algorithm
        const wrongCode = `function twoSum(nums, target) {
    return [999, 999];
}`;

        const runWrongRes = await request('/api/compiler/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: {
                problemId: 'two-sum',
                language: 'javascript',
                code: wrongCode
            }
        });
        assert(runWrongRes.status === 200, 'POST /api/compiler/run with wrong code returns 200');
        assert(runWrongRes.body.status === 'Wrong Answer', 'Incorrect code evaluates to "Wrong Answer" (not unconfigured error)');
        assert(runWrongRes.body.allPassed === false, 'allPassed is false for incorrect output');

        // 8c. Submit solution to full test suite
        const submitRes = await request('/api/compiler/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': authCookie
            },
            body: {
                problemId: 'two-sum',
                language: 'javascript',
                code: validCode,
                approachText: 'I used a single pass hash map to store seen values and check for the complement in O(n) time and O(n) space.'
            }
        });
        assert(submitRes.status === 200, 'POST /api/compiler/submit returns 200');
        assert(submitRes.body.status === 'Accepted', 'Full test suite evaluation marks submission Accepted');
        assert(submitRes.body.passedTestCases === submitRes.body.totalTestCases && submitRes.body.totalTestCases >= 3, `All ${submitRes.body.totalTestCases} Two Sum test cases passed`);
        assert(submitRes.body.approachReviewed === true, 'AI approach reflection analyzer evaluated candidate write-up');
    } catch (err) {
        assert(false, `Code execution test error: ${err.message}`);
    }

    // TEST 9: Security Headers & Public Contact Abuse Protection
    console.log('\n[Suite 9] Security Headers & Contact Rate Limit');
    try {
        const headersRes = await request('/api/status');
        assert(headersRes.headers['x-content-type-options'] === 'nosniff', 'Responses include nosniff content-type protection');
        assert(headersRes.headers['x-frame-options'] === 'DENY', 'Responses deny framing to reduce clickjacking risk');
        assert(headersRes.headers['referrer-policy'] === 'strict-origin-when-cross-origin', 'Responses set a restrictive referrer policy');
        assert(!headersRes.headers['x-powered-by'], 'Express product header is disabled');

        let finalContactAttempt;
        for (let attempt = 0; attempt < 21; attempt++) {
            finalContactAttempt = await request('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: {}
            });
        }
        assert(finalContactAttempt.status === 429, 'Public contact intake limits repeated requests without saving invalid messages');
    } catch (err) {
        assert(false, `Security check error: ${err.message}`);
    }

    // CLEANUP
    if (ephemeralServer) {
        await new Promise(r => ephemeralServer.close(r));
    }

    // SUMMARY
    console.log('\n=======================================');
    console.log(`Test Results: ${passed} passed, ${failed} failed`);
    console.log('=======================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

// Execute tests
runTests().catch(err => {
    console.error('Fatal test runner error:', err);
    if (ephemeralServer) ephemeralServer.close();
    process.exit(1);
});
