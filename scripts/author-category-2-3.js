/**
 * STRATA Journal: Category 2 (Interview Guides) & Category 3 (Career)
 */

const fs = require('fs');
const path = require('path');
const ARTICLES_DIR = path.resolve(__dirname, '../content/articles');

const articles = [
    // ═════════════════════════════════════════════════════════════════════════
    // 2. INTERVIEW GUIDES (4 articles)
    // ═════════════════════════════════════════════════════════════════════════
    {
        slug: 'anatomy-big-tech-coding-interview',
        frontMatter: {
            title: 'Anatomy of a Big-Tech Coding Interview Loop',
            slug: 'anatomy-big-tech-coding-interview',
            summary: 'A transparent breakdown of how calibrators and hiring committees evaluate technical problem solving, code quality, edge cases, and communication.',
            category: 'Interview Guides',
            tags: ['FAANG', 'MAANG', 'Interview Loop', 'Coding Round', 'Evaluation'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/anatomy-big-tech-coding-interview.svg',
            coverAlt: 'Big-tech coding interview stages and timing breakdown',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'Google Careers Official Guide to Technical Interviews', url: 'https://careers.google.com/how-we-hire/interview/', accessedDate: '2026-10-30' },
                { title: 'Meta Engineering Careers: Coding Interview Preparation', url: 'https://www.metacareers.com/swe-prep-technical', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Voice Mock Technical Interview Simulator', url: '/simulator', type: 'simulator' },
                { title: 'Company-Specific Coding Question Bank', url: '/practice', type: 'practice' }
            ]
        },
        body: `# Anatomy of a Big-Tech Coding Interview Loop

For a third-year or final-year engineering student in India, cracking an interview at a tier-1 product firm or Global Capability Center (such as Google, Microsoft, Amazon, or Uber) often feels like a black box. Many students believe that getting the test cases to pass is 100% of the battle. In practice, hiring committees evaluate candidates along multiple dimensions that go far beyond raw code syntax.

As of October 2026, most top-tier software engineering (SDE-1) loops consist of 3 to 4 technical interviews lasting 45 to 60 minutes each, conducted either on virtual collaborative coding pads or in person. This guide dissects exactly how each minute of a 45-minute round is evaluated and what calibrators write in their scorecards.

> **Key takeaways:**
> - Never start coding in the first 5 minutes. Spend that time asking clarifying questions about constraints, data volume, and edge cases.
> - State the brute-force time complexity first to establish a baseline, then formulate the optimal algorithmic pattern before typing code.
> - High-scoring candidates treat the session as an active technical collaboration: they think out loud, verify bounds, and dry-run test cases methodically.

## 1. The 45-Minute Breakdown

Top-tier engineering rounds adhere to a structured timing rubric designed to give every candidate an equal, calibrated evaluation:

### Minutes 0 to 5: Introductions and Problem Statement
The interviewer briefly introduces themselves and presents the problem statement. This is not the moment to code. Instead, clarify ambiguity:
- *"What is the maximum size of the input array ($n \\le 10^5$ or $n \\le 10^3$)? The answer determines whether an $O(n \\log n)$ or $O(n)$ algorithm is required."*
- *"Can the input contain negative numbers, duplicates, or empty lists?"*
- *"Are we optimizing primarily for minimum runtime or auxiliary memory usage?"*

### Minutes 5 to 15: Algorithmic Design and Invariant Formulation
Explain the brute-force approach in 60 seconds (for example, comparing every pair in $O(n^2)$). Then explain why that is suboptimal. Propose your target data structure (such as a hash map, monotonic queue, or binary search) and prove why it achieves optimal $O(n)$ time.
Only when the interviewer confirms—*"That approach makes sense, go ahead and code it"*—do you begin implementation.

### Minutes 15 to 35: Modular Implementation
Write clean, readable, idiomatic code. Follow standard software engineering best practices:
- Use meaningful variable names (\`windowStart\`, \`maxProfit\`, not \`a\`, \`b\`, \`temp1\`).
- Break complex helper logic into focused functions.
- Avoid repetitive copy-pasting; maintain clean modularity.

### Minutes 35 to 40: Dry Run and Edge-Case Walkthrough
Before telling the interviewer you are finished, step through your code line by line with a small test input. Test extreme boundary conditions:
- An empty array or single-element input.
- An array containing duplicate values.
- Maximum integer values that might cause 32-bit overflow.

### Minutes 40 to 45: Candidate Q&A
Ask thoughtful, engineering-focused questions about the team's architecture, recent migrations, or on-call workflows.

## 2. The Four Pillars of the Calibrator Rubric

Hiring committees typically evaluate feedback forms scored across four distinct competencies:

| Competency | Weight | What the Evaluator Looks For |
| :--- | :--- | :--- |
| **Problem Solving** | 35% | Translates ambiguous requirements into an optimal algorithmic family without hints. |
| **Coding & Idiom** | 25% | Writes clean, syntactically correct code with proper boundaries and no dead logic. |
| **Verification & Testing** | 20% | Proactively discovers edge cases and fixes bugs independently before running. |
| **Communication & Signals**| 20% | Explains trade-offs clearly; receptive to interviewer steering and feedback. |

## 3. How to Practice This Loop in STRATA

You can practice the exact timing and verbal communication required for this loop directly inside the platform:
- [Launch the Voice AI Interview Simulator](/simulator)
- [Practice Curated Company Problems](/practice)
`
    },
    {
        slug: 'it-services-hiring-rounds-guide',
        frontMatter: {
            title: 'How IT Services Hiring Rounds Work: Aptitude to HR',
            slug: 'it-services-hiring-rounds-guide',
            summary: 'Complete walkthrough of Tier-1 and Tier-2 campus recruitment drives covering cognitive tests, technical interviews, and manager rounds.',
            category: 'Interview Guides',
            tags: ['Campus Placements', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Aptitude'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/it-services-hiring-rounds-guide.svg',
            coverAlt: 'Campus placement drive recruitment stages',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'TCS Campus Recruitment and National Qualifier Test Overview', url: 'https://www.tcs.com/careers/india/entry-level', accessedDate: '2026-10-30' },
                { title: 'Infosys Campus Connect and Placement Framework', url: 'https://www.infosys.com/careers/graduates-interns.html', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Quantitative and Logical Aptitude Practice Tests', url: '/practice?topic=aptitude', type: 'practice' },
                { title: 'Automated Placement Readiness Roadmap', url: '/roadmaps', type: 'roadmap' }
            ]
        },
        body: `# How IT Services Hiring Rounds Work: Aptitude to HR

For engineering colleges across India, mass and differentiated recruitment drives conducted by major IT services firms (such as Tata Consultancy Services, Infosys, Cognizant, Wipro, and Accenture) form the foundation of campus placement season. As of October 2026, these companies have bifurcated their hiring into distinct tiers: a standard entry-level band and premium differential packages (such as TCS Prime, Infosys Specialist, or Cognizant GenC Elevate).

Securing the higher compensation bracket requires clearing an online proctored aptitude test, passing two automated coding problems, and succeeding in a combined technical and managerial interview. This guide details each round of the process.

> **Key takeaways:**
> - Cognitive aptitude tests have strict sectional time cutoffs; spending more than 90 seconds on a single quantitative question severely damages your chances.
> - Differentiated tracks require solving at least one complete coding question with optimal time complexity (handling all private test cases).
> - The technical interview focuses heavily on your final-year project, database fundamentals, OOP concepts, and basic cloud awareness.

## 1. Round 1: The Online Assessment (Cognitive & Coding)

The initial assessment is typically an automated proctored test lasting between 90 and 120 minutes. It is divided into three timed sections:

1. **Numerical Ability (Quantitative Reasoning)**: Focuses on arithmetic speed, percentages, ratios, time and work, permutations and combinations, and probability. Sectional time is tightly restricted—usually 20 to 25 questions in 25 to 30 minutes.
2. **Verbal Ability**: Sentence correction, reading comprehension, vocabulary in context, and paragraph arrangement.
3. **Advanced Coding Section**: Two problems. Problem 1 is typically an array or string manipulation problem of easy-to-medium difficulty (for example, finding duplicates or reversing words). Problem 2 is an algorithmic challenge (such as dynamic programming, trees, or graphs) that determines qualification for the premium package tier.

## 2. Round 2: The Technical Interview

Candidates who clear the cutoff advance to the technical interview. Unlike product companies that focus purely on raw algorithmic coding on a whiteboard, IT services interviewers look for a balanced profile across three core areas:

### Core Computer Science Fundamentals
- **Object-Oriented Programming (OOP)**: Be ready to explain polymorphism, abstraction vs encapsulation, and inheritance with code examples in Java, Python, or C++.
- **Database Management Systems (DBMS)**: Explain ACID properties, write multi-table \`INNER\` and \`LEFT\` joins, and distinguish between primary, foreign, and unique keys.
- **Operating Systems (OS)**: Process vs thread, virtual memory, paging, and CPU scheduling algorithms.

### Project Defense
Interviewers will ask you to explain your academic or personal capstone project. Be prepared to explain:
- What problem does the application solve?
- What database did you select and why (relational vs NoSQL)?
- What was the most difficult bug you encountered and how did you resolve it?

## 3. Round 3: The Managerial & HR Round

The final round evaluates cultural fit, communication skills, and willingness to learn. Typical questions include:
- *"Are you comfortable relocating to any delivery center across India?"*
- *"How do you handle working on a technology stack you have never used before?"*
- *"Describe a situation where a team member missed a project deadline and how you resolved the conflict."*

## 4. Practice and Placement Readiness in STRATA

Prepare systematically for aptitude cutoffs and technical interviews:
- [Solve Quantitative and Logic Aptitude Drills](/practice?topic=aptitude)
- [Review the 60-Day Placement Roadmap](/roadmaps)
`
    },
    {
        slug: 'startup-interviews-takehomes-guide',
        frontMatter: {
            title: 'Startup Engineering Interviews: Take-Homes and Projects',
            slug: 'startup-interviews-takehomes-guide',
            summary: 'What fast-growing startups look for in take-home assignments, system architecture discussions, live debugging, and production coding tests.',
            category: 'Interview Guides',
            tags: ['Startups', 'Take-Home Assignment', 'Fullstack', 'System Design', 'Debugging'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/startup-interviews-takehomes-guide.svg',
            coverAlt: 'Startup practical engineering evaluation pipeline',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'Y Combinator Library: How to Hire Engineers at Early-Stage Startups', url: 'https://www.ycombinator.com/library', accessedDate: '2026-10-30' },
                { title: 'GitLab Engineering Handbook: Practical Technical Assessments', url: 'https://handbook.gitlab.com/handbook/engineering', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Sandboxed Code Compiler & Execution Environment', url: '/compiler', type: 'compiler' },
                { title: 'Personalized Career Roadmap Generator', url: '/planner', type: 'planner' }
            ]
        },
        body: `# Startup Engineering Interviews: Take-Homes and Projects

Engineering students targeting fast-growing technology startups (seed to Series C) quickly discover that the hiring process differs substantially from traditional enterprise recruitment. While big tech companies focus heavily on algorithmic DSA puzzles, early-stage and high-growth startups value **shipping velocity, practical API design, code cleanliness, and autonomous debugging**.

Instead of 4 rounds of whiteboard algorithms, startup interviews frequently feature a take-home coding assignment followed by a live code review and system architecture discussion.

> **Key takeaways:**
> - Startup evaluators value comprehensive unit tests, clear README instructions, and Docker containerization far more than clever algorithmic micro-optimizations.
> - During live debugging rounds, verbalize your hypothesis before altering code. Read stack traces systematically rather than guessing.
> - Demonstrate pragmatic engineering: explain why you chose a simple solution today that can scale tomorrow, rather than over-engineering prematurely.

## 1. What Makes a Stellar Take-Home Submission?

When a startup gives you 48 hours to build a RESTful service (e.g., an URL shortener, rate-limited notification dispatch, or minimal analytics tracker), most applicants submit code that barely runs. To stand out in the top 5% of candidates, include the following:

### A Comprehensive README.md
Include setup instructions that any developer can run in under 3 minutes:
- Prerequisites (Node.js version, Python version, Docker).
- Exact startup commands (\`docker-compose up\` or \`npm install && npm start\`).
- Architecture diagram or short summary of data flow.
- Explicit list of trade-offs made due to the time constraint.

### Automated Unit and Integration Tests
Submissions without tests are often rejected outright. Include tests covering:
- Happy-path execution.
- Invalid input validation (e.g., empty payloads, malformed email addresses).
- Rate-limiting or concurrency handling.

### Error Handling and Clean HTTP Semantics
Never return generic 500 internal server errors. Use standard HTTP status codes:
- \`400 Bad Request\` with clear JSON validation error messages.
- \`404 Not Found\` when a requested resource does not exist.
- \`429 Too Many Requests\` when limits are exceeded.

## 2. The Live Code Review Round

After submitting a take-home project, you will typically pair with a senior engineer for 45 minutes to discuss your code. Common questions include:
- *"If this service received 50,000 requests per second, where would the database bottleneck emerge first?"*
- *"How would you add caching using Redis without returning stale data to users?"*
- *"Let's add a new feature right now: how would you extend the schema to support user authentication?"*

Be open to feedback. If the interviewer points out an edge case you missed, do not get defensive. Acknowledge it promptly and explain how you would patch it.

## 3. Practice Practical Problem Solving

Build real backend and algorithmic velocity on STRATA:
- [Explore the Sandboxed Code Execution Arena](/compiler)
- [Plan Your Career Path With the AI Planner](/planner)
`
    },
    {
        slug: 'behavioral-interviews-star-method',
        frontMatter: {
            title: 'Answering Behavioral Questions With the STAR Method',
            slug: 'behavioral-interviews-star-method',
            summary: 'Structure compelling engineering leadership answers using Situation, Task, Action, and Result without exaggeration or vague generalizations.',
            category: 'Interview Guides',
            tags: ['Behavioral', 'STAR Method', 'Leadership Principles', 'HR Round', 'Soft Skills'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/behavioral-interviews-star-method.svg',
            coverAlt: 'STAR behavioral response framework diagram',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'Amazon Leadership Principles and Behavioral Interviewing Guide', url: 'https://www.aboutamazon.com/about-us/leadership-principles', accessedDate: '2026-10-30' },
                { title: 'Harvard Business Review: How to Answer Behavioral Interview Questions', url: 'https://hbr.org', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'AI Voice Behavioral Simulator', url: '/simulator', type: 'simulator' },
                { title: 'Interview Question Telemetry Bank', url: '/practice?topic=behavioral', type: 'practice' }
            ]
        },
        body: `# Answering Behavioral Questions With the STAR Method

Many engineering candidates spend hundreds of hours solving algorithm problems only to be rejected in the behavioral or hiring manager round. A frequent misconception among students is that behavioral questions are a mere formality with no right or wrong answers.

In reality, companies like Amazon, Microsoft, and Google use behavioral interviews to evaluate critical professional competencies: ownership, dealing with ambiguity, technical communication, and conflict resolution. The STAR method is the industry standard framework for structuring your answers clearly and persuasively.

> **Key takeaways:**
> - Allocate your answer time strategically: Situation (15%), Task (10%), Action (60%), and Result (15%). Focus predominantly on what YOU personally did.
> - Use the pronoun "I" rather than "We" when describing actions. Interviewers need to evaluate your individual contribution, not just the team's output.
> - Always ground the Result in quantifiable metrics: latency reduction, user adoption, test coverage, or time saved.

## 1. What is the STAR Framework?

STAR is an acronym for four logical components of an experiential story:

1. **Situation (15%)**: Set the context. Describe the company, project, or academic team, and the specific challenge or constraint you faced. Keep it concise.
2. **Task (10%)**: Explain your specific responsibility. What was the goal or expectation, and what was at stake if the deadline was missed?
3. **Action (60%)**: The core of your answer. Walk through the technical and interpersonal steps you personally took. What trade-offs did you consider? What tools or architecture did you implement?
4. **Result (15%)**: The conclusion. Share the measurable business or technical outcome, what you learned, and what you would do differently in retrospect.

## 2. Sample Answer: Handling a Technical Conflict

**Question**: *"Tell me about a time you disagreed with a teammate on a technical decision and how you handled it."*

### Strong Response (Using STAR):

- **Situation**: *"During our third-year major project building an automated attendance portal for our college department, my teammate wanted to use MongoDB to store all student attendance records, whereas I believed a relational database like PostgreSQL was essential."*
- **Task**: *"As the backend developer responsible for data integrity, I had to ensure we did not introduce data anomalies or duplicate attendance logs across 1,200 enrolled students."*
- **Action**: *"Instead of arguing opinions, I suggested we conduct a 2-day spike. I created a sample schema in both databases and wrote a load script simulating 500 concurrent student check-ins. I demonstrated that without ACID transaction boundaries, our MongoDB prototype experienced race conditions that recorded duplicate check-ins. I then listened to my teammate's primary concern, which was rapid schema flexibility for student profile metadata, and proposed a compromise: we used PostgreSQL as our primary transactional store but utilized its native JSONB column support for flexible profile fields."*
- **Result**: *"The team agreed on this architecture. During deployment across our department, the system recorded over 25,000 attendance entries during final exams with zero duplicate logs and an average query latency under 45ms. My teammate and I continued collaborating effectively throughout our final semester."*

## 3. Practice Mock Behavioral Questions

Rehearse your STAR stories with instant audio feedback in our platform:
- [Launch the Voice Mock Interview Simulator](/simulator)
- [Review Common Behavioral Prompts](/practice?topic=behavioral)
`
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 3. CAREER (4 articles)
    // ═════════════════════════════════════════════════════════════════════════
    {
        slug: 'fresher-resume-recruiters-skim',
        frontMatter: {
            title: 'A Fresher Resume Recruiters Actually Skim in 15 Seconds',
            slug: 'fresher-resume-recruiters-skim',
            summary: 'How campus recruiters evaluate fresher resumes: formatting, action-driven project bullets, technical stack clarity, and common rejection traps.',
            category: 'Career',
            tags: ['Resume', 'Career', 'Fresher', 'Placements', 'Job Search'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/fresher-resume-recruiters-skim.svg',
            coverAlt: 'Engineering student resume layout visual',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'National Association of Colleges and Employers (NACE) Job Outlook Report', url: 'https://www.naceweb.org/career-development/trends-and-predictions/', accessedDate: '2026-10-30' },
                { title: 'ACM Career Guide for Undergraduate Computing Students', url: 'https://www.acm.org/education/curricula-recommendations', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Career Roadmap & Profile Planner', url: '/planner', type: 'planner' },
                { title: 'Comprehensive Skill Roadmaps', url: '/roadmaps', type: 'roadmap' }
            ]
        },
        body: `# A Fresher Resume Recruiters Actually Skim in 15 Seconds

During campus placement drives and off-campus application surges, a single university recruiter often reviews 300 to 500 fresher resumes in a single morning. Eye-tracking studies and recruiter telemetry reveal that the initial review of a student resume takes between 10 and 20 seconds. If your resume is formatted poorly, crowded with generic skill bars, or filled with vague bullet points, it gets rejected before anyone reads your code.

This guide provides an actionable blueprint for engineering freshers in India to format a crisp, ATS-friendly single-page resume that highlights practical skills.

> **Key takeaways:**
> - Keep your resume strictly to one page. Two-page resumes for undergraduates indicate a lack of editing and prioritization.
> - Replace passive descriptions (*"Worked on frontend"*) with Google's XYZ formula: *Accomplished [X], as measured by [Y], by doing [Z]*.
> - Never include graphical progress bars (e.g., "Python 85%") or icons that break Applicant Tracking Systems (ATS).

## 1. The Anatomy of an ATS-Compliant Fresher Resume

An Applicant Tracking System extracts text sequentially. Use a clean, single-column layout formatted with standard fonts (Helvetica, Arial, or Calibri) with 0.5 to 0.75-inch margins:

1. **Header**: Name in bold (18-20pt), email, phone number, LinkedIn URL, GitHub profile URL, and city/state. No photos or marital status.
2. **Education**: Degree name, college name, graduation year, and CGPA (include CGPA if $\\ge 7.0/10.0$).
3. **Technical Skills**: Group by categories:
   - *Languages*: Java, Python, C++, TypeScript, SQL.
   - *Frameworks & Libraries*: Spring Boot, React, Express.js, Node.js.
   - *Developer Tools & Cloud*: Git, Docker, Linux, PostgreSQL, AWS (S3, EC2).
4. **Projects (2 to 3 featured projects)**: The most critical section for freshers.
5. **Work Experience / Internships**: If available; otherwise feature open-source contributions or hackathons.
6. **Achievements & Certifications**: Competitive programming ratings (e.g., LeetCode Knight, Codeforces Specialist), hackathon rankings, or academic honors.

## 2. Writing High-Impact Project Bullets

A weak bullet point describes tasks; a strong bullet point demonstrates engineering impact:

- ❌ *Weak*: "Built an e-commerce website using MERN stack with cart and checkout."
- ✅ *Strong*: "Architected a fullstack e-commerce application using React, Node.js, and PostgreSQL; implemented JWT authentication with refresh token rotation and integrated Stripe API for checkout handling."
- ❌ *Weak*: "Made a machine learning project for sentiment analysis."
- ✅ *Strong*: "Trained a RoBERTa sentiment classification model on 50,000 product reviews achieving 91.4% F1-score; deployed model inference via FastAPI and Docker with sub-120ms response time."

## 3. Top 3 Traps to Eliminate Immediately

1. **Fluff Objectives**: Remove the two-line "Objective" statement (*"Seeking a challenging position in an esteemed organization..."*). Recruiters know you are applying for software engineering roles.
2. **Rating Bars**: Avoid graphics showing "Java: 4/5 stars". Rating yourself 5/5 implies you wrote the JVM specification; rating yourself 2/5 tells the recruiter not to hire you.
3. **Broken URLs**: Verify every hyperlink (GitHub repo, live deployment, LinkedIn) in an incognito window before exporting your final PDF.

Plan your career progression and build resume-grade projects with our platform:
- [Open the Career Roadmap Planner](/planner)
- [Review Comprehensive Topic Roadmaps](/roadmaps)
`
    },
    {
        slug: 'linkedin-github-campus-placements',
        frontMatter: {
            title: 'LinkedIn and GitHub Strategy for Campus Placements',
            slug: 'linkedin-github-campus-placements',
            summary: 'Actionable playbook for building a credible developer profile on GitHub and professional network on LinkedIn for engineering college students.',
            category: 'Career',
            tags: ['LinkedIn', 'GitHub', 'Open Source', 'Networking', 'Personal Brand'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/linkedin-github-campus-placements.svg',
            coverAlt: 'Developer profile on GitHub and LinkedIn visual representation',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'GitHub Octoverse: State of Open Source Software', url: 'https://octoverse.github.com', accessedDate: '2026-10-30' },
                { title: 'LinkedIn Economic Graph: Student Talent and Placement Trends', url: 'https://economicgraph.linkedin.com', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Technical Problem Solving Practice', url: '/practice', type: 'practice' },
                { title: 'AI Personalized Career Roadmap', url: '/roadmaps', type: 'roadmap' }
            ]
        },
        body: `# LinkedIn and GitHub Strategy for Campus Placements

In modern technology recruitment, your resume is only the entry ticket. When engineering managers, startup founders, and technical recruiters short-list candidates for off-campus opportunities or prime campus tracks, they almost always inspect your **GitHub repository activity and LinkedIn presence**.

Having an empty GitHub profile or a LinkedIn profile that reads like a high-school Facebook page signals a lack of professional commitment. Conversely, a polished profile that showcases genuine code, technical writing, and thoughtful engagement can unlock direct interview referrals.

> **Key takeaways:**
> - Pin your 3 best GitHub repositories with production-grade README files, clean commit histories, and live demo links.
> - On LinkedIn, optimize your headline to state your core tech stack and target role (e.g., *"Computer Science Student | Java & Spring Boot | Cloud Architecture"*), not just *"Aspiring SDE"*.
> - Reach out for referrals by showing finished work first: share a concise 3-sentence message linking your resume and relevant project.

## 1. Crafting a High-Signal GitHub Profile

Recruiters don't expect college students to maintain the Linux kernel, but they do want to see that you can write clean, version-controlled software:

### 1. Pin 3 Meaningful Repositories
Do not pin course homework folders named \`Assignment-1\` or generic tutorial clones. Pin projects that demonstrate fullstack or systems capability:
- A distributed system or backend service with automated tests.
- A fullstack application with an interactive live URL (deployed on Vercel, Railway, or AWS).
- A developer utility, CLI tool, or open-source contribution.

### 2. High-Standard READMEs
Every pinned repository must contain:
- A clear heading and a 2-sentence summary of what the software does.
- A screenshot or architecture flowchart.
- Step-by-step local installation instructions.
- A list of technologies used and key architectural decisions.

### 3. Professional Git Commit Hygiene
Avoid commits like \`update\`, \`fix bug\`, or \`changes\`. Use conventional commit prefixes:
\`feat: add redis caching layer to user session handler\` or \`fix: resolve race condition in token refresh\`.

## 2. LinkedIn Networking and Referral Strategy

When asking alumni or engineers for off-campus referrals, generic messages like *"Sir, please refer me for any job"* are almost always ignored. Use this structured approach instead:

### The 3-Sentence Referral Template:
> *"Hi [Name], I noticed your team at [Company] is hiring SDE-1 backend engineers. As a final-year CS student with strong experience in Java, Spring Boot, and PostgreSQL, I recently built [Project Name, with link], which handles [Key Feature]. If you find my background aligned, would you be open to reviewing my resume for a referral? Thank you for your time!"*

## 3. Next Steps

Solidify your technical foundations before reaching out:
- [Sharpen Your Algorithmic Problem Solving](/practice)
- [Review Comprehensive Track Roadmaps](/roadmaps)
`
    },
    {
        slug: 'offer-letters-ctc-vs-inhand',
        frontMatter: {
            title: 'Offer Letters 101: CTC Versus In-Hand Salary Breakdown',
            slug: 'offer-letters-ctc-vs-inhand',
            summary: 'Understand gross salary, basic pay, PF, gratuity, performance bonuses, ESOPs, and calculate your actual monthly in-hand compensation.',
            category: 'Career',
            tags: ['Offer Letter', 'Salary', 'CTC', 'In-Hand', 'Taxes', 'Career'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/offer-letters-ctc-vs-inhand.svg',
            coverAlt: 'Salary compensation breakdown CTC vs in-hand visual',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'Employees Provident Fund Organisation (EPFO) Statutory Contribution Guidelines', url: 'https://www.epfindia.gov.in', accessedDate: '2026-10-30' },
                { title: 'Income Tax Department of India: Tax Slabs and TDS Provisions', url: 'https://www.incometax.gov.in', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'Career & Offer Evaluation Roadmap', url: '/planner', type: 'planner' },
                { title: 'Mock Interview Feedback & Readiness', url: '/simulator', type: 'simulator' }
            ]
        },
        body: `# Offer Letters 101: CTC Versus In-Hand Salary Breakdown

One of the most confusing moments for graduating engineering students in India is opening their first campus placement offer letter. An offer stating a Cost to Company (CTC) of 12 Lakhs Per Annum (LPA) often results in a monthly credited bank transfer that is significantly lower than $\\text{12,00,000} / 12 = \\text{Rs } 1,00,000$.

Understanding the mathematical breakdown of an Indian offer letter protects you from unrealistic financial planning and allows you to compare competing offers accurately.

> **Key takeaways:**
> - CTC includes both direct salary and company-side statutory costs (such as employer EPF contribution, gratuity, and insurance premiums).
> - Fixed base pay is the only component guaranteed in every monthly paycheck; variable bonuses and retention bonuses depend on company targets and vesting schedules.
> - Note: This article provides general financial education based on standard Indian corporate conventions as of October 2026 and does not constitute formal tax advice.

## 1. Dissecting the CTC Components

A standard Indian software engineering offer letter divides CTC into three primary buckets:

### Component A: Fixed Gross Compensation
This is the baseline salary paid regularly across 12 monthly cycles:
- **Basic Salary**: Typically constitutes 40% to 50% of your fixed pay. Important because statutory deductions (EPF, Gratuity) are calculated as a percentage of Basic.
- **House Rent Allowance (HRA)**: Typically 40% (non-metro) or 50% (metro) of Basic Salary.
- **Special / Flexible Allowance**: A balancing component that covers the remainder of fixed gross pay.

### Component B: Statutory Employer Contributions (Included in CTC, Not In-Hand)
- **Employer EPF Contribution**: 12% of Basic Pay (or statutory cap) deposited directly into your retirement provident fund.
- **Employee EPF Contribution**: An additional 12% deducted from your gross pay and deposited into EPF.
- **Gratuity**: Statutory retirement benefit under the Payment of Gratuity Act, typically calculated as $\\approx 4.81\\%$ of Basic Pay, payable only after 5 years of continuous service.
- **Group Medical Insurance Premium**: Cost borne by the company to cover your hospitalization insurance.

### Component C: Variable & Long-Term Incentives
- **Performance Bonus**: Variable component (often 10% to 20% of CTC) paid annually based on personal appraisal and company profitability.
- **Joining / Retention Bonus**: Often paid in the first month but carries a clawback clause requiring repayment if you leave within 12 to 24 months.
- **Stock Options / RSUs**: Equity grants that vest over 4 years (typically 25% after a 1-year cliff).

## 2. Sample Calculation: A 10 LPA Campus Offer

Consider a representative 10 LPA offer for a fresher SDE-1:

| Component | Annual Value (INR) | Monthly Impact |
| :--- | :--- | :--- |
| **Basic Salary** | ₹4,00,000 | ₹33,333 |
| **HRA** | ₹2,00,000 | ₹16,666 |
| **Special Allowance** | ₹1,60,000 | ₹13,333 |
| **Total Fixed Gross** | **₹7,60,000** | **₹63,333** |
| *Less: Employee EPF (12%)* | -₹48,000 | -₹4,000 |
| *Less: Professional Tax* | -₹2,400 | -₹200 |
| *Less: Estimated Income Tax (TDS)* | -₹25,000 | -₹2,083 |
| **Net In-Hand Credited** | — | **≈ ₹57,050 / month** |
| *Employer EPF (in CTC)* | ₹48,000 | (Retirement Asset) |
| *Gratuity (in CTC)* | ₹19,200 | (Payable after 5 yrs) |
| *Insurance & Benefits* | ₹22,800 | (Hospitalization cover) |
| *Annual Performance Bonus* | ₹1,50,000 | (Variable annual payout) |
| **Total CTC** | **₹10,00,000** | — |

## 3. Practical Advice When Comparing Offers

When deciding between multiple campus offers:
1. Always calculate the **Monthly In-Hand Take-Home**, not just the headline CTC figure.
2. Check whether joining bonuses carry a 1-year or 2-year clawback requirement.
3. For startup offers offering ESOPs, evaluate equity as an upside bonus while ensuring the base cash salary meets your living expenses.

Plan your interview readiness and career targets:
- [Use the AI Career Roadmap Generator](/planner)
- [Practice Voice Mock Interviews](/simulator)
`
    },
    {
        slug: 'working-in-europe-fresher-guide',
        frontMatter: {
            title: 'Working in Europe as a Fresher: Visa and CV Conventions',
            slug: 'working-in-europe-fresher-guide',
            summary: 'An overview of international graduate opportunities, EU Blue Card frameworks, Europass CV standards, and key legal considerations for students.',
            category: 'Career',
            tags: ['Europe', 'EU Blue Card', 'International Jobs', 'Career', 'Visa Overview'],
            author: 'InterviewX Editorial Team',
            coverImage: '/assets/articles/covers/working-in-europe-fresher-guide.svg',
            coverAlt: 'International tech career and European visa overview',
            publishedAt: '2026-10-31',
            updatedAt: '2026-10-31',
            reviewedAt: '2026-10-31',
            status: 'published',
            sources: [
                { title: 'European Commission Official EU Blue Card Directive Portal', url: 'https://immigration-portal.ec.europa.eu/blue-card_en', accessedDate: '2026-10-30' },
                { title: 'Federal Government of Germany Portal for Qualified Professionals (Make it in Germany)', url: 'https://www.make-it-in-germany.com', accessedDate: '2026-10-30' }
            ],
            relatedModules: [
                { title: 'International Placement Strategy Roadmap', url: '/planner', type: 'planner' },
                { title: 'Core Computer Science Knowledge Bank', url: '/practice', type: 'practice' }
            ]
        },
        body: `# Working in Europe as a Fresher: Visa and CV Conventions

Many computer science and engineering undergraduates in India consider beginning their careers in European tech hubs such as Germany, the Netherlands, Ireland, or Sweden. Europe offers strong worker protection laws, predictable 35-to-40-hour work weeks, and progressive permanent residency pathways for skilled technologists.

However, landing a direct junior software engineering role from India requires understanding visa regulations, qualification recognition, and localized resume conventions.

> **Key takeaways:**
> - The EU Blue Card is the primary skilled immigration route for non-EU university graduates, requiring a recognized degree and a binding employment contract meeting statutory salary thresholds.
> - Direct fresher recruitment from abroad is competitive; successful candidates build strong open-source records or enter through international graduate programs and master's degrees.
> - Note: This article provides general educational information based on official European Commission and national immigration portals as of October 2026. Immigration rules change; always consult official government immigration portals for binding legal requirements.

## 1. The EU Blue Card Framework

The European Union Blue Card is an EU-wide residence and work permit designed for highly qualified non-EU nationals:

- **Degree Recognition**: Your Indian Bachelor of Technology (B.Tech) or Bachelor of Engineering (B.E.) must be recognized as equivalent to a European degree. In Germany, for example, your institution and degree must be listed with status \`H+\` on the official Anabin database.
- **Minimum Salary Threshold**: The Blue Card mandates that your contract meets or exceeds a specific national gross annual salary threshold, with lower thresholds designated for shortage occupations including software engineering and data science.
- **Mobility**: After holding a Blue Card for 12 to 18 months in one EU member state, holders can transition more easily to other participating EU countries.

## 2. European CV Standards: Key Differences from US/India

European hiring managers expect resumes formatted to specific conventions:
- **Europass and Clean Modern Layouts**: While traditional Europass formats exist, modern tech companies prefer clean, single-page or two-page PDF resumes with clear reverse-chronological experience.
- **Language Proficiency**: Clearly state your English proficiency (e.g., C1/Fluent) and any European language skills (e.g., German A1/B1). While international tech teams operate in English, local language proficiency significantly expands your marketability.
- **Clarity on Work Authorization**: Explicitly state your nationality and that you require standard visa sponsorship under the EU Blue Card program.

## 3. Practical Paths for Freshers

Direct off-campus hiring of fresh graduates from outside Europe carries relocation and visa sponsorship overhead for employers. The most successful pathways include:
1. **Targeting Global Capability Centers with Internal Transfer (L-1/Intra-Company)**: Join a multinational in India and transition to European offices after 18 to 24 months.
2. **Specialized Open Source Contributions**: Contributing significantly to European-headquartered open-source foundations and startups.
3. **Master of Science (M.Sc.) Programs**: Enrolling in graduate programs in Germany, Sweden, or the Netherlands, which typically offer 12-to-18-month post-study job seeker visas.

Plan your preparation and international engineering readiness:
- [Explore AI Career Roadmaps](/planner)
- [Practice Core Technical Interview Skills](/practice)
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

console.log(`Wrote Category 2 & 3: ${articles.length} articles to ${ARTICLES_DIR}`);
