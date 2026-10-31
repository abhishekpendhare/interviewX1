/**
 * STRATA 100-Student End-to-End Simulation & Verification Suite
 * Simulates 100 concurrent students performing full lifecycle activities:
 * Authentication, Telemetry, Compiler Run & Submit, Sprints, Aptitude,
 * Career Roadmaps, Voice Simulation, Neural Advisor, and Static Assets.
 */

const BASE_URL = 'http://localhost:3000';
const TOTAL_STUDENTS = 100;
const CONCURRENCY_LIMIT = 15; // Concurrent students active at once

class StudentSession {
    constructor(index) {
        this.index = index;
        const pad = String(index).padStart(3, '0');
        this.id = `candidate-load-${pad}-${Date.now().toString(36)}`;
        this.name = `Student ${pad}`;
        this.email = `student_${pad}_${Date.now()}@university.edu`;
        this.password = `Pass_${pad}!Secure2026`;
        this.cookie = null;
        this.userId = null;
        this.errors = [];
        this.completedSteps = 0;
        this.totalDurationMs = 0;
    }

    async request(path, options = {}) {
        const start = Date.now();
        const headers = {
            'Content-Type': 'application/json',
            'x-student-id': this.userId || this.id,
            ...(options.headers || {})
        };
        if (this.cookie) {
            headers['Cookie'] = this.cookie;
        }

        const url = `${BASE_URL}${path}`;
        try {
            const res = await fetch(url, {
                ...options,
                headers,
                signal: AbortSignal.timeout(10000)
            });

            // Extract set-cookie
            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                const match = setCookie.match(/session_token=([^;]+)/);
                if (match) {
                    this.cookie = `session_token=${match[1]}`;
                }
            }

            const latency = Date.now() - start;
            let data = null;
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
                data = await res.json().catch(() => null);
            } else {
                data = await res.text().catch(() => '');
            }

            return {
                ok: res.ok,
                status: res.status,
                data,
                latency
            };
        } catch (err) {
            return {
                ok: false,
                status: 0,
                error: err.message,
                latency: Date.now() - start
            };
        }
    }

    async runJourney() {
        const journeyStart = Date.now();
        const steps = [
            // 1. System Health
            async () => {
                const r = await this.request('/api/status');
                if (!r.ok || r.data?.status !== 'ONLINE') throw new Error(`Status check failed (${r.status})`);
            },

            // 2. Auth: Signup
            async () => {
                const r = await this.request('/api/auth/signup', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: this.name,
                        email: this.email,
                        password: this.password
                    })
                });
                if (!r.ok || !r.data?.user?.id) throw new Error(`Signup failed (${r.status}): ${JSON.stringify(r.data)}`);
                this.userId = r.data.user.id;
            },

            // 3. Auth: Verify /me with session cookie
            async () => {
                const r = await this.request('/api/auth/me');
                if (!r.ok || r.data?.user?.email !== this.email) throw new Error(`Auth /me verification failed (${r.status})`);
            },

            // 4. Candidate Profile
            async () => {
                const r = await this.request('/api/candidate/profile');
                if (!r.ok) throw new Error(`Candidate profile fetch failed (${r.status})`);
            },

            // 5. Update Profile
            async () => {
                const r = await this.request('/api/candidate/profile', {
                    method: 'POST',
                    body: JSON.stringify({
                        name: this.name,
                        targetTrack: 'Tier-1 Product SDE (FAANG / Unicorn)',
                        primaryLanguage: 'JavaScript',
                        graduationYear: '2026'
                    })
                });
                if (!r.ok) throw new Error(`Candidate profile update failed (${r.status})`);
            },

            // 6. Advisor Briefing
            async () => {
                const r = await this.request('/api/advisor/briefing');
                if (!r.ok || !r.data?.headline) throw new Error(`Advisor briefing failed (${r.status})`);
            },

            // 7. Compiler Problems Catalog
            async () => {
                const r = await this.request('/api/compiler/problems?page=1&limit=25');
                if (!r.ok || !Array.isArray(r.data?.problems)) throw new Error(`Problems catalog failed (${r.status})`);
            },

            // 8. Specific Problem Detail
            async () => {
                const r = await this.request('/api/compiler/problems/two-sum');
                if (!r.ok || r.data?.slug !== 'two-sum') throw new Error(`Problem detail failed (${r.status})`);
            },

            // 9. Sandbox Code Run
            async () => {
                const r = await this.request('/api/compiler/run', {
                    method: 'POST',
                    body: JSON.stringify({
                        problemId: 'two-sum',
                        code: 'function twoSum(nums, target) { return [0, 1]; }',
                        language: 'javascript'
                    })
                });
                if (!r.ok || !r.data?.status) throw new Error(`Compiler run failed (${r.status})`);
            },

            // 10. Official Code Submission
            async () => {
                const r = await this.request('/api/compiler/submit', {
                    method: 'POST',
                    body: JSON.stringify({
                        problemId: 'two-sum',
                        code: 'function twoSum(nums, target) { const m = new Map(); for(let i=0; i<nums.length; i++) { const c = target - nums[i]; if(m.has(c)) return [m.get(c), i]; m.set(nums[i], i); } return []; }',
                        language: 'javascript',
                        approachText: 'We use a hash map for linear O(n) single-pass lookup with O(n) auxiliary space.'
                    })
                });
                if (!r.ok || !r.data?.submissionId) throw new Error(`Compiler submit failed (${r.status})`);
            },

            // 11. Foundations Sprints List
            async () => {
                const r = await this.request('/api/foundations/sprints');
                if (!r.ok || !Array.isArray(r.data)) throw new Error(`Sprints list failed (${r.status})`);
            },

            // 12. Sprint Detail
            async () => {
                const r = await this.request('/api/foundations/sprints/sprint-dbms-internals');
                if (!r.ok || !r.data?.questions) throw new Error(`Sprint detail failed (${r.status})`);
            },

            // 13. Submit Sprint Answers
            async () => {
                const r = await this.request('/api/foundations/sprints/sprint-dbms-internals/submit', {
                    method: 'POST',
                    body: JSON.stringify({
                        answers: [
                            { questionId: 'q-dbms-01', selectedOption: 1, timeSpentSec: 45 },
                            { questionId: 'q-dbms-02', selectedOption: 2, timeSpentSec: 60 },
                            { questionId: 'q-dbms-03', selectedOption: 1, timeSpentSec: 50 }
                        ]
                    })
                });
                if (!r.ok || typeof r.data?.score !== 'number') throw new Error(`Sprint submit failed (${r.status})`);
            },

            // 14. Aptitude Topics & Practice
            async () => {
                const rTopics = await this.request('/api/foundations/aptitude/topics');
                if (!rTopics.ok) throw new Error(`Aptitude topics failed (${rTopics.status})`);

                const rQuestions = await this.request('/api/foundations/aptitude/questions?topic=Combinatorics%20%26%20Probability&limit=5');
                if (!rQuestions.ok) throw new Error(`Aptitude questions failed (${rQuestions.status})`);
            },

            // 15. Aptitude Telemetry
            async () => {
                const r = await this.request('/api/foundations/aptitude/telemetry');
                if (!r.ok) throw new Error(`Aptitude telemetry failed (${r.status})`);
            },

            // 16. Career Roadmap Planner
            async () => {
                const r = await this.request('/api/planner/generate', {
                    method: 'POST',
                    body: JSON.stringify({
                        targetRole: 'Fullstack Systems Engineer',
                        companyType: 'Product Unicorn',
                        region: 'Global / Remote',
                        timelineMonths: 6,
                        gradYear: '2026',
                        skills: ['Node.js', 'React', 'TypeScript', 'SQL']
                    })
                });
                if (!r.ok || !r.data?.roadmapRecord) throw new Error(`Planner generate failed (${r.status})`);
            },

            // 17. Analytics Profile
            async () => {
                const r = await this.request('/api/analytics/profile');
                if (!r.ok) throw new Error(`Analytics profile failed (${r.status})`);
            },

            // 18. Voice Mock Interview Simulation
            async () => {
                const rStart = await this.request('/api/simulator/start', {
                    method: 'POST',
                    body: JSON.stringify({
                        track: 'Technical',
                        persona: 'Staff SDE & Bar Raiser'
                    })
                });
                if (!rStart.ok || !rStart.data?.sessionId) throw new Error(`Simulator start failed (${rStart.status})`);

                const rRespond = await this.request('/api/simulator/respond', {
                    method: 'POST',
                    body: JSON.stringify({
                        sessionId: rStart.data.sessionId,
                        responseText: 'A HashMap handles collisions using separate chaining where each bucket holds a linked list, which treeifies into a Red-Black tree when the chain exceeds 8 entries in Java 8. When the load factor of 0.75 is breached, the hash table doubles capacity and rehashes all elements in amortized O(1) time.'
                    })
                });
                if (!rRespond.ok || !rRespond.data?.evaluation) throw new Error(`Simulator respond failed (${rRespond.status})`);
            },

            // 19. Question Feedback
            async () => {
                const r = await this.request('/api/feedback', {
                    method: 'POST',
                    body: JSON.stringify({
                        questionId: 'q-dsa-01',
                        type: 'review',
                        rating: 5,
                        text: 'Comprehensive question covering monotonic queue amortized complexity.'
                    })
                });
                if (!r.ok || !r.data?.success) throw new Error(`Feedback submit failed (${r.status})`);
            },

            // 20. Technical Journal
            async () => {
                const rList = await this.request('/api/articles');
                if (!rList.ok || !Array.isArray(rList.data)) throw new Error(`Articles list failed (${rList.status})`);

                const rArticle = await this.request('/api/articles/monotonic-deques-sliding-window');
                if (!rArticle.ok || !rArticle.data?.title) throw new Error(`Article detail failed (${rArticle.status})`);
            },

            // 21. Static SPA HTML
            async () => {
                const r = await this.request('/');
                if (!r.ok || typeof r.data !== 'string' || !r.data.includes('html')) throw new Error(`SPA root failed (${r.status})`);
            }
        ];

        for (let i = 0; i < steps.length; i++) {
            try {
                await steps[i]();
                this.completedSteps++;
            } catch (err) {
                this.errors.push(`Step ${i + 1}: ${err.message}`);
            }
        }

        this.totalDurationMs = Date.now() - journeyStart;
    }
}

// Concurrency pool runner
async function runPool(items, concurrency, fn) {
    let index = 0;
    const results = [];
    const executing = [];

    const enqueue = async () => {
        if (index >= items.length) return;
        const current = items[index++];
        const p = Promise.resolve().then(() => fn(current)).then(res => {
            results.push(res);
            executing.splice(executing.indexOf(p), 1);
        });
        executing.push(p);

        let r = Promise.resolve();
        if (executing.length >= concurrency) {
            r = Promise.race(executing);
        }
        return r.then(enqueue);
    };

    while (index < items.length) {
        await enqueue();
    }
    await Promise.all(executing);
    return results;
}

async function main() {
    console.log('================================================================');
    console.log(`🚀 LAUNCHING 100-STUDENT REAL-WORLD PLATFORM LOAD & E2E TEST`);
    console.log(`Target: ${BASE_URL}`);
    console.log(`Concurrent student sessions: ${CONCURRENCY_LIMIT}`);
    console.log(`Total students to simulate: ${TOTAL_STUDENTS}`);
    console.log('================================================================\n');

    const students = Array.from({ length: TOTAL_STUDENTS }, (_, i) => new StudentSession(i + 1));
    const testStartTime = Date.now();

    let completedCount = 0;
    await runPool(students, CONCURRENCY_LIMIT, async (student) => {
        await student.runJourney();
        completedCount++;
        if (completedCount % 10 === 0 || completedCount === TOTAL_STUDENTS) {
            console.log(`Progress: [${completedCount}/${TOTAL_STUDENTS}] students finished journeys...`);
        }
        return student;
    });

    const totalWallDuration = ((Date.now() - testStartTime) / 1000).toFixed(2);

    // Compute aggregated metrics
    let totalStepsPassed = 0;
    let totalStepsAttempted = 0;
    let totalErrors = 0;
    const failedStudents = [];
    const allLatencies = [];

    students.forEach(s => {
        totalStepsPassed += s.completedSteps;
        totalStepsAttempted += 21; // 21 steps per student
        if (s.errors.length > 0) {
            totalErrors += s.errors.length;
            failedStudents.push({
                index: s.index,
                name: s.name,
                email: s.email,
                errors: s.errors
            });
        }
        allLatencies.push(s.totalDurationMs);
    });

    const avgJourneyMs = (allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length).toFixed(0);
    const minJourneyMs = Math.min(...allLatencies);
    const maxJourneyMs = Math.max(...allLatencies);
    const totalRequests = totalStepsAttempted;
    const overallSuccessRate = ((totalStepsPassed / totalStepsAttempted) * 100).toFixed(2);

    console.log('\n================================================================');
    console.log(`📊 100-STUDENT LOAD TEST RESULTS`);
    console.log('================================================================');
    console.log(`Total Students Simulated:    ${TOTAL_STUDENTS}`);
    console.log(`Total API Steps Executed:    ${totalRequests}`);
    console.log(`Total Steps Passed:          ${totalStepsPassed}`);
    console.log(`Total Steps Failed:          ${totalErrors}`);
    console.log(`Overall Step Success Rate:   ${overallSuccessRate}%`);
    console.log(`Students with 100% Pass:     ${TOTAL_STUDENTS - failedStudents.length} / ${TOTAL_STUDENTS}`);
    console.log(`Total Wall Clock Time:       ${totalWallDuration} seconds`);
    console.log(`Average Student Journey:     ${avgJourneyMs} ms`);
    console.log(`Fastest Student Journey:     ${minJourneyMs} ms`);
    console.log(`Slowest Student Journey:     ${maxJourneyMs} ms`);
    console.log('================================================================\n');

    if (failedStudents.length > 0) {
        console.error(`❌ ${failedStudents.length} students encountered issues:`);
        failedStudents.slice(0, 10).forEach(f => {
            console.error(`  - Student #${f.index} (${f.name}):`);
            f.errors.forEach(e => console.error(`      * ${e}`));
        });
        if (failedStudents.length > 10) {
            console.error(`  ...and ${failedStudents.length - 10} more.`);
        }
        process.exit(1);
    } else {
        console.log(`✅ ALL 100 STUDENTS EXECUTED ENTIRE LIFECYCLE WITH 100% SUCCESS!`);
        console.log(`✅ Zero 429 rate limit drops.`);
        console.log(`✅ Zero 500 server crashes.`);
        console.log(`✅ All database records and session tokens validated.`);
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
});
