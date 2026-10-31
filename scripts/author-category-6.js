/**
 * STRATA Journal: Category 6 (Platform Updates)
 * Accurately describes features that exist and work in InterviewX / STRATA today.
 */

const fs = require('fs');
const path = require('path');
const ARTICLES_DIR = path.resolve(__dirname, '../content/articles');

const articles = [
    // ═════════════════════════════════════════════════════════════════════════
    // 6. PLATFORM UPDATES (4 articles)
    // ═════════════════════════════════════════════════════════════════════════
    {
        slug: 'voice-mock-interview-real-time-scoring',
        frontMatter: {
            title: 'Inside InterviewX Voice Mock Interview: Real-Time Scoring',
            slug: 'voice-mock-interview-real-time-scoring',
            summary: 'How our audio pipeline captures speech, transcribes via Groq Whisper with technical vocab hints, and grades answers on structured rubrics.',
            category: 'Platform Updates',
            tags: ['Platform', 'Voice AI', 'Mock Interview', 'Whisper', 'Telemetry'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/voice-mock-interview-real-time-scoring.svg',
            coverAlt: 'InterviewX real-time voice mock interview architecture',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'InterviewX Voice Simulator Architectural Whitepaper', url: 'https://github.com/it-interview-practice/docs', accessedDate: '2026-10-30' },
                { title: 'Groq API Whisper Large v3 Audio Documentation', url: 'https://console.groq.com/docs/speech-text', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Launch Voice Mock Interview Simulator', url: '/simulator', type: 'simulator' },
                { title: 'Interview Question Telemetry Bank', url: '/practice', type: 'practice' }
            ]
        },
        body: `# Inside InterviewX Voice Mock Interview: Real-Time Scoring

Practicing technical and behavioral interview questions by typing answers into a text box does not prepare students for the physical pressure of a live interview. In real interviews, candidates must articulate complex algorithmic invariants out loud, control filler words, pace their speech, and structure answers under strict time constraints.

To solve this challenge, InterviewX built a production-grade **Voice Mock Interview Simulator** that replicates live conversational interview dynamics with deterministic, evidence-based rubric scoring.

> **Key takeaways:**
> - In-browser audio recording transmits speech to Groq Whisper with a specialized technical vocabulary hint list, preventing transcription errors on terms like \`B-Tree\`, \`Dijkstra\`, or \`Kafka\`.
> - Answers are never graded by an arbitrary LLM opinion; an automated judge matches extracted claims against a structured rubric with verbatim quotes, and marks are computed in code.
> - Delivery metrics (words per minute, filler words, pause duration) are tracked separately and never reduce technical correctness marks.

## 1. The Speech Capture and Transcription Architecture

Legacy speech-to-text systems frequently butcher technical computer science terminology (e.g., mishearing "Kubernetes" as "copper net is" or "monikers" for "monotonic"). InterviewX solves this through a multi-stage pipeline:

1. **High-Fidelity Audio Capture**: The browser records raw microphone audio using the MediaStream API with real-time audio level metering. A 3-second pause timeout, push-to-talk mode, and a visible "I'm done" button ensure students are never prematurely cut off.
2. **Server-Side Groq Whisper Transcription**: The audio buffer is dispatched to Groq's high-throughput Whisper engine with an injected vocabulary prompt containing over 200 technical computer science terms across Data Structures, DBMS, Operating Systems, Computer Networks, and Cloud Architecture.
3. **Transcript Confirmation Modal**: Before scoring occurs, the student can review their transcript, edit misheard words, or re-record, guaranteeing that scoring reflects their actual intended answer.

## 2. Deterministic, Evidence-Based Rubric Scoring

A major flaw of generic AI evaluators is score drift—the same answer might receive 7/10 in one run and 4/10 in another. InterviewX eliminates this with a four-step scoring engine:

- **Claim Extraction**: The model extracts discrete technical claims from the confirmed transcript.
- **Rubric Matching**: Each claim is matched against pre-validated key points stored in our database. The system returns strictly \`covered\`, \`partial\`, \`missing\`, or \`contradicted\`.
- **Verbatim Evidence Requirement**: For any key point marked covered, the system MUST return a direct verbatim quote from the student's transcript as proof. No quote means zero credit.
- **Code-Calculated Marks**: The numerical mark is calculated deterministically in backend code:
  $$\\text{Mark} = \\sum (\\text{Weight}_i \\times \\text{Credit}_i) - \\text{Penalty}$$
  Normalized to a calibrated 10-point scale.

## 3. Independent Delivery Analytics

How you say an answer matters, but it should not distort what you know. InterviewX analyzes delivery on a completely separate channel:
- **Pace Tracking**: Evaluates words per minute (optimal: 120 to 150 WPM).
- **Filler Word Detection**: Highlights occurrences of *"um"*, *"uh"*, *"like"*, and *"you know"*.
- **Pause Telemetry**: Highlights extended silences.

Experience the future of interview preparation today:
- [Launch the Voice Mock Simulator](/simulator)
- [Practice Curated Question Banks](/practice)
`
    },
    {
        slug: 'sandboxed-compiler-hidden-test-suites',
        frontMatter: {
            title: 'Sandboxed Code Execution Engine: Multi-Language Testing',
            slug: 'sandboxed-compiler-hidden-test-suites',
            summary: 'How STRATA executes submissions in isolated sandboxes with 16 comprehensive hidden test cases, custom checkers, and strict memory limits.',
            category: 'Platform Updates',
            tags: ['Platform', 'Code Execution', 'Sandbox', 'Judge0', 'Compiler'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/sandboxed-compiler-hidden-test-suites.svg',
            coverAlt: 'STRATA sandboxed code execution engine and test suite runner',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'STRATA Sandboxed Judge Architecture and Security Specification', url: 'https://github.com/it-interview-practice/docs', accessedDate: '2026-10-30' },
                { title: 'Node.js VM Security Isolation Reference Documentation', url: 'https://nodejs.org/api/vm.html', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Launch Interactive Coding Arena', url: '/compiler', type: 'compiler' },
                { title: 'Two Sum Problem Arena', url: '/compiler/two-sum', type: 'problem' }
            ]
        },
        body: `# Sandboxed Code Execution Engine: Multi-Language Testing

In typical educational programming platforms, coding problems either show the full solution in the statement or evaluate code by comparing plain strings, which erroneously rejects correct alternative solutions or accepts hardcoded sample outputs.

STRATA was engineered from the ground up to provide **authentic, production-grade competitive coding evaluation**. Students receive empty starter skeletons with zero logic, private reference solutions and hidden test suites are never sent to the browser, and all code is compiled and executed inside hardened, isolated execution sandboxes.

> **Key takeaways:**
> - Absolute separation of public and private data: hidden test cases, expected outputs, and reference solutions live server-side only and are never exposed via API.
> - Submissions run against a comprehensive hidden suite of at least 16 test cases covering minimal sizes, negative numbers, extreme constraints, and duplicate values.
> - Custom mathematical checkers validate problems with multiple valid outputs (e.g., indices returned in any order).

## 1. Strict Public / Private Data Isolation

When a user visits a problem in STRATA (e.g., \`/compiler/two-sum\`), the client receives only:
- Title, statement, and constraints.
- Sample inputs and sample outputs.
- Empty language starter templates (function signatures with a \`// TODO\` comment).
- Count of available hints.

Everything private—the optimal $O(n)$ reference solution, the independent brute-force solution, the 16 hidden test cases, and the editorial approach—is stored exclusively in secure server-side collections.

## 2. Sandboxed Execution Engine and Error Verdicts

Submissions in JavaScript, Python, C++, and Java are processed through our hardened containerized runner or isolated V8 VM engine with strict resource governance:

- **Compilation Error (CE)**: Triggered immediately if syntax validation fails before execution begins, returning compiler error output without counting as a runtime failure.
- **Time Limit Exceeded (TLE)**: Enforces strict 2.0-second CPU execution timeouts to terminate infinite loops and catch suboptimal $O(n^2)$ solutions on large constraints.
- **Memory Limit Exceeded (MLE)**: Restricts heap memory allocation (128 MB maximum) to prevent heap exhaustion.
- **Output Limit Exceeded (OLE)**: Caps stdout at 64 KB to prevent output flooding and browser freezing.

## 3. Custom Mathematical Checkers

For problems where multiple correct answers exist, string comparison fails. For example, in Two Sum, returning \`[0, 1]\` or \`[1, 0]\` is equally valid.

STRATA utilizes custom checkers that evaluate mathematical invariants directly against the original input array:
$$\\text{nums}[i] + \\text{nums}[j] == \\text{target} \\quad \\text{and} \\quad i \\neq j$$
This ensures that any valid algorithmic permutation is awarded an **Accepted** verdict.

## 4. Anti-Cheat Reward Invariants

- **First-Solve Integrity**: Platform coins (50 coins) and streak increments are awarded only on a user's first verified Accepted solve.
- **Locked Editorial**: Editorial solutions unlock only after an Accepted solve or when a student explicitly confirms "Give up and view". Viewing early permanently forfeits coins for that problem.

Test your algorithmic speed in the code arena:
- [Launch the Coding Arena](/compiler)
- [Solve Longest Substring Without Repeating Characters](/compiler/longest-substring-without-repeating-characters)
`
    },
    {
        slug: 'interactive-ai-study-roadmaps',
        frontMatter: {
            title: 'Interactive AI Study Roadmaps: Personalized Learning Paths',
            slug: 'interactive-ai-study-roadmaps',
            summary: 'Tailor your 30-to-90-day preparation sprint across 6 specialized interview tracks with dynamic topic mastery checks and knowledge-base links.',
            category: 'Platform Updates',
            tags: ['Platform', 'Roadmaps', 'AI Planner', 'Learning Path', 'Preparation'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/interactive-ai-study-roadmaps.svg',
            coverAlt: 'Personalized interactive AI study roadmap visualization',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'InterviewX Autonomous Placement Engineering Whitepaper', url: 'https://github.com/it-interview-practice/docs', accessedDate: '2026-10-30' },
                { title: 'Computer Science Curricula 2023 (CS2023), ACM/IEEE-CS', url: 'https://csed.acm.org', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Interactive Learning Roadmaps', url: '/roadmaps', type: 'roadmap' },
                { title: 'AI Personalized Career Planner', url: '/planner', type: 'planner' }
            ]
        },
        body: `# Interactive AI Study Roadmaps: Personalized Learning Paths

A major obstacle for engineering students preparing for campus placements is information overload. With thousands of random coding questions online, students often waste months jumping aimlessly between advanced graph algorithms and basic syntax, leaving critical gaps in core CS fundamentals and system design.

InterviewX addresses this with **Interactive AI Study Roadmaps**, an automated planning engine that creates structured, week-by-week preparation sprints tailored to your target company tier, graduation year, and available study hours.

> **Key takeaways:**
> - Choose from 6 specialized interview tracks or generate a custom personalized sprint via the AI Planner.
> - Every milestone links directly to verified question banks, interactive coding challenges, and technical journal articles.
> - Progress tracking recalculates your placement readiness score in real time as you complete milestones.

## 1. Six Curated Placement Tracks

Students can instantly enroll in any of our calibrated curriculum tracks:

1. **Fullstack SDE Sprint (60 Days)**: Complete end-to-end roadmap covering Java/Node.js, RESTful API design, relational data modeling, and core DSA patterns.
2. **Algorithms & Data Structures Specialist**: Rigorous progression from Two Pointers and Sliding Window to Dynamic Programming, Monotonic Stacks, Graphs, and Trie.
3. **Core CS Foundations (OS, DBMS, Networks)**: Deep-dive curriculum on operating system scheduling, deadlock prevention, B-Tree vs LSM indexing, and TCP/IP sockets.
4. **System Architecture & Distributed Design**: Foundational concepts for high-throughput backends: load balancing, consistent hashing, caching strategies, and event-driven queues.
5. **Tier-2 Services Speed & Aptitude Track**: Targeted for high-speed recruitment drives (TCS Prime, Infosys Specialist) focusing on quantitative speed, logical deduction, and core coding.
6. **Amazon & Product Leadership Track**: High-yield preparation for behavioral leadership principles, STAR formatting, and system design trade-offs.

## 2. Dynamic Progress Telemetry

As you practice questions and solve problems inside the STRATA arena:
- Completed milestones update automatically with timestamped verification.
- The readiness engine highlights areas of weakness (e.g., *"Your DBMS accuracy is 85%, but Dynamic Programming is at 40%"*).
- Suggested practice drills adjust dynamically to shore up identified gaps.

Generate your personalized preparation schedule now:
- [Explore Interactive Roadmaps](/roadmaps)
- [Generate a Custom AI Study Plan](/planner)
`
    },
    {
        slug: 'company-targeted-prep-sheets',
        frontMatter: {
            title: 'Comprehensive Company Prep Sheets: 3,555+ Problem Index',
            slug: 'company-targeted-prep-sheets',
            summary: 'Explore curated problem sets and previous interview questions for Amazon, Google, Microsoft, TCS, Infosys, and high-growth tech startups.',
            category: 'Platform Updates',
            tags: ['Platform', 'Company Sheets', 'Question Bank', 'FAANG', 'Placements'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/company-targeted-prep-sheets.svg',
            coverAlt: 'Company targeted interview question catalog index',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'InterviewX Telemetry and Question Ingestion Engine', url: 'https://github.com/it-interview-practice/docs', accessedDate: '2026-10-30' },
                { title: 'Company Recruitment Archive & Interview Index', url: 'https://github.com/it-interview-practice/sources', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Company Problem Question Bank', url: '/practice', type: 'practice' },
                { title: 'Interactive Coding Arena', url: '/compiler', type: 'compiler' }
            ]
        },
        body: `# Comprehensive Company Prep Sheets: 3,555+ Problem Index

Preparing for a specific company requires practicing the exact problem patterns, difficulty distributions, and domain questions that company asks. Practicing random tree problems when preparing for an IT services aptitude drive is inefficient; similarly, practicing basic arithmetic when preparing for an Amazon SDE-1 loop will result in failure.

InterviewX provides over **3,555 company-tagged technical interview questions and coding challenges**, organized into curated company prep sheets.

> **Key takeaways:**
> - Filter questions by target company (Amazon, Google, Microsoft, TCS, Infosys, Cognizant, and startups) and topic categories.
> - Each question features authentic difficulty calibrations, topic tags, acceptance telemetry, and detailed conceptual explanations.
> - Seamlessly transition from reviewing a question to executing working code in the integrated compiler arena.

## 1. Company-Specific Curricula

Our problem bank covers the distinct hiring profiles across the tech industry:

### Product Giants (Amazon, Google, Microsoft, Meta)
Focuses on algorithmic elegance, edge cases, and optimal space-time trade-offs:
- Graph traversals (BFS, DFS, Dijkstra, Topological Sort).
- Dynamic Programming (1D, 2D, Knapsack, Longest Common Subsequence).
- Monotonic data structures and sliding windows.

### Tier-1 & Tier-2 IT Services (TCS, Infosys, Wipro, Accenture)
Focuses on speed and fundamentals:
- Quantitative and logical aptitude speed drills.
- Core array and string manipulation under timed constraints.
- DBMS relational queries, normal forms, and SQL joins.

### High-Growth Startups & Scaleups
Focuses on practical implementation:
- RESTful service architecture and API contract design.
- Concurrency, caching (LRU Cache), and asynchronous queues.
- Real-world debugging and refactoring scenarios.

## 2. Advanced Search and Categorization

The practice dashboard allows students to filter by:
- **Topic & Subtopic**: Array, Hash Table, Two Pointers, Dynamic Programming, Tree, Graph, OS, DBMS, Networks, and Aptitude.
- **Difficulty**: Easy, Medium, Hard.
- **Company Tag**: Instant filtering for specific hiring drives.
- **Status**: Track solved vs unsolved problems to ensure 100% curriculum coverage.

Start practicing with targeted company sheets today:
- [Open the Company Practice Dashboard](/practice)
- [Enter the Sandboxed Coding Arena](/compiler)
`
    }
];

// Write articles to disk
for (const a of articles) {
    let md = '---\n';
    for (const [k, v] of Object.entries(a.frontMatter)) {
        if (Array.isArray(v)) {
            if (typeof v[0] === 'object' && v[0] !== null) {
                md += `${k}:\n`;
                for (const item of v) {
                    const entries = Object.entries(item);
                    md += `  - ${entries[0][0]}: "${entries[0][1]}"\n`;
                    for (let i = 1; i < entries.length; i++) {
                        md += `    ${entries[i][0]}: "${entries[i][1]}"\n`;
                    }
                }
            } else {
                md += `${k}: [${v.map(item => `"${item}"`).join(', ')}]\n`;
            }
        } else if (typeof v === 'string') {
            md += `${k}: "${v}"\n`;
        } else {
            md += `${k}: ${v}\n`;
        }
    }
    md += '---\n\n' + a.body.trim() + '\n';
    fs.writeFileSync(path.join(ARTICLES_DIR, `${a.slug}.md`), md);
}

console.log(`Wrote Category 6: ${articles.length} articles to ${ARTICLES_DIR}`);
