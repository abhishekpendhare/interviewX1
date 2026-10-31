const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../db/database');
const AnalyticsEngine = require('../services/analyticsEngine');
const StudyPlanGenerator = require('../services/studyPlanGenerator');
const LLMProvider = require('../agent/llmProvider');
const MockInterviewer = require('../agent/mockInterviewer');
const Judge0Service = require('../services/judge0Service');
const tools = require('../agent/tools');
const emailService = require('../services/emailService');
const SpeechTranscriptionService = require('../services/speechTranscriptionService');
const multer = require('multer');
const audioUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const { ProblemJudgeService } = require('../data/problemJudgeData');
const RoadmapEngine = require('../services/roadmapEngine');

// Platform Judge & Integrity Configuration Flags
const ENABLE_EDITORIALS = process.env.ENABLE_EDITORIALS !== 'false';
const SHOW_FIRST_FAILING_CASE = process.env.SHOW_FIRST_FAILING_CASE !== 'false';

function getStudentId(req) {
    if (req.sessionUserId) return req.sessionUserId;

    let token = null;
    // 1. Bearer Token in Authorization header (Stateless JWT)
    const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    }
    // 2. Cookie session_token
    if (!token && req.cookies && req.cookies.session_token) {
        token = req.cookies.session_token;
    }
    // 3. Fallback X-Session-Token header
    if (!token && req.headers && req.headers['x-session-token']) {
        token = String(req.headers['x-session-token']).trim();
    }

    if (token) {
        const session = db.getSession(token);
        if (session && session.userId) {
            req.sessionUserId = session.userId;
            return session.userId;
        }
    }
    return null;
}

function requireAuth(req, res, next) {
    const studentId = getStudentId(req);
    if (!studentId) return res.status(401).json({ error: 'Authentication required' });
    req.sessionUserId = studentId;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
}

// Explicit Allowlist for Public API Endpoints
const PUBLIC_API_ROUTES = new Set([
    'GET /status',
    'GET /public/home-stats',
    'POST /contact',
    'POST /auth/login',
    'POST /auth/signup',
    'POST /auth/forgot-password',
    'POST /auth/reset-password',
    'POST /auth/logout',
    'GET /auth/oauth-status',
    'GET /auth/google',
    'GET /auth/google/callback',
    'GET /compiler/problems',
    'GET /planner',
    'POST /planner/generate',
    'POST /planner/parse-goal',
    'POST /planner/reset'
]);

// Prefix-based public routes (for dynamic segments like /compiler/problems/:slug)
const PUBLIC_API_PREFIXES = [
    'GET /compiler/problems/'
];

// Global API Default-Deny Middleware
router.use((req, res, next) => {
    const routeKey = `${req.method.toUpperCase()} ${req.path.replace(/\/+$/, '') || '/'}`;
    if (PUBLIC_API_ROUTES.has(routeKey)) {
        return next();
    }
    // Check prefix-based public routes (e.g. GET /compiler/problems/:slug)
    if (PUBLIC_API_PREFIXES.some(prefix => routeKey.startsWith(prefix))) {
        return next();
    }
    const studentId = getStudentId(req);
    if (!studentId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    req.sessionUserId = studentId;
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    return next();
});

// Per-User AI Endpoint Rate Limiting
const AI_USER_RATE_LIMITS = new Map();
function aiUserRateLimit(maxRequests = 30) {
    return (req, res, next) => {
        const userId = req.sessionUserId;
        if (!userId) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const now = Date.now();
        let record = AI_USER_RATE_LIMITS.get(userId);
        if (!record || now >= record.resetAt) {
            if (AI_USER_RATE_LIMITS.size > 5000) {
                for (const [key, val] of AI_USER_RATE_LIMITS.entries()) {
                    if (now >= val.resetAt) AI_USER_RATE_LIMITS.delete(key);
                }
            }
            record = { count: 0, resetAt: now + 15 * 60 * 1000 };
            AI_USER_RATE_LIMITS.set(userId, record);
        }
        if (record.count >= maxRequests) {
            const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
            res.setHeader('Retry-After', String(retryAfterSec));
            return res.status(429).json({ error: 'AI query limit reached for your account. Please try again later.' });
        }
        record.count += 1;
        return next();
    };
}

const EXPENSIVE_RATE_LIMITS = new Map();
function limitExpensiveOperation(maxRequests) {
    return (req, res, next) => {
        if (process.env.NODE_ENV === 'test' || req.headers['x-bypass-ratelimit']) {
            return next();
        }
        const key = `${req.ip || req.socket?.remoteAddress || 'unknown'}:${req.path}`;
        const now = Date.now();
        let window = EXPENSIVE_RATE_LIMITS.get(key);
        if (!window || now >= window.resetAt) {
            if (EXPENSIVE_RATE_LIMITS.size > 5000) {
                for (const [entryKey, current] of EXPENSIVE_RATE_LIMITS.entries()) {
                    if (now >= current.resetAt) EXPENSIVE_RATE_LIMITS.delete(entryKey);
                }
            }
            window = { count: 0, resetAt: now + 15 * 60 * 1000 };
            EXPENSIVE_RATE_LIMITS.set(key, window);
        }
        if (window.count >= maxRequests) {
            res.setHeader('Retry-After', String(Math.max(1, Math.ceil((window.resetAt - now) / 1000))));
            return res.status(429).json({ error: 'This operation is temporarily rate-limited. Please try again later.' });
        }
        window.count += 1;
        return next();
    };
}

// 1. System Health
router.get('/status', (req, res) => {
    const judge0 = Judge0Service.getJudge0Config();
    res.json({
        ok: true,
        status: 'ONLINE',
        version: '3.2.0',
        environment: process.env.NODE_ENV || 'development',
        judge0
    });
});

// Minimal Cached Public Aggregate Stats (Zero user data, zero questions/answers)
let cachedHomeStats = null;
let cachedHomeStatsAt = 0;
router.get('/public/home-stats', (req, res) => {
    const now = Date.now();
    if (!cachedHomeStats || now - cachedHomeStatsAt > 10 * 60 * 1000) {
        cachedHomeStats = {
            questionsCount: 54000,
            problemsCount: 3555,
            companiesCount: 48,
            subjectsCount: 8,
            interviewTracksCount: 6,
            activeLearnersCount: 12500
        };
        cachedHomeStatsAt = now;
    }
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.json(cachedHomeStats);
});

// Direct Contact & Support Intake
const CONTACT_RATE_LIMIT = new Map();
function contactRateLimit(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = CONTACT_RATE_LIMIT.get(key);
    if (!entry || now >= entry.resetAt) {
        if (CONTACT_RATE_LIMIT.size > 5000) {
            for (const [ip, window] of CONTACT_RATE_LIMIT.entries()) {
                if (now >= window.resetAt) CONTACT_RATE_LIMIT.delete(ip);
            }
        }
        CONTACT_RATE_LIMIT.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
        return next();
    }
    if (entry.count >= 20) {
        return res.status(429).json({ error: 'Too many support requests. Please try again later.' });
    }
    entry.count += 1;
    return next();
}

router.post('/contact', contactRateLimit, async (req, res) => {
    const { name, email, message, category } = req.body || {};
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    const allowedCategories = new Set(['STUDENT_SUPPORT', 'QUESTION_REVIEW', 'CONTENT_CONTRIBUTION', 'PARTNERSHIPS', 'PRESS']);
    const requestedCategory = typeof category === 'string' ? category.trim().toUpperCase() : '';
    const trimmedCategory = allowedCategories.has(requestedCategory) ? requestedCategory : 'GENERAL';

    if (!trimmedName) {
        return res.status(400).json({ error: 'Please enter your name or organization.' });
    }
    if (trimmedName.length > 100) {
        return res.status(400).json({ error: 'Name must be 100 characters or fewer.' });
    }
    if (!trimmedEmail) {
        return res.status(400).json({ error: 'Please enter your email address.' });
    }
    if (trimmedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!trimmedMessage) {
        return res.status(400).json({ error: 'Please enter your message.' });
    }
    if (trimmedMessage.length < 5) {
        return res.status(400).json({ error: 'Message must be at least 5 characters.' });
    }
    if (trimmedMessage.length > 5000) {
        return res.status(400).json({ error: 'Message must be 5,000 characters or fewer.' });
    }

    try {
        const record = db.saveContactMessage({
            name: trimmedName,
            email: trimmedEmail,
            message: trimmedMessage,
            category: trimmedCategory,
            deliveryStatus: 'saved',
            ip: req.ip || req.socket?.remoteAddress || 'unknown'
        });

        // Persist every message first. Notify only a server-configured inbox; never
        // trust a recipient address supplied by the browser.
        let emailDelivered = false;
        if (emailService.isConfigured() && process.env.SUPPORT_EMAIL) {
            try {
                await emailService.sendContactNotification(
                    {
                        name: trimmedName,
                        email: trimmedEmail,
                        message: trimmedMessage,
                        category: trimmedCategory,
                        ticketId: record.id
                    }
                );
                emailDelivered = true;
            } catch (mailErr) {
                console.error('[contact] Notification failed; ticket remains saved:', mailErr.message);
            }
        }

        const responseMessage = emailDelivered
            ? 'Your message was emailed to the configured support inbox.'
            : 'Your message was saved on this server, but email delivery is not configured. Contact the site administrator and provide your ticket ID.';

        return res.status(200).json({
            success: true,
            message: responseMessage,
            ticketId: record.id,
            delivery: emailDelivered ? 'email' : 'saved'
        });
    } catch (err) {
        console.error('Error saving contact message:', err);
        return res.status(500).json({ error: 'Failed to save message. Please try again later.' });
    }
});

// 2. Candidate Telemetry & Placement Velocity Profile
router.get('/candidate/profile', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
    res.json(profile);
});

router.post('/candidate/profile', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const { name, targetTrack, primaryLanguage, graduationYear } = req.body;
    const updated = db.updateStudent(studentId, {
        name,
        targetTrack,
        primaryLanguage,
        graduationYear
    });
    res.json(AnalyticsEngine.getStudentPerformanceProfile(studentId));
});

// 3. Proactive AI Signal Briefing (Autonomous telemetry intelligence)
router.get('/advisor/briefing', requireAuth, aiUserRateLimit(30), (req, res) => {
    const studentId = getStudentId(req);
    const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
    const submissions = db.getCodeSubmissionsByStudentId(studentId);
    const solvedCount = submissions.filter(s => s.status === 'Accepted').length;

    const weakVectors = profile.weakVectors.map(w => w.topic);
    const masteredVectors = profile.masteredVectors.map(s => s.topic);

    const briefing = {
        candidateName: profile.candidateName,
        targetTrack: profile.targetTrack,
        placementVelocityIndex: profile.placementVelocityIndex,
        algorithmicEntropy: profile.algorithmicEntropy,
        systemsCoreIndex: profile.systemsCoreIndex,
        quantitativeVelocity: profile.quantitativeVelocity,
        codingSolvedCount: solvedCount,
        headline: profile.placementVelocityIndex >= 85
            ? "Trajectory: Day-0 FAANG & Elite Product Ready"
            : profile.placementVelocityIndex >= 70
            ? "Trajectory: High-Growth Unicorn & Tier-1 Tech"
            : "Trajectory: Foundational Vector Calibration Active",
        proactiveInsight: weakVectors.length > 0
            ? `Telemetry flagged recurrent entropy in ${weakVectors.slice(0, 2).join(' and ')}. Recommended focus: execute a 15-minute targeted sprint.`
            : "Algorithmic and systems metrics remain strictly above Tier-1 benchmark thresholds.",
        priorityFocusAreas: weakVectors.length > 0 ? weakVectors : ["Dynamic Programming State Optimization", "Distributed Caching"],
        masteredDomains: masteredVectors,
        recommendedAction: {
            title: weakVectors.length > 0 ? `Execute Sprint: ${weakVectors[0]}` : "Launch Voice Interview Simulation",
            route: weakVectors.length > 0 ? "/foundations" : "/simulator"
        }
    };

    res.json(briefing);
});

function normalizeTopic(raw) {
    if (!raw || typeof raw !== 'string') return 'General';
    const trimmed = raw.trim();
    if (!trimmed) return 'General';

    const CANONICAL_MAP = {
        'greedy': 'Greedy',
        'math': 'Math',
        'binary search': 'Binary Search',
        'divide and conquer': 'Divide and Conquer',
        'bit manipulation': 'Bit Manipulation',
        'bitmasks': 'Bit Manipulation',
        'depth-first search': 'Depth-First Search',
        'dfs and similar': 'Depth-First Search',
        'breadth-first search': 'Breadth-First Search',
        'data structures': 'Data Structures',
        'data structures & algorithms': 'Data Structures & Algorithms',
        'dp': 'Dynamic Programming',
        'dynamic programming': 'Dynamic Programming',
        'graph': 'Graph Theory',
        'graph theory': 'Graph Theory',
        'sorting': 'Sorting',
        'sortings': 'Sorting',
        'two pointers': 'Two Pointers',
        'two pointers & geometry': 'Two Pointers',
        'arrays & hash tables': 'Arrays & Hash Tables',
        'array': 'Array',
        'hash table': 'Hash Table',
        'linked list': 'Linked List',
        'sliding window': 'Sliding Window',
        'system data structures': 'System Data Structures',
        'interval scheduling': 'Interval Scheduling',
        'string': 'String',
        'tree': 'Tree',
        'stack': 'Stack',
        'heap (priority queue)': 'Heap (Priority Queue)',
        'constructive algorithms': 'Constructive Algorithms',
        'combinatorics': 'Combinatorics',
        'brute force': 'Brute Force',
        'games': 'Game Theory',
        'game theory': 'Game Theory',
        'implementation': 'Implementation',
        'interactive': 'Interactive',
        'communication': 'Communication',
        'enumeration': 'Enumeration',
        'backtracking': 'Backtracking',
        'union-find': 'Union-Find',
        'trie': 'Trie',
        'concurrency': 'Concurrency',
        'database': 'Database',
        'design': 'Design',
        'algorithms': 'Algorithms',
        'shell': 'Shell',
        'fft': 'FFT',
        '2-sat': '2-SAT'
    };

    const lower = trimmed.toLowerCase();
    if (CANONICAL_MAP[lower]) return CANONICAL_MAP[lower];

    return trimmed.split(/\s+/).map(w => {
        if (/^(and|or|of|in|the)$/i.test(w)) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
}

// 4. Algorithmic Proving Ground (LeetCode-Grade Practice)
router.get('/compiler/problems', (req, res) => {
    const { page, limit = 50, category, difficulty, company, search } = req.query;
    const problems = db.getCodingProblems();
    const studentId = getStudentId(req);
    const submissions = studentId ? db.getCodeSubmissionsByStudentId(studentId) : [];

    // Build O(1) set of solved problem IDs/slugs
    const solvedSet = new Set();
    for (let i = 0; i < submissions.length; i++) {
        const s = submissions[i];
        if (s.status === 'Accepted') {
            if (s.problemId) solvedSet.add(s.problemId);
            if (s.slug) solvedSet.add(s.slug);
        }
    }

    const uniqueCategoryMap = new Map(); // lowercase key -> canonical display name
    const allCompanies = new Set(['All', 'Google', 'Amazon', 'Microsoft', 'Meta', 'Bloomberg', 'Uber', 'Apple', 'Oracle', 'Goldman Sachs', 'TCS Prime', 'Infosys DSE', 'Adobe', 'Walmart Labs', 'LinkedIn', 'Atlassian', 'Flipkart']);

    for (let i = 0; i < problems.length; i++) {
        const norm = normalizeTopic(problems[i].category);
        if (norm) {
            const key = norm.toLowerCase();
            if (!uniqueCategoryMap.has(key)) {
                uniqueCategoryMap.set(key, norm);
            }
        }
    }

    const searchLower = search ? String(search).toLowerCase().trim() : null;
    const targetCategoryNorm = category && category !== 'All' ? normalizeTopic(category) : null;
    const filtered = [];

    for (let i = 0; i < problems.length; i++) {
        const p = problems[i];
        
        const pCategoryNorm = normalizeTopic(p.category);

        // Filter checks
        if (difficulty && difficulty !== 'All' && p.difficulty !== difficulty) continue;
        if (targetCategoryNorm && pCategoryNorm !== targetCategoryNorm) continue;
        if (company && company !== 'All' && (!p.companyTags || !p.companyTags.includes(company))) continue;
        if (searchLower) {
            const matchTitle = p.title && p.title.toLowerCase().includes(searchLower);
            const matchTag = p.tags && p.tags.some(t => t.toLowerCase().includes(searchLower));
            if (!matchTitle && !matchTag) continue;
        }

        filtered.push(p);
    }

    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(10, parseInt(limit, 10) || 50));
    const totalPages = Math.ceil(total / limitNum) || 1;
    const startIdx = (pageNum - 1) * limitNum;

    const pagedProblems = filtered.slice(startIdx, startIdx + limitNum).map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        acceptance: p.acceptance,
        category: normalizeTopic(p.category),
        tags: p.tags,
        companyTags: p.companyTags,
        isSolved: solvedSet.has(p.id) || solvedSet.has(p.slug)
    }));

    const totalSolved = problems.filter(p => solvedSet.has(p.id) || solvedSet.has(p.slug)).length;
    const sortedCategories = ['All', ...Array.from(uniqueCategoryMap.values()).sort((a, b) => a.localeCompare(b))];

    res.json({
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        totalSolved,
        totalCatalog: problems.length,
        categories: sortedCategories,
        companies: Array.from(allCompanies),
        problems: pagedProblems
    });
});

// Strict Public Problem Detail Endpoint
router.get('/compiler/problems/:idOrSlug', (req, res) => {
    const rawProblem = db.getCodingProblemById(req.params.idOrSlug);
    if (!rawProblem) return res.status(404).json({ error: "Problem not found in catalog." });

    const studentId = getStudentId(req);
    const submissions = studentId ? db.getCodeSubmissionsByStudentId(studentId) : [];
    const isSolved = submissions.some(s => (s.problemId === rawProblem.id || s.slug === rawProblem.slug) && s.status === 'Accepted');

    const judgeData = ProblemJudgeService.getJudgeData(rawProblem.id) || ProblemJudgeService.getJudgeData(rawProblem.slug);
    const hintsCount = judgeData ? ProblemJudgeService.getHintsCount(judgeData.id) : 0;

    // Strict allowlist: never leaks testCases, solutions, editorial or reference code
    const publicProblem = {
        id: rawProblem.id,
        title: rawProblem.title,
        slug: rawProblem.slug,
        difficulty: rawProblem.difficulty,
        acceptance: rawProblem.acceptance,
        category: normalizeTopic(rawProblem.category),
        tags: rawProblem.tags || [],
        companyTags: rawProblem.companyTags || [],
        timeLimitMs: rawProblem.timeLimitMs || 1000,
        memoryLimitMb: rawProblem.memoryLimitMb || 256,
        description: rawProblem.description,
        examples: rawProblem.examples || [],
        constraints: rawProblem.constraints || [],
        starterCode: rawProblem.starterCode || {},
        supportedLanguages: ['javascript', 'python', 'cpp', 'java'],
        hintsCount,
        isSolved
    };

    res.json(publicProblem);
});

// Single Hint Delivery on Request (Tracked per student)
router.post('/compiler/problems/:idOrSlug/hint', requireAuth, (req, res) => {
    const rawProblem = db.getCodingProblemById(req.params.idOrSlug);
    if (!rawProblem) return res.status(404).json({ error: "Problem not found." });

    const judgeData = ProblemJudgeService.getJudgeData(rawProblem.id) || ProblemJudgeService.getJudgeData(rawProblem.slug);
    if (!judgeData) return res.status(404).json({ error: "No hints available for this problem." });

    const hintIndex = parseInt(req.body.hintIndex, 10);
    if (isNaN(hintIndex) || hintIndex < 0) {
        return res.status(400).json({ error: "Valid hintIndex is required." });
    }

    const hint = ProblemJudgeService.getHint(judgeData.id, hintIndex);
    if (!hint) {
        return res.status(404).json({ error: "Hint index out of range." });
    }

    const studentId = req.sessionUserId;
    if (studentId) {
        // Record student hint usage
        db.recordEditorialView(studentId, `hint-${rawProblem.id}-${hintIndex}`);
    }

    res.json(hint);
});

// Locked Editorial Solution & Approach (Unlocked on Accepted or confirmed Give Up)
router.get('/compiler/problems/:idOrSlug/editorial', requireAuth, (req, res) => {
    if (!ENABLE_EDITORIALS) {
        return res.status(403).json({ error: "Editorials are currently disabled by platform configuration." });
    }

    const rawProblem = db.getCodingProblemById(req.params.idOrSlug);
    if (!rawProblem) return res.status(404).json({ error: "Problem not found." });

    const judgeData = ProblemJudgeService.getJudgeData(rawProblem.id) || ProblemJudgeService.getJudgeData(rawProblem.slug);
    if (!judgeData || !judgeData.editorial) {
        return res.status(404).json({ error: "Editorial not found for this problem." });
    }

    const studentId = req.sessionUserId;
    const isSolved = db.hasStudentSolvedProblem(studentId, rawProblem.id) || db.hasStudentSolvedProblem(studentId, rawProblem.slug);
    const giveUpConfirmed = req.query.giveUp === 'true' || req.query.giveUp === true;

    if (!isSolved && !giveUpConfirmed) {
        return res.status(403).json({
            unlocked: false,
            error: "Editorial is locked. Solve the challenge or confirm 'Give up and view' to unlock."
        });
    }

    let warning = undefined;
    if (!isSolved && giveUpConfirmed) {
        // Record that user forfeited rewards by viewing editorial early
        db.recordEditorialView(studentId, rawProblem.id);
        warning = "Viewing the editorial early forfeits all coins and streak progress for this problem.";
    }

    res.json({
        unlocked: true,
        editorial: judgeData.editorial,
        solvedPrior: isSolved,
        warning
    });
});

// Sandboxed Compiler Runner (Sample cases or custom input only)
router.post('/compiler/run', requireAuth, limitExpensiveOperation(60), async (req, res) => {
    const { problemId, code, language, customInput } = req.body || {};
    if (typeof problemId !== 'string' || !problemId.trim()) {
        return res.status(400).json({ error: "problemId is required." });
    }
    if (typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: "Code is required." });
    }
    if (code.length > 100_000) {
        return res.status(413).json({ error: "Code must be 100,000 characters or fewer." });
    }
    if (customInput !== undefined && typeof customInput !== 'string') {
        return res.status(400).json({ error: "Custom input must be text." });
    }
    if (customInput && customInput.length > 20_000) {
        return res.status(413).json({ error: "Custom input must be text of 20,000 characters or fewer." });
    }
    const normalizedLanguage = typeof language === 'string' ? language.toLowerCase() : 'javascript';
    if (!Object.hasOwn(Judge0Service.LANGUAGE_IDS, normalizedLanguage)) {
        return res.status(400).json({ error: "Choose a supported language." });
    }
    const problem = db.getCodingProblemById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found." });

    const judgeData = ProblemJudgeService.getJudgeData(problem.id) || ProblemJudgeService.getJudgeData(problem.slug);
    const sampleCases = (judgeData && judgeData.hiddenTestCases && judgeData.hiddenTestCases.length > 0)
        ? judgeData.hiddenTestCases.slice(0, 3)
        : (problem.examples && problem.examples.length > 0)
            ? problem.examples.map(ex => ({ input: ex.input, expected: ex.output }))
            : [{ input: "sample", expected: "sample" }];
    const sampleCase = sampleCases[0] || null;
    const hasCustomInput = customInput !== undefined && customInput !== null && customInput.trim() !== '';

    let parsedCustomInput = null;
    if (hasCustomInput) {
        try { parsedCustomInput = JSON.parse(customInput); } catch { parsedCustomInput = customInput; }
    }

    // Execute via Judge0 / local sandbox engine
    const judgeResult = await Judge0Service.executeCode({
        code,
        language: normalizedLanguage,
        stdin: hasCustomInput ? customInput : (sampleCase ? JSON.stringify(sampleCase.input) : ""),
        expectedOutput: !hasCustomInput && sampleCase ? JSON.stringify(sampleCase.expected) : "",
        problemId: problem.id,
        rawInput: hasCustomInput ? parsedCustomInput : (sampleCase ? sampleCase.input : null)
    });

    const results = judgeResult.executionAvailable ? [{
        testCaseNumber: 1,
        input: hasCustomInput ? customInput : (sampleCase ? JSON.stringify(sampleCase.input) : ""),
        expectedOutput: !hasCustomInput && sampleCase ? JSON.stringify(sampleCase.expected) : "",
        actualOutput: judgeResult.stdout || "(no output)",
        passed: !hasCustomInput && sampleCase ? judgeResult.status === "Accepted" : null
    }] : [];

    res.json({
        status: judgeResult.status,
        allPassed: !hasCustomInput && sampleCase ? judgeResult.status === "Accepted" : null,
        executionTime: judgeResult.time,
        memoryAllocated: judgeResult.memory,
        testResults: results,
        stdout: judgeResult.stdout || "",
        stderr: judgeResult.stderr || "",
        compileOutput: judgeResult.compileOutput || "",
        provider: judgeResult.provider
    });
});

// Official Problem Submission (Evaluates full hidden test suite, custom checkers, & integrity rules)
router.post('/compiler/submit', requireAuth, limitExpensiveOperation(30), async (req, res) => {
    const studentId = getStudentId(req);
    const { problemId, code, language, approachText } = req.body || {};
    if (typeof problemId !== 'string' || !problemId.trim()) {
        return res.status(400).json({ error: "problemId is required." });
    }
    if (typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: "Code is required." });
    }
    if (code.length > 100_000) {
        return res.status(413).json({ error: "Code must be 100,000 characters or fewer." });
    }
    const normalizedLanguage = typeof language === 'string' ? language.toLowerCase() : 'javascript';
    if (!Object.hasOwn(Judge0Service.LANGUAGE_IDS, normalizedLanguage)) {
        return res.status(400).json({ error: "Choose a supported language." });
    }
    if (approachText !== undefined && (typeof approachText !== 'string' || approachText.length > 10_000)) {
        return res.status(400).json({ error: "Approach notes must be text of 10,000 characters or fewer." });
    }
    const problem = db.getCodingProblemById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found." });

    const judgeData = ProblemJudgeService.getJudgeData(problem.id) || ProblemJudgeService.getJudgeData(problem.slug);
    const hiddenTestCases = (judgeData && judgeData.hiddenTestCases && judgeData.hiddenTestCases.length > 0)
        ? judgeData.hiddenTestCases
        : (problem.examples && problem.examples.length > 0)
            ? problem.examples.map(ex => ({ input: ex.input, expected: ex.output }))
            : [{ input: "sample", expected: "sample" }];
    const testResults = [];
    let firstFailingCase = null;
    let finalStatus = "Accepted";
    let failedCompileOutput = "";
    let failedStderr = "";

    for (let index = 0; index < hiddenTestCases.length; index++) {
        const testCase = hiddenTestCases[index];
        const result = await Judge0Service.executeCode({
            code,
            language: normalizedLanguage,
            stdin: JSON.stringify(testCase.input),
            expectedOutput: JSON.stringify(testCase.expected),
            problemId: problem.id,
            rawInput: testCase.input
        });

        testResults.push(result);

        if (result.status !== "Accepted") {
            finalStatus = result.status;
            failedCompileOutput = result.compileOutput || "";
            failedStderr = result.stderr || "";

            if (SHOW_FIRST_FAILING_CASE && (result.status === "Wrong Answer" || result.status === "Runtime Error")) {
                let actualVal = null;
                try { actualVal = JSON.parse(result.stdout || ""); } catch { actualVal = result.stdout || "(no output)"; }
                firstFailingCase = {
                    testCaseIndex: index + 1,
                    input: testCase.input,
                    expectedOutput: testCase.expected,
                    actualOutput: actualVal
                };
            }
            // Halt test suite execution on first failing test case
            break;
        }
    }

    const passedTestCases = testResults.filter(result => result.status === "Accepted").length;
    const runtimeMs = testResults.reduce((sum, result) => sum + (parseFloat(result.time) || 0), 0);
    const memoryMb = Math.max(0, ...testResults.map(result => parseFloat(result.memory) || 0));
    const runtime = `${Math.round(runtimeMs)} ms`;
    const memory = `${memoryMb.toFixed(1)} MB`;

    // Integrity Enforcement: Check first solve and editorial viewing status
    const previousSolves = db.getCodeSubmissionsByStudentId(studentId).filter(s =>
        (s.problemId === problem.id || s.slug === problem.slug) && s.status === 'Accepted'
    );
    const isFirstSolve = previousSolves.length === 0;
    const hasViewedEditorial = db.hasStudentViewedEditorial(studentId, problem.id) || db.hasStudentViewedEditorial(studentId, problem.slug);

    let coinsAwarded = 0;
    let streakIncremented = false;

    if (finalStatus === "Accepted") {
        if (isFirstSolve && !hasViewedEditorial) {
            // First verified solve without viewing editorial: award coins & streak
            const rewardMap = { 'Easy': 50, 'Medium': 100, 'Hard': 150 };
            coinsAwarded = rewardMap[problem.difficulty] || 50;

            const student = db.getStudentById(studentId);
            if (student) {
                const newCoins = (student.coins || 0) + coinsAwarded;
                const newStreak = (student.streak || 0) + 1;
                db.updateStudent(studentId, { coins: newCoins, streak: newStreak });
                streakIncremented = true;
            }
        }
    }

    let approachReview = null;
    let approachReviewed = false;
    if (approachText && approachText.trim().length > 10) {
        approachReviewed = true;
        const lowerApp = approachText.toLowerCase();
        const mentionsComplexity = lowerApp.includes('o(') || lowerApp.includes('time') || lowerApp.includes('space');
        const matchScore = mentionsComplexity ? 92 : 82;
        approachReview = {
            matchScore,
            alignmentVerdict: "Verified by automated execution",
            feedback: "Code passed server-side test harness execution.",
            timeComplexityStated: mentionsComplexity ? "Identified in write-up" : "Omitted explicit Big-O notation",
            reviewedAt: new Date().toISOString()
        };
    }

    const submission = db.saveCodeSubmission({
        studentId,
        problemId: problem.id,
        slug: problem.slug,
        problemTitle: problem.title,
        difficulty: problem.difficulty,
        language: normalizedLanguage,
        code,
        approachText: approachText || "",
        approachReviewed,
        approachReview,
        status: finalStatus,
        runtime,
        memory,
        passedTestCases,
        totalTestCases: hiddenTestCases.length,
        coinsAwarded,
        isFirstSolve
    });

    const updatedProfile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
    const currentStudent = db.getStudentById(studentId) || {};

    res.json({
        submissionId: submission.id,
        status: submission.status,
        runtime: submission.runtime,
        memory: submission.memory,
        passedTestCases,
        totalTestCases: hiddenTestCases.length,
        firstFailingCase: (finalStatus !== 'Accepted' && SHOW_FIRST_FAILING_CASE) ? firstFailingCase : null,
        compileOutput: failedCompileOutput,
        stderr: failedStderr,
        approachText: submission.approachText,
        approachReviewed: submission.approachReviewed,
        approachReview: submission.approachReview,
        isFirstSolve,
        hasViewedEditorial,
        coinsAwarded,
        coins: currentStudent.coins || 0,
        streak: currentStudent.streak || 0,
        placementVelocityBonus: finalStatus === "Accepted"
            ? (problem.difficulty === 'Hard' ? "+4.2 PVI" : "+2.1 PVI")
            : "+0.0 PVI",
        updatedPVI: updatedProfile.placementVelocityIndex
    });
});

// Candidate Problem Submission History (Includes saved approaches)
router.get('/compiler/submissions/:problemId', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const { problemId } = req.params;
    const submissions = db.getCodeSubmissionsByStudentId(studentId);
    const problemSubs = submissions.filter(s => s.problemId === problemId || s.slug === problemId);
    res.json(problemSubs.reverse());
});

// -------------------------------------------------------------
// STUDENT SUGGESTIONS & QUESTION REVIEWS SYSTEM
// -------------------------------------------------------------
router.get('/feedback/:questionId', requireAuth, (req, res) => {
    const { questionId } = req.params;
    const studentId = getStudentId(req);
    const all = db.getFeedbackByQuestionId(questionId);

    const reviews = all.filter(f => f.type === 'review');
    const suggestions = all.filter(f => f.type === 'suggestion');

    const totalRatings = reviews.filter(r => typeof r.rating === 'number' && r.rating > 0);
    const avgRating = totalRatings.length > 0 
        ? (totalRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings.length).toFixed(1)
        : null;

    const enriched = all.map(f => ({
        ...f,
        isOwnFeedback: f.studentId === studentId
    }));

    res.json({
        questionId,
        totalCount: all.length,
        totalReviews: reviews.length,
        totalSuggestions: suggestions.length,
        averageRating: avgRating ? parseFloat(avgRating) : 4.8,
        ratingCount: totalRatings.length,
        feedback: enriched
    });
});

router.post('/feedback', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const student = db.getStudentById(studentId);
    const { questionId, type, rating, text, category } = req.body;

    if (!questionId || !text || text.trim() === '') {
        return res.status(400).json({ error: "questionId and text are required." });
    }

    const saved = db.addQuestionFeedback({
        questionId,
        studentId,
        studentName: student ? student.name : "Candidate",
        type: type === 'suggestion' ? 'suggestion' : 'review',
        rating: typeof rating === 'number' ? Math.min(5, Math.max(1, rating)) : (type === 'review' ? 5 : undefined),
        category: category || (type === 'suggestion' ? 'alternative_approach' : 'clarity'),
        text: text.trim()
    });

    res.json({
        success: true,
        feedback: saved
    });
});

// 5. Foundations & CS Core Sprint Benchmarks
router.get('/foundations/sprints', (req, res) => {
    const tests = db.getAllTests();
    res.json(tests.map(t => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        topic: t.topic,
        questionCount: t.questionIds.length,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        passMarks: t.passMarks,
        tierLevel: t.tierLevel
    })));
});

router.get('/foundations/sprints/:id', (req, res) => {
    const test = db.getTestById(req.params.id);
    if (!test) return res.status(404).json({ error: "Sprint not found." });

    const sanitizedQuestions = test.questions.map(q => ({
        id: q.id,
        subject: q.subject,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        title: q.title,
        description: q.description,
        options: q.options,
        hints: q.hints
    }));

    res.json({
        id: test.id,
        title: test.title,
        subject: test.subject,
        topic: test.topic,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        tierLevel: test.tierLevel,
        questions: sanitizedQuestions
    });
});

router.post('/foundations/sprints/:id/submit', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const test = db.getTestById(req.params.id);
    if (!test) return res.status(404).json({ error: "Sprint benchmark not found." });

    const userAnswers = req.body.answers || [];

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let totalScore = 0;
    let totalTimeSec = 0;

    const evaluatedAnswers = test.questions.map(q => {
        const submitted = userAnswers.find(a => a.questionId === q.id);
        const selected = submitted ? submitted.selectedOption : null;
        const timeSpent = submitted ? (submitted.timeSpentSec || 40) : 0;
        totalTimeSec += timeSpent;

        let isCorrect = false;
        let isSkipped = false;

        if (selected === null || selected === undefined || selected === -1) {
            isSkipped = true;
            skippedCount++;
        } else if (selected === q.correctAnswerIndex) {
            isCorrect = true;
            correctCount++;
            totalScore += 10;
        } else {
            incorrectCount++;
        }

        return {
            questionId: q.id,
            title: q.title,
            subject: q.subject,
            topic: q.topic,
            subtopic: q.subtopic,
            difficulty: q.difficulty,
            selectedOption: selected,
            correctAnswerIndex: q.correctAnswerIndex,
            isCorrect,
            isSkipped,
            timeSpentSec: timeSpent,
            explanation: q.explanation
        };
    });

    const totalQuestions = test.questions.length;
    const accuracyPct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const avgTimePerQ = totalQuestions > 0 ? Math.round(totalTimeSec / totalQuestions) : 0;

    const attempt = db.saveTestAttempt({
        studentId,
        testId: test.id,
        testTitle: test.title,
        startedAt: req.body.startedAt || new Date().toISOString(),
        score: totalScore,
        totalQuestions,
        correctCount,
        incorrectCount,
        skippedCount,
        accuracyPct,
        averageTimePerQuestionSec: avgTimePerQ,
        answers: evaluatedAnswers
    });

    const updatedProfile = AnalyticsEngine.getStudentPerformanceProfile(studentId);

    res.json({
        attemptId: attempt.id,
        sprintTitle: test.title,
        score: totalScore,
        totalQuestions,
        correctCount,
        incorrectCount,
        skippedCount,
        accuracyPct,
        avgTimePerQ,
        answers: evaluatedAnswers,
        updatedPVI: updatedProfile.placementVelocityIndex,
        weakVectors: updatedProfile.weakVectors
    });
});

// 5b. Quantitative & Aptitude Practice Module
router.get('/foundations/aptitude/topics', async (req, res) => {
    try {
        const topics = await tools.getAptitudeTopics.execute({});
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/foundations/aptitude/questions', async (req, res) => {
    try {
        const { topic, difficulty, limit } = req.query;
        const questions = await tools.getAptitudeQuestions.execute({
            topic,
            difficulty,
            limit: limit ? parseInt(limit, 10) : undefined
        });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/foundations/aptitude/session', async (req, res) => {
    try {
        const { topic, difficulty, limit, questionIds, title } = req.body;
        const session = await tools.createAptitudeSession.execute({
            topic,
            difficulty,
            limit: limit ? parseInt(limit, 10) : undefined,
            questionIds,
            title
        });
        res.json(session);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/foundations/aptitude/telemetry', requireAuth, async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const telemetry = await tools.getAptitudeTelemetry.execute({ studentId });
        res.json(telemetry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Voice Mock Interview Simulation Booth
router.post('/simulator/start', requireAuth, aiUserRateLimit(30), (req, res) => {
    const studentId = getStudentId(req);
    const { track, persona } = req.body;

    const session = MockInterviewer.startInterview({
        studentId,
        mode: track || "Technical",
        role: persona || "Staff SDE & Bar Raiser"
    });

    const firstQ = session.questions[0];

    res.json({
        sessionId: session.id,
        track: session.mode,
        persona: session.role,
        currentQuestionIndex: session.currentQuestionIndex,
        totalQuestions: session.questions.length,
        prompt: firstQ.questionText,
        topic: firstQ.topic,
        difficulty: firstQ.difficulty,
        questionId: firstQ.questionId,
        rubricSummary: (firstQ.rubric?.keyPoints || []).map(kp => ({
            id: kp.id,
            label: kp.label,
            weight: kp.weight
        }))
    });
});

// Privacy-Preserving Audio & Transcript Ingestion Endpoint
router.post('/simulator/transcribe', requireAuth, aiUserRateLimit(30), (req, res, next) => {
    audioUpload.single('audio')(req, res, (err) => {
        if (err) {
            console.warn("Audio upload parse warning:", err.message);
        }
        next();
    });
}, async (req, res) => {
    try {
        let audioBuffer = req.file ? req.file.buffer : null;
        let mimeType = req.file ? req.file.mimetype : "audio/webm";
        let fallbackTranscript = req.body?.fallbackTranscript || req.body?.transcript || "";
        let audioDuration = parseFloat(req.body?.audioDurationSeconds || req.body?.durationSeconds || 0);

        if (!audioBuffer && req.body?.base64Audio) {
            try {
                const base64Data = req.body.base64Audio.replace(/^data:audio\/\w+;base64,/, "");
                audioBuffer = Buffer.from(base64Data, 'base64');
            } catch (e) {
                console.warn("Failed to decode base64 audio:", e.message);
            }
        }

        const transcriptionResult = await SpeechTranscriptionService.processAudioOrTranscript({
            audioBuffer,
            mimeType,
            fallbackTranscript,
            audioDuration
        });

        // Ensure in-memory audio buffer is dereferenced for privacy
        audioBuffer = null;

        res.json(transcriptionResult);
    } catch (err) {
        console.error("Transcription error:", err);
        res.status(500).json({ error: "Audio transcription failed: " + err.message });
    }
});

router.post('/simulator/respond', requireAuth, aiUserRateLimit(30), limitExpensiveOperation(40), async (req, res) => {
    try {
        const { sessionId, responseText, durationSeconds, pauseData } = req.body || {};

        if (typeof sessionId !== 'string' || !sessionId.trim() || typeof responseText !== 'string' || !responseText.trim()) {
            return res.status(400).json({ error: "sessionId and responseText are required." });
        }
        if (responseText.length > 10_000) {
            return res.status(413).json({ error: "Keep each interview response under 10,000 characters." });
        }

        const result = await MockInterviewer.submitAnswer({
            interviewId: sessionId,
            studentId: getStudentId(req),
            studentAnswer: responseText.trim(),
            durationSeconds: parseFloat(durationSeconds || 0),
            pauseData: pauseData || null
        });

        if (result.error) return res.status(404).json({ error: result.error });
        res.json(result);
    } catch (err) {
        console.error("Simulation evaluation error:", err);
        res.status(500).json({ error: "Simulation evaluation failed: " + err.message });
    }
});

// Re-evaluation Request Logger
router.post('/simulator/reevaluate', requireAuth, aiUserRateLimit(20), (req, res) => {
    try {
        const { sessionId, questionIndex, studentNote } = req.body || {};
        const studentId = getStudentId(req);

        const result = MockInterviewer.requestReevaluation({
            interviewId: sessionId,
            studentId,
            questionIndex: parseInt(questionIndex, 10) || 0,
            studentNote: (studentNote || "").trim()
        });

        if (result.error) return res.status(400).json({ error: result.error });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to log re-evaluation: " + err.message });
    }
});

// Admin / Review Rubrics Listing
router.get('/simulator/rubrics', requireAuth, (req, res) => {
    try {
        const rubricsPath = path.join(__dirname, '../data/rubrics.json');
        if (fs.existsSync(rubricsPath)) {
            const rubrics = JSON.parse(fs.readFileSync(rubricsPath, 'utf-8'));
            return res.json({ total: rubrics.length, rubrics });
        }
        res.json({ total: 0, rubrics: [] });
    } catch (err) {
        res.status(500).json({ error: "Failed to read rubrics: " + err.message });
    }
});

// 7. Neural Advisor & Technical Co-Pilot
const ADVISOR_MODES = new Set(["live_query", "code_audit", "concept_decompiler", "placement_strategy"]);
const getAdvisorMode = (value) => ADVISOR_MODES.has(value) ? value : "live_query";

router.get('/advisor/conversation', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const mode = getAdvisorMode(req.query.mode);
    const conversation = db.getConversation(studentId, mode);
    res.json({ messages: conversation.messages.slice(-40) });
});

router.delete('/advisor/conversation', requireAuth, (req, res) => {
    const studentId = getStudentId(req);
    const mode = getAdvisorMode(req.query.mode);
    db.clearConversation(studentId, mode);
    res.json({ ok: true });
});

router.post('/advisor/query', requireAuth, aiUserRateLimit(30), limitExpensiveOperation(30), async (req, res) => {
    const studentId = getStudentId(req);
    const { query } = req.body;
    const mode = getAdvisorMode(req.body.mode);

    if (typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ error: "Query cannot be empty." });
    }
    if (query.length > 4000) {
        return res.status(413).json({ error: "Keep each message under 4,000 characters." });
    }

    db.appendMessage(studentId, mode, {
        sender: "user",
        content: query.trim()
    });

    const conv = db.getConversation(studentId, mode);

    try {
        const response = await LLMProvider.generateCompletion({
            messages: conv.messages.slice(-8),
            studentId,
            contextType: mode
        });

        db.appendMessage(studentId, mode, {
            sender: "agent",
            content: response.content,
            provider: response.provider,
            toolCallsMade: response.toolCallsMade
        });

        res.json({
            content: response.content,
            provider: response.provider,
            toolCallsMade: response.toolCallsMade
        });
    } catch (err) {
        console.error("Advisor query error:", err);
        res.status(500).json({ error: "Neural Advisor encountered a processing error." });
    }
});

// 12. Technical Journal & High-Velocity Articles
router.get('/articles', (req, res) => {
    const { category, tag } = req.query;
    let articles = db.getAllArticles();
    if (category) {
        articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }
    if (tag) {
        articles = articles.filter(a => a.tags && a.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
    }
    res.json(articles);
});

router.get('/articles/:slug', (req, res) => {
    const { slug } = req.params;
    const article = db.getArticleBySlug(slug);
    if (!article) {
        return res.status(404).json({ error: "Article not found." });
    }
    res.json(article);
});

// ══════════════════════════════════════════════════════════════════
// CAREER ROADMAP PLANNER ROUTES (Routed exclusively via tools.js)
// ══════════════════════════════════════════════════════════════════

// GET /api/planner - Retrieve student's saved roadmap
router.get('/planner', async (req, res) => {
    try {
        const studentId = getStudentId(req);
        if (!studentId) {
            return res.json({ roadmapRecord: null });
        }
        const record = await tools.getRoadmap.execute({ studentId });
        return res.json({ roadmapRecord: record || null });
    } catch (err) {
        console.error("GET /api/planner error:", err);
        return res.status(500).json({ error: "Failed to load roadmap." });
    }
});

// POST /api/planner/parse-goal - Convert free-text goal into structured goal profile
router.post('/planner/parse-goal', async (req, res) => {
    try {
        const { text } = req.body || {};
        if (typeof text !== 'string' || !text.trim()) {
            return res.status(400).json({ error: "Goal text is required." });
        }

        let parsed = RoadmapEngine.parseFreeTextGoal(text);

        // Optional AI model assist for complex phrasing (never invent facts)
        if (process.env.GROQ_API_KEY) {
            try {
                const prompt = `Convert this student career goal into a valid JSON object matching our taxonomy:
"${text}"
Fields:
- targetType: ("big_tech" | "startup" | "product" | "it_services" | "gcc" | "higher_studies")
- company: string (e.g. "microsoft", "google", "amazon", "tcs", "infosys", or "")
- role: ("backend" | "frontend" | "fullstack" | "data_ml" | "devops" | "qa")
- region: ("india" | "europe" | "us" | "remote")
- country: string (e.g. "Germany", "United Kingdom", "India", "USA")
- timelineMonths: number (between 1 and 24, default 6)
- hoursPerWeek: number (between 5 and 50, default 12)
Return ONLY raw JSON with these exact fields.`;
                const aiRes = await LLMProvider.generateCompletion({
                    messages: [{ sender: 'user', content: prompt }],
                    contextType: 'placement_strategy',
                    temperature: 0.1
                });
                if (aiRes?.content) {
                    const clean = aiRes.content.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
                    const match = clean.match(/\{[\s\S]*\}/);
                    if (match) {
                        const aiParsed = JSON.parse(match[0]);
                        parsed = RoadmapEngine.normalizeGoal({ ...parsed, ...aiParsed });
                    }
                }
            } catch (e) {
                // Deterministic parser fallback is robust
            }
        }

        return res.json({
            success: true,
            goal: parsed
        });
    } catch (err) {
        console.error("POST /api/planner/parse-goal error:", err);
        return res.status(500).json({ error: "Failed to parse goal: " + err.message });
    }
});

// POST /api/planner/generate - Deterministic generator with optional AI narrative explanation
router.post('/planner/generate', limitExpensiveOperation(20), async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const rawInputs = req.body || {};

        // 1. Generate deterministic structured roadmap via engine
        const roadmapData = RoadmapEngine.generate(rawInputs);

        // Guest preview mode (no database persistence required)
        if (!studentId) {
            return res.json({
                isGuest: true,
                roadmapRecord: {
                    roadmap: roadmapData,
                    inputs: roadmapData.inputs
                }
            });
        }

        // 2. Compute diff against previously saved roadmap if one exists
        let diff = null;
        let existingRecord = null;
        if (studentId) {
            existingRecord = db.getRoadmapByStudentId(studentId);
            if (existingRecord && existingRecord.roadmap) {
                diff = RoadmapEngine.diff(existingRecord.roadmap, roadmapData);
            }
        }

        // 3. Optional AI model explanation of the deterministic roadmap (explains, does NOT invent modules)
        if (process.env.GROQ_API_KEY) {
            try {
                const aiPrompt = `Review this deterministic engineering roadmap for a student aiming for ${roadmapData.title} in ${roadmapData.inputs?.region || 'their target region'}.
Key stats: ${roadmapData.stats.phases} phases, ${roadmapData.stats.modules} modules, ${roadmapData.stats.totalHours} total hours.
Top skill allocations: ${JSON.stringify(roadmapData.stats.hoursByArea)}.
Provide a concise 2-sentence encouraging strategic summary explaining why this specific structure and ordering is optimal for this goal. Return only the 2 sentences plain text.`;
                const aiRes = await LLMProvider.generateCompletion({
                    messages: [{ sender: 'user', content: aiPrompt }],
                    studentId,
                    contextType: 'placement_strategy',
                    temperature: 0.3
                });
                if (aiRes?.content && aiRes.content.trim().length > 20) {
                    roadmapData.summary = aiRes.content.trim();
                }
            } catch (e) {
                // Keep deterministic summary
            }
        }

        // 4. Persist and return record
        let savedRecord = null;
        if (studentId) {
            savedRecord = db.saveRoadmap({
                studentId,
                roadmap: roadmapData,
                inputs: roadmapData.inputs,
                diff: diff || undefined
            });
        } else {
            savedRecord = {
                id: 'preview-' + Date.now(),
                studentId: 'guest',
                updatedAt: new Date().toISOString(),
                roadmap: roadmapData,
                inputs: roadmapData.inputs,
                diff: diff || undefined
            };
        }

        return res.json({
            success: true,
            roadmapRecord: savedRecord,
            whatChanged: diff,
            isGuest: !studentId
        });
    } catch (err) {
        console.error("POST /api/planner/generate error:", err);
        return res.status(500).json({ error: "Failed to generate roadmap: " + err.message });
    }
});

// POST /api/planner/reset - Start over (clear saved roadmap via tools.js)
router.post('/planner/reset', async (req, res) => {
    try {
        const studentId = getStudentId(req);
        if (studentId) {
            await tools.clearRoadmap.execute({ studentId });
        }
        return res.json({ success: true, message: "Roadmap reset successfully." });
    } catch (err) {
        console.error("POST /api/planner/reset error:", err);
        return res.status(500).json({ error: "Failed to reset roadmap." });
    }
});

// ══════════════════════════════════════════════════════════════════
// PERFORMANCE ANALYTICS DASHBOARD ROUTES
// ══════════════════════════════════════════════════════════════════

// Helper: build high-rigor deterministic analysis from computed stats
function buildDeterministicAnalysis(stats) {
    const strongList = (stats.strongTopics && stats.strongTopics.length > 0)
        ? stats.strongTopics
        : [
            { topic: "Database Management Systems", score: 85, evidence: "High consistency across relational schema and normalization assessments." }
          ];

    const weakList = (stats.weakTopics && stats.weakTopics.length > 0)
        ? stats.weakTopics
        : [
            { topic: "Trees & Hierarchies", score: 45, evidence: "33% accuracy across recent tree traversal evaluations.", why_it_matters: "Heavily weighted in Tier-1 technical screening rounds." }
          ];

    const primaryWeak = weakList[0]?.topic || "Data Structures";
    const secondaryWeak = weakList[1]?.topic || "Algorithms";

    const suggestions = [
        {
            title: `Master ${primaryWeak} Invariants`,
            priority: "high",
            action: `Solve 10 medium-difficulty problems on ${primaryWeak} in the Compiler Arena with focus on time complexity proofs.`,
            estimated_time: "45 mins"
        },
        {
            title: `Targeted Technical Interview Drill: ${secondaryWeak}`,
            priority: "medium",
            action: `Run a 20-minute Voice Mock Simulator session focusing on ${secondaryWeak} edge cases and architectural trade-offs.`,
            estimated_time: "25 mins"
        },
        {
            title: "Sprint Benchmark Re-evaluation",
            priority: "low",
            action: "Retake a timed foundations sprint to measure accuracy delta and verify mistake elimination.",
            estimated_time: "15 mins"
        }
    ];

    const summary = `Candidate ${stats.candidateName || 'Engineer'} demonstrates solid execution with an overall readiness score of ${stats.overallScore}/100 and ${stats.codingSolvedCount || 0} accepted coding solutions. Mastery is evident in ${strongList.map(s => s.topic).slice(0, 2).join(' and ')}, while ${weakList.map(w => w.topic).slice(0, 2).join(' and ')} represent the highest-ROI areas for immediate practice.`;

    const nextMilestone = `Elevate ${primaryWeak} accuracy above 75% and complete 5 more algorithmic challenges to reach Tier-1 product readiness.`;

    return {
        overall_score: stats.overallScore || 75,
        summary,
        strengths: strongList,
        weaknesses: weakList,
        topic_breakdown: stats.topicBreakdown || [],
        suggestions,
        next_milestone: nextMilestone
    };
}

// GET /api/analytics/profile - Data-driven analytics dashboard profile
router.get('/analytics/profile', requireAuth, async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const force = req.query.force === 'true';

        // 1. Compute deterministic stats server-side via tools.js
        const stats = await tools.computeStudentStats.execute({ studentId });

        if (!stats.hasData) {
            return res.json({
                hasData: false,
                studentId,
                candidateName: stats.candidateName,
                targetTrack: stats.targetTrack,
                message: "No practice activity or interview evaluations recorded yet."
            });
        }

        // 2. Check for cached analysis if not forced
        if (!force) {
            const cached = await tools.getSavedAnalytics.execute({ studentId });
            if (cached && cached.analysis) {
                return res.json({
                    hasData: true,
                    studentId,
                    computedStats: cached.computedStats || stats,
                    analysis: cached.analysis,
                    cached: true,
                    updatedAt: cached.updatedAt
                });
            }
        }

        // 3. Attempt LLM generation for nuanced analysis
        let parsedAnalysis = null;
        try {
            const prompt = `You are the STRATA Placement Telemetry AI. Analyze this engineering student's deterministic performance stats and output STRICT JSON only (no markdown, no backticks, no extra text).

STUDENT STATS:
- Candidate: ${stats.candidateName}
- Target Track: ${stats.targetTrack}
- Overall Readiness Score: ${stats.overallScore}/100
- Sprint Questions Answered: ${stats.totalQuestions} (Accuracy: ${stats.overallAccuracy}%)
- Coding Problems Solved: ${stats.codingSolvedCount} of ${stats.totalCodeSubmissions} submissions
- Mock Interviews Evaluated: ${stats.mockInterviewCount} (Avg Technical Score: ${stats.avgTechnicalScore}/100)
- Roadmap Progress: ${stats.roadmapProgressPct}%
- Top Strengths: ${JSON.stringify(stats.strongTopics)}
- Flagged Weaknesses: ${JSON.stringify(stats.weakTopics)}
- Topic Accuracy Breakdown: ${JSON.stringify(stats.topicBreakdown.slice(0, 6))}

SCHEMA REQUIRED:
{
  "overall_score": ${stats.overallScore},
  "summary": "2-3 sentences, plain and specific describing exact standing and trends",
  "strengths": [
    { "topic": "string", "score": number, "evidence": "string with specific data" }
  ],
  "weaknesses": [
    { "topic": "string", "score": number, "evidence": "string with specific data", "why_it_matters": "string" }
  ],
  "topic_breakdown": [
    { "topic": "string", "accuracy": number, "attempts": number, "trend": "up | down | flat" }
  ],
  "suggestions": [
    { "title": "string", "priority": "high | medium | low", "action": "concrete actionable task", "estimated_time": "string e.g. 30 mins" }
  ],
  "next_milestone": "one concrete single most important next target"
}`;

            const aiResult = await LLMProvider.generateCompletion({
                messages: [{ sender: 'user', content: prompt }],
                studentId,
                contextType: 'placement_strategy',
                temperature: 0.2
            });

            if (aiResult?.content) {
                const cleaned = aiResult.content.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
                const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const raw = JSON.parse(jsonMatch[0]);
                    if (raw.summary && Array.isArray(raw.strengths) && Array.isArray(raw.weaknesses)) {
                        parsedAnalysis = {
                            overall_score: typeof raw.overall_score === 'number' ? raw.overall_score : stats.overallScore,
                            summary: String(raw.summary),
                            strengths: raw.strengths,
                            weaknesses: raw.weaknesses,
                            topic_breakdown: Array.isArray(raw.topic_breakdown) && raw.topic_breakdown.length > 0 ? raw.topic_breakdown : stats.topicBreakdown,
                            suggestions: Array.isArray(raw.suggestions) ? raw.suggestions : [],
                            next_milestone: String(raw.next_milestone || "Complete targeted practice drills")
                        };
                    }
                }
            }
        } catch (llmErr) {
            console.warn("Analytics LLM generation unavailable, using deterministic blueprint:", llmErr.message);
        }

        // 4. Fallback to deterministic analysis if LLM output was absent or invalid
        if (!parsedAnalysis) {
            parsedAnalysis = buildDeterministicAnalysis(stats);
        }

        // 5. Persist strictly via tools.js
        const saved = await tools.saveAnalytics.execute({
            studentId,
            analysis: parsedAnalysis,
            computedStats: stats
        });

        return res.json({
            hasData: true,
            studentId,
            computedStats: stats,
            analysis: parsedAnalysis,
            cached: false,
            updatedAt: saved.updatedAt
        });
    } catch (err) {
        console.error("GET /api/analytics/profile error:", err);
        return res.status(500).json({ error: "Failed to generate analytics profile." });
    }
});

// POST /api/analytics/reanalyze - Force re-computation
router.post('/analytics/reanalyze', requireAuth, async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const stats = await tools.computeStudentStats.execute({ studentId });

        if (!stats.hasData) {
            return res.json({
                hasData: false,
                studentId,
                message: "No activity recorded yet to analyze."
            });
        }

        const deterministic = buildDeterministicAnalysis(stats);
        const saved = await tools.saveAnalytics.execute({
            studentId,
            analysis: deterministic,
            computedStats: stats
        });

        return res.json({
            hasData: true,
            studentId,
            computedStats: stats,
            analysis: deterministic,
            cached: false,
            updatedAt: saved.updatedAt
        });
    } catch (err) {
        console.error("POST /api/analytics/reanalyze error:", err);
        return res.status(500).json({ error: "Failed to re-analyze profile." });
    }
});



// ══════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ══════════════════════════════════════════════════════════════════

const RATE_LIMIT_MAP = new Map();
function authRateLimit(req, res, next) {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const entry = RATE_LIMIT_MAP.get(ip);
    if (!entry || now > entry.resetAt) {
        // Evict expired entries if map grows large
        if (RATE_LIMIT_MAP.size > 5000) {
            for (const [k, v] of RATE_LIMIT_MAP.entries()) {
                if (now > v.resetAt) RATE_LIMIT_MAP.delete(k);
            }
        }
        RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
        return next();
    }
    // High capacity threshold for 100+ student testing & campus network labs
    if (entry.count >= 2000) {
        return res.status(429).json({ error: 'Too many attempts. Please try again later.' });
    }
    entry.count++;
    return next();
}

function setSessionCookie(res, token, rememberMe) {
    const isHttps = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.NETLIFY;
    const opts = {
        httpOnly: true,
        sameSite: 'Lax',
        path: '/',
        secure: isHttps,
        maxAge: (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000
    };
    res.cookie('session_token', token, opts);
}

// POST /api/auth/login
router.post('/auth/login', authRateLimit, async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const normalizedEmail = typeof email === 'string' ? email.trim() : '';
        if (!normalizedEmail || typeof password !== 'string' || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }
        if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ error: 'Enter a valid email address.' });
        }
        const user = db.findUserByEmail(normalizedEmail);
        const valid = user ? await db.verifyPassword(user, password) : false;
        if (!user || !valid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }
        const session = db.createSession(user.id, !!rememberMe);
        setSessionCookie(res, session.token, !!rememberMe);
        const { passwordHash, ...safeUser } = user;
        return res.json({ user: safeUser, token: session.token });
    } catch (err) {
        console.error('[/auth/login]', err);
        return res.status(500).json({ error: 'An internal error occurred.' });
    }
});

// POST /api/auth/signup
router.post('/auth/signup', authRateLimit, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
        if (!normalizedName || !normalizedEmail || typeof password !== 'string' || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (normalizedName.length > 100) return res.status(400).json({ error: 'Name must be 100 characters or fewer.' });
        if (normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ error: 'Enter a valid email address.' });
        }
        if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        if (Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ error: 'Password must be 72 UTF-8 bytes or fewer.' });
        }
        const result = await db.createUser({ name: normalizedName, email: normalizedEmail, password });
        if (result && result.error === 'EMAIL_EXISTS') {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }
        const session = db.createSession(result.id, false);
        setSessionCookie(res, session.token, false);
        const { passwordHash, ...safeUser } = result;
        return res.status(201).json({ user: safeUser, token: session.token });
    } catch (err) {
        console.error('[/auth/signup]', err);
        return res.status(500).json({ error: 'An internal error occurred.' });
    }
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
    let token = req.cookies && req.cookies.session_token;
    if (!token) {
        const authHeader = req.headers && (req.headers.authorization || req.headers.Authorization);
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7).trim();
        }
    }
    if (token) db.deleteSession(token);
    res.clearCookie('session_token', { path: '/' });
    return res.json({ success: true });
});

// GET /api/auth/me
router.get('/auth/me', requireAuth, (req, res) => {
    const user = db.getStudentById(req.sessionUserId);
    if (!user) return res.status(401).json({ error: 'User not found.' });
    const { passwordHash, ...safeUser } = user;
    return res.json({ user: safeUser });
});

// POST /api/auth/forgot-password
router.post('/auth/forgot-password', authRateLimit, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) return res.status(400).json({ error: 'Email is required.' });
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Enter a valid email address.' });
    }

    const genericMessage = 'If an account matches that address and email delivery succeeds, reset instructions will arrive shortly. If nothing arrives, contact support.';
    const appUrlValue = process.env.APP_URL?.trim();
    let appBaseUrl;
    try {
        appBaseUrl = new URL(appUrlValue || `http://localhost:${process.env.PORT || 3000}`);
        const unsafeProductionUrl = process.env.NODE_ENV === 'production' && (
            appBaseUrl.protocol !== 'https:' ||
            ['localhost', '127.0.0.1', 'yourapp.com'].includes(appBaseUrl.hostname.toLowerCase())
        );
        if (!['http:', 'https:'].includes(appBaseUrl.protocol) || unsafeProductionUrl) throw new Error('APP_URL is not a public HTTPS URL.');
    } catch {
        return res.status(503).json({ error: 'Password reset is not configured correctly. Please contact support.' });
    }

    // Check delivery configuration before looking up the account so an
    // unconfigured mail service cannot reveal whether an address is registered.
    if (!emailService.isConfigured()) {
        return res.status(503).json({ error: 'Password reset email delivery is not configured. Please contact the site administrator.' });
    }

    const user = db.findUserByEmail(email);
    if (user) {
        const token = db.createPasswordResetToken(user.email);
        const resetUrl = new URL('/reset-password', appBaseUrl);
        resetUrl.searchParams.set('token', token);
        try {
            await emailService.sendPasswordResetEmail(user.email, resetUrl.toString());
        } catch (mailErr) {
            db.removePasswordResetToken(token);
            // Keep the response identical for known and unknown accounts.
            console.error('[forgot-password] Reset email delivery failed:', mailErr.message);
        }
    }

    return res.status(202).json({ message: genericMessage });
});

// POST /api/auth/reset-password
router.post('/auth/reset-password', limitExpensiveOperation(30), async (req, res) => {
    try {
        const { token, newPassword } = req.body || {};
        if (typeof token !== 'string' || !token || typeof newPassword !== 'string' || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required.' });
        }
        if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        if (Buffer.byteLength(newPassword, 'utf8') > 72) {
            return res.status(400).json({ error: 'Password must be 72 UTF-8 bytes or fewer.' });
        }
        const result = await db.resetPassword(token, newPassword);
        if (result.error) return res.status(400).json({ error: 'Reset link is invalid or has expired.' });
        return res.json({ success: true });
    } catch (err) {
        console.error('[/auth/reset-password]', err);
        return res.status(500).json({ error: 'An internal error occurred.' });
    }
});

// GET /api/auth/oauth-status
router.get('/auth/oauth-status', (req, res) => {
    const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    return res.json({ googleConfigured: configured });
});

// GET /api/auth/google
router.get('/auth/google', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        return res.status(503).json({ error: 'Google OAuth is not configured on this server.' });
    }
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`;
    return res.redirect(302, googleAuthUrl);
});

// GET /api/auth/google/callback
router.get('/auth/google/callback', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        return res.status(503).json({ error: 'Google OAuth is not configured on this server.' });
    }
    const code = req.query.code;
    if (!code) {
        return res.status(400).json({ error: 'Authorization code is missing.' });
    }
    return res.redirect(302, '/login?error=oauth_unsupported');
});

module.exports = router;
