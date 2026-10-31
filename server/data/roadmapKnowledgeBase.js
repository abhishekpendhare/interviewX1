/**
 * InterviewX Career Roadmap Knowledge Base
 * 
 * Target profiles, region extra tracks, skill weight distributions, and
 * the canonical shared module library.
 * Built from public & official career guidelines, visa requirements, and hiring rubrics.
 */

const TARGET_PROFILES = {
  // ─── 1. Target Company Types ─────────────────────────────────────────
  types: {
    big_tech: {
      id: 'big_tech',
      name: 'FAANG / Big Tech',
      description: 'Tier-1 tech giants with standardized multi-round algorithmic and bar-raiser bars.',
      stages: [
        { id: 'oa', name: 'Online Assessment (OA)', format: 'Automated 70-90m DSA & Speed Drill' },
        { id: 'tech_1', name: 'Technical Round 1', format: '45m Data Structures & Invariant Proofs' },
        { id: 'tech_2', name: 'Technical Round 2', format: '45m Complex Non-Linear DSA & Optimization' },
        { id: 'system_design', name: 'System Architecture Round', format: 'High-scale Distributed Systems Design' },
        { id: 'bar_raiser', name: 'Bar Raiser / STAR Round', format: 'Amazon/Google style Leadership & Decision Rubric' }
      ],
      skillWeights: {
        dsa: 0.38,
        system_design: 0.25,
        cs_fundamentals: 0.15,
        communication: 0.14,
        projects_shipping: 0.08,
        aptitude: 0.00
      },
      sources: [
        { name: 'Google Tech Student Careers', url: 'https://careers.google.com/how-we-hire', date: '2026-03-01', confidence: 'high' },
        { name: 'Microsoft Technical Interview Process', url: 'https://careers.microsoft.com', date: '2026-02-15', confidence: 'high' },
        { name: 'Amazon Engineering Hiring Bar', url: 'https://www.amazon.jobs', date: '2026-02-20', confidence: 'high' }
      ]
    },
    startup: {
      id: 'startup',
      name: 'High-Growth Startup / Seed-Series B',
      description: 'Fast-paced, autonomy-driven environments prioritizing end-to-end shipping velocity and full-stack execution.',
      stages: [
        { id: 'intro_screen', name: 'Founder / Tech Lead Screen', format: '30m Experience & Stack Alignment' },
        { id: 'take_home', name: 'Practical Take-Home / Live Pairing', format: 'Production MVP or Feature Build (24-48h or 90m pairing)' },
        { id: 'arch_deep_dive', name: 'System & Code Walkthrough', format: 'Defending trade-offs, DB schema, and edge cases' },
        { id: 'culture_founder', name: 'Founder Autonomy & Culture Fit', format: 'Ownership mindset, ambiguity tolerance, equity trade-offs' }
      ],
      skillWeights: {
        projects_shipping: 0.38,
        system_design: 0.22,
        communication: 0.16,
        dsa: 0.12,
        cs_fundamentals: 0.12,
        aptitude: 0.00
      },
      extraTracks: ['startup_equity_compensation', 'github_presence_portfolio', 'side_projects_mvp', 'cold_outreach_founders'],
      sources: [
        { name: 'Y Combinator Hiring Guide', url: 'https://www.ycombinator.com/library', date: '2026-01-20', confidence: 'high' },
        { name: 'AngelList / Wellfound Talent Report', url: 'https://wellfound.com', date: '2026-02-10', confidence: 'medium' }
      ]
    },
    it_services: {
      id: 'it_services',
      name: 'IT Services & Consulting (TCS / Infosys / Wipro)',
      description: 'Mass and specialist recruitment emphasizing quantitative aptitude, logical reasoning, and core CS fundamentals.',
      stages: [
        { id: 'aptitude_oa', name: 'National Qualifier Test (NQT) / OA', format: 'Quantitative, Logical, Verbal & Basic Coding (120m)' },
        { id: 'tech_interview', name: 'Technical Viva & Core CS Round', format: 'OOP, DBMS, SQL Queries, OS Virtual Memory, Java/C++ basics' },
        { id: 'managerial_hr', name: 'Managerial & HR Communication Round', format: 'Client communication fluency, willingness to relocate, culture' }
      ],
      skillWeights: {
        aptitude: 0.38,
        communication: 0.24,
        cs_fundamentals: 0.22,
        dsa: 0.12,
        projects_shipping: 0.04,
        system_design: 0.00
      },
      extraTracks: ['aptitude_drills_nqt', 'business_communication_fluency', 'company_specific_patterns'],
      sources: [
        { name: 'TCS NextStep Campus Portal', url: 'https://nextstep.tcs.com', date: '2026-01-10', confidence: 'high' },
        { name: 'Infosys InfyTQ & Specialist Guide', url: 'https://www.infosys.com/careers', date: '2026-01-20', confidence: 'high' }
      ]
    },
    product: {
      id: 'product',
      name: 'Mid-sized Product Company',
      description: 'Established tech companies balancing algorithmic depth with clean code architecture and real-world system design.',
      stages: [
        { id: 'oa', name: 'Coding Assessment', format: '90m 3 LeetCode Medium Problems' },
        { id: 'tech_dsa', name: 'Data Structures & Algorithms', format: '60m Coding with Live Code Execution' },
        { id: 'tech_lld', name: 'Low-Level Design / Machine Coding', format: '90m OOP Design (e.g. Parking Lot, Splitwise)' },
        { id: 'hiring_mgr', name: 'Hiring Manager & Engineering Values', format: 'Culture, team fit, and past project impact' }
      ],
      skillWeights: {
        dsa: 0.28,
        system_design: 0.24,
        cs_fundamentals: 0.20,
        projects_shipping: 0.18,
        communication: 0.10,
        aptitude: 0.00
      },
      sources: [
        { name: 'Atlassian Engineering Hiring Rubric', url: 'https://www.atlassian.com/company/careers', date: '2026-02-05', confidence: 'high' }
      ]
    },
    gcc: {
      id: 'gcc',
      name: 'Global Capability Center (GCC)',
      description: 'Offshore innovation hubs of Fortune 500 banks, retail, and healthcare with heavy emphasis on DB internals and compliance.',
      stages: [
        { id: 'oa', name: 'Aptitude & Technical OA', format: 'MCQs on SQL/OS + 2 Coding Problems' },
        { id: 'tech_core', name: 'Data & Systems Round', format: 'Database Indexing, Transactions, Core Language Invariants' },
        { id: 'director_round', name: 'Director & Behavioral Fit', format: 'Long-term commitment, compliance, and domain curiosity' }
      ],
      skillWeights: {
        cs_fundamentals: 0.32,
        dsa: 0.26,
        system_design: 0.18,
        communication: 0.14,
        projects_shipping: 0.10,
        aptitude: 0.00
      },
      sources: [
        { name: 'NASSCOM GCC Horizon Report', url: 'https://nasscom.in', date: '2026-01-28', confidence: 'medium' }
      ]
    },
    higher_studies: {
      id: 'higher_studies',
      name: 'Higher Studies / R&D Track (MS/PhD)',
      description: 'Academic and research-oriented track focusing on foundational computer science theory, mathematics, and publications.',
      stages: [
        { id: 'gre_gate', name: 'GRE / GATE Standardized Exam', format: 'Advanced Quantitative, Discrete Math & Theory' },
        { id: 'research_sop', name: 'SOP & Research Portfolio Review', format: 'Evaluating publications, thesis, and professor alignment' },
        { id: 'prof_interview', name: 'Faculty Interview', format: 'Technical interrogation on research interests and papers' }
      ],
      skillWeights: {
        cs_fundamentals: 0.42,
        projects_shipping: 0.28,
        communication: 0.18,
        dsa: 0.12,
        system_design: 0.00,
        aptitude: 0.00
      },
      sources: [
        { name: 'ACM/IEEE Computer Science Curriculum Guidelines', url: 'https://www.acm.org', date: '2026-01-15', confidence: 'high' }
      ]
    }
  },

  // ─── 2. Specific Company Overrides ───────────────────────────────────
  companies: {
    microsoft: {
      id: 'microsoft',
      name: 'Microsoft',
      type: 'big_tech',
      emphasis: 'Emphasizes clean code, invariant proofs, OOP design patterns, and STAR behavioural calibration.',
      weightMod: { dsa: +0.05, system_design: +0.05, projects_shipping: -0.05 },
      checkpoints: [
        'Microsoft Codility/HackerRank OA Milestone',
        'Tree/Graph Non-linear Coding Simulation',
        'Low-Level Class & OOP Invariant Design Mock',
        'As-Appropriate (AA) Director Behavioral Simulation'
      ],
      sources: [
        { name: 'Microsoft Careers - Student Opportunities', url: 'https://careers.microsoft.com/students', date: '2026-02-15', confidence: 'high' }
      ]
    },
    google: {
      id: 'google',
      name: 'Google',
      type: 'big_tech',
      emphasis: 'Deep algorithmic problem solving, clean complexity proofs, graph traversals, and Googleyness calibration.',
      weightMod: { dsa: +0.10, cs_fundamentals: +0.05, projects_shipping: -0.10 },
      checkpoints: [
        'Google Online Assessment Benchmark',
        'Complex Graph & DP Optimization Mock',
        'Algorithmic Telemetry & Entropy Review',
        'Googleyness & Leadership Peer Round'
      ],
      sources: [
        { name: 'Google Engineering Hiring Journey', url: 'https://careers.google.com/how-we-hire', date: '2026-03-01', confidence: 'high' }
      ]
    },
    amazon: {
      id: 'amazon',
      name: 'Amazon',
      type: 'big_tech',
      emphasis: 'Strict adherence to Amazon 16 Leadership Principles, STAR metrics, and high-throughput service design.',
      weightMod: { communication: +0.08, system_design: +0.04, cs_fundamentals: -0.05 },
      checkpoints: [
        'Amazon OA1 Debugging & OA2 Coding Sprint',
        'Amazon Work Style Assessment (SJT) Simulation',
        'Distributed Caching & High-Scale Design Mock',
        'Bar Raiser 16 Leadership Principles STAR Simulation'
      ],
      sources: [
        { name: 'Amazon Leadership Principles & Interview Guide', url: 'https://www.amazon.jobs', date: '2026-02-20', confidence: 'high' }
      ]
    },
    tcs: {
      id: 'tcs',
      name: 'Tata Consultancy Services (TCS Prime / Digital)',
      type: 'it_services',
      emphasis: 'TCS NQT Advanced Quantitative section, logical puzzles, command of C/Java fundamentals, and articulate English communication.',
      weightMod: { aptitude: +0.05, communication: +0.05 },
      checkpoints: [
        'TCS NQT Full-Length Timed Diagnostic',
        'C/Java Syntax & Pointer Arithmetic Speed Test',
        'Core DBMS & SQL Join Optimization Viva',
        'TCS Prime Managerial HR Communication Drill'
      ],
      sources: [
        { name: 'TCS NextStep Recruitment Process', url: 'https://nextstep.tcs.com', date: '2026-01-10', confidence: 'high' }
      ]
    },
    infosys: {
      id: 'infosys',
      name: 'Infosys (Specialist Programmer / DSE)',
      type: 'it_services',
      emphasis: 'InfyTQ coding round, greedy algorithms, Dynamic Programming, and relational schema normalization.',
      weightMod: { dsa: +0.08, aptitude: -0.05 },
      checkpoints: [
        'Infosys HackWithInfy / InfyTQ Round 1 Diagnostic',
        'Medium DP & Greedy Coding Simulation',
        'Relational Schema BCNF & SQL Explain Query Mock',
        'DSE Technical & HR Competency Review'
      ],
      sources: [
        { name: 'Infosys Careers Specialist Track', url: 'https://www.infosys.com/careers', date: '2026-01-20', confidence: 'high' }
      ]
    }
  },

  // ─── 3. Region Extra Tracks & Local Context ──────────────────────────
  regions: {
    europe: {
      id: 'europe',
      name: 'Europe (UK, Germany, Netherlands, Ireland, Switzerland)',
      extraTracks: [
        {
          id: 'extra_eu_visa_legal',
          title: 'EU Blue Card & UK Skilled Worker Visa Navigation',
          hours: 12,
          skillArea: 'extra_tracks',
          description: 'Minimum salary thresholds for EU Blue Card, fast-track tech visas, sponsorship registry verification.',
          sources: [{ name: 'EU Immigration Portal - Blue Card', url: 'https://immigration-portal.ec.europa.eu', date: '2026-01-15', confidence: 'high' }]
        },
        {
          id: 'extra_eu_cv_standards',
          title: 'European CV & GDPR-Compliant Candidate Dossier',
          hours: 10,
          skillArea: 'extra_tracks',
          description: 'Single-page concise Europass/tech standard format, removing photos/age for UK/NL, ATS optimization for European recruiters.',
          sources: [{ name: 'Make It In Germany Official Portal', url: 'https://www.make-it-in-germany.com', date: '2026-01-15', confidence: 'high' }]
        },
        {
          id: 'extra_eu_tech_relocation',
          title: 'Berlin, Amsterdam & London Tech Ecosystem Dynamics',
          hours: 8,
          skillArea: 'extra_tracks',
          description: 'Salary benchmarking, cost of living adjustment, relocation package negotiation and cross-cultural communication.',
          sources: [{ name: 'Techleap Netherlands & Silicon Allee Berlin', url: 'https://techleap.nl', date: '2026-02-01', confidence: 'medium' }]
        }
      ]
    },
    india: {
      id: 'india',
      name: 'India (Bangalore, Hyderabad, NCR, Pune, Chennai)',
      extraTracks: [
        {
          id: 'extra_in_campus_tier1',
          title: 'Tier-1/Tier-2 Campus Placement Season Strategy',
          hours: 10,
          skillArea: 'extra_tracks',
          description: 'Placement cell day-1 slotting, online test screening cutoffs, and rapid multi-company OA clearing strategies.',
          sources: [{ name: 'NASSCOM Placement Insights', url: 'https://nasscom.in', date: '2026-02-01', confidence: 'high' }]
        },
        {
          id: 'extra_in_off_campus_referrals',
          title: 'Off-Campus Cold Outreach & Staff Engineer Referrals',
          hours: 8,
          skillArea: 'extra_tracks',
          description: 'Targeted LinkedIn outreach to engineering managers, alumni referral loops, and hiring sprint applications.',
          sources: [{ name: 'Industry Verified SDE Referral Standards', url: 'https://interviewx.dev', date: '2026-01-20', confidence: 'high' }]
        }
      ]
    },
    us: {
      id: 'us',
      name: 'United States (Silicon Valley, Seattle, NYC, Remote US)',
      extraTracks: [
        {
          id: 'extra_us_visa_opt_h1b',
          title: 'F-1 OPT/STEM Extension & H-1B Cap Season Mechanics',
          hours: 12,
          skillArea: 'extra_tracks',
          description: 'Understanding STEM OPT eligibility, Day-1 CPT constraints, and H-1B electronic registration windows.',
          sources: [{ name: 'USCIS Working in the United States', url: 'https://www.uscis.gov', date: '2026-01-10', confidence: 'high' }]
        },
        {
          id: 'extra_us_compensation_rsu',
          title: 'Silicon Valley Total Comp (Base, RSU Equity, Signing Bonus)',
          hours: 8,
          skillArea: 'extra_tracks',
          description: 'Levels.fyi tier matching, 4-year vesting schedules with 1-year cliff, and competing offer leverage.',
          sources: [{ name: 'Levels.fyi Benchmark Aggregation', url: 'https://levels.fyi', date: '2026-02-15', confidence: 'high' }]
        }
      ]
    },
    remote: {
      id: 'remote',
      name: 'Global Remote-First Organizations',
      extraTracks: [
        {
          id: 'extra_remote_async_excellence',
          title: 'Asynchronous Written Communication & RFC Documentation',
          hours: 12,
          skillArea: 'extra_tracks',
          description: 'Mastering Git pull request documentation, async Loom demos, and self-directed sprint management.',
          sources: [{ name: 'GitLab Remote Playbook', url: 'https://about.gitlab.com/company/culture/all-remote', date: '2026-02-15', confidence: 'high' }]
        }
      ]
    }
  },

  // ─── 4. Role Specializations ─────────────────────────────────────────
  roles: {
    backend: {
      id: 'backend',
      name: 'Backend Software Engineer',
      weightMod: { system_design: +0.08, cs_fundamentals: +0.06, projects_shipping: +0.04 },
      recommendedStack: 'Java / Spring Boot or Go or Node.js / PostgreSQL'
    },
    frontend: {
      id: 'frontend',
      name: 'Frontend Software Engineer',
      weightMod: { projects_shipping: +0.14, system_design: +0.04, cs_fundamentals: -0.06 },
      recommendedStack: 'TypeScript, React 19, Next.js, Tailwind CSS, Browser Performance'
    },
    fullstack: {
      id: 'fullstack',
      name: 'Full-Stack Software Engineer',
      weightMod: { projects_shipping: +0.10, system_design: +0.06, dsa: -0.04 },
      recommendedStack: 'TypeScript, React, Node.js/Express, PostgreSQL, Docker'
    },
    data_ml: {
      id: 'data_ml',
      name: 'Data / Machine Learning Engineer',
      weightMod: { cs_fundamentals: +0.10, projects_shipping: +0.08, system_design: -0.06 },
      recommendedStack: 'Python, PyTorch, SQL, Apache Spark, Vector Embeddings'
    },
    devops: {
      id: 'devops',
      name: 'DevOps / Site Reliability Engineer (SRE)',
      weightMod: { cs_fundamentals: +0.16, system_design: +0.08, dsa: -0.12 },
      recommendedStack: 'Linux, Go/Bash, Kubernetes, Terraform, Prometheus/Grafana'
    },
    qa: {
      id: 'qa',
      name: 'Quality Assurance / SDET',
      weightMod: { communication: +0.08, cs_fundamentals: +0.06, system_design: -0.08 },
      recommendedStack: 'Java/Python, Playwright/Selenium, Postman API Testing, CI/CD'
    }
  }
};

// ─── 5. Canonical Shared Module Library ─────────────────────────────────
const MODULE_LIBRARY = [
  // ── DSA Modules ──
  {
    id: 'dsa_linear_foundations',
    title: 'Linear Data Structures & Two-Pointer Invariants',
    topic: 'Arrays, Strings & Pointers',
    skillArea: 'dsa',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    outcomes: [
      'Master two-pointer sliding window invariants',
      'Solve array partitioning and prefix-sum queries',
      'Eliminate O(N^2) brute force with O(N) space-time trade-offs'
    ],
    links: [
      { title: 'Practice: Two Sum', url: '/compiler/two-sum' },
      { title: 'Article: Two-Pointer Invariants', url: '/articles/mastering-two-pointer-invariants' }
    ],
    tags: ['array', 'two-pointer', 'prefix-sum', 'sliding-window']
  },
  {
    id: 'dsa_hash_monotonic',
    title: 'Hash Maps & Monotonic Queue Optimization',
    topic: 'Hashing, Stacks & Queues',
    skillArea: 'dsa',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: ['dsa_linear_foundations'],
    outcomes: [
      'Implement real-time sliding window minimum/maximum with monotonic deques',
      'Design O(1) average lookup and hash collision resolution',
      'Solve Next Greater Element in single-pass linear scans'
    ],
    links: [
      { title: 'Practice: Longest Substring', url: '/compiler/longest-substring-without-repeating-characters' },
      { title: 'Article: Monotonic Deques vs Heaps', url: '/articles/monotonic-deques-sliding-window' }
    ],
    tags: ['hash-map', 'monotonic-deque', 'stack', 'queue']
  },
  {
    id: 'dsa_trees_graphs',
    title: 'Binary Trees, BSTs & Graph Traversals (BFS/DFS)',
    topic: 'Trees & Graphs',
    skillArea: 'dsa',
    difficulty: 'intermediate',
    estimatedHours: 35,
    prerequisites: ['dsa_hash_monotonic'],
    outcomes: [
      'Traverse arbitrary trees recursively and iteratively (pre/in/post/level-order)',
      'Construct Topological Sorts on Directed Acyclic Graphs (DAGs)',
      'Detect cycles via Disjoint Set Union (DSU) and 3-color DFS'
    ],
    links: [
      { title: 'Compiler Arena: Trees & Graphs', url: '/compiler' },
      { title: 'Foundations Hub: Tree Traversal Invariants', url: '/foundations' }
    ],
    tags: ['trees', 'graphs', 'bfs', 'dfs', 'topological-sort', 'dsu']
  },
  {
    id: 'dsa_advanced_dp',
    title: 'Dynamic Programming & State Compression',
    topic: 'DP & Optimization',
    skillArea: 'dsa',
    difficulty: 'advanced',
    estimatedHours: 40,
    prerequisites: ['dsa_trees_graphs'],
    outcomes: [
      'Formulate optimal substructure and overlapping subproblems',
      'Compress 2D DP matrices into 1D rolling buffers',
      'Solve classic Knapsack, LCS, Matrix Chain, and Bitmask DP challenges'
    ],
    links: [
      { title: 'Practice: Trapping Rain Water', url: '/compiler/trapping-rain-water' },
      { title: 'Foundations Hub: DP Optimization', url: '/foundations' }
    ],
    tags: ['dp', 'memoization', 'knapsack', 'state-compression']
  },

  // ── CS Fundamentals Modules ──
  {
    id: 'cs_oop_architecture',
    title: 'Object-Oriented Programming & SOLID Design Principles',
    topic: 'OOP & Software Design',
    skillArea: 'cs_fundamentals',
    difficulty: 'beginner',
    estimatedHours: 15,
    prerequisites: [],
    outcomes: [
      'Implement Polymorphism, Abstraction, and Encapsulation with memory safety',
      'Apply SOLID design principles in production class hierarchies',
      'Eliminate tight coupling using Dependency Injection and Factories'
    ],
    links: [
      { title: 'Foundations Hub: OOP Design Review', url: '/foundations' }
    ],
    tags: ['oop', 'solid', 'design-patterns', 'java', 'cpp']
  },
  {
    id: 'cs_dbms_internals',
    title: 'Database Internals: Indexing, ACID & SQL Optimization',
    topic: 'DBMS & Storage',
    skillArea: 'cs_fundamentals',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: ['cs_oop_architecture'],
    outcomes: [
      'Compare B+Tree and LSM storage engine trade-offs for OLTP vs write-heavy workloads',
      'Optimize complex queries using EXPLAIN plans and composite indexes',
      'Master transaction isolation levels (Read Committed, Repeatable Read, Serializable)'
    ],
    links: [
      { title: 'Article: PostgreSQL B-Tree vs LSM Trees', url: '/articles/postgresql-btree-vs-lsm-trees' },
      { title: 'Foundations Hub: Relational Normalization & SQL', url: '/foundations' }
    ],
    tags: ['dbms', 'sql', 'btree', 'acid', 'transactions', 'indexing']
  },
  {
    id: 'cs_os_networking',
    title: 'Operating Systems Virtual Memory & TCP/IP Network Stack',
    topic: 'OS & Computer Networks',
    skillArea: 'cs_fundamentals',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: [],
    outcomes: [
      'Explain virtual memory paging, TLB caches, page faults, and context switching',
      'Trace TCP 3-way handshake, sliding window flow control, and congestion collapse',
      'Analyze threads, mutexes, race conditions, and deadlocks with lock ordering'
    ],
    links: [
      { title: 'Foundations Hub: OS Paging & Kernel Mechanics', url: '/foundations' }
    ],
    tags: ['os', 'networking', 'tcp', 'virtual-memory', 'concurrency']
  },

  // ── System Design Modules ──
  {
    id: 'sys_hld_distributed',
    title: 'High-Level Distributed System Design & Scalability',
    topic: 'System Architecture',
    skillArea: 'system_design',
    difficulty: 'advanced',
    estimatedHours: 35,
    prerequisites: ['cs_dbms_internals', 'cs_os_networking'],
    outcomes: [
      'Design high-throughput distributed rate limiters, URL shorteners, and notifications',
      'Apply Redis caching strategies (Cache-Aside, Write-Through, LRU eviction)',
      'Calculate CAP theorem trade-offs, consistent hashing, and horizontal sharding'
    ],
    links: [
      { title: 'Practice: LRU Cache Design', url: '/compiler/lru-cache' },
      { title: 'Article: Concurrency Benchmarks & Streams', url: '/articles/virtual-threads-vs-reactive-concurrency' }
    ],
    tags: ['system-design', 'distributed-systems', 'caching', 'redis', 'sharding']
  },
  {
    id: 'sys_lld_machine_coding',
    title: 'Low-Level Design & Machine Coding Arena',
    topic: 'Object-Oriented Design',
    skillArea: 'system_design',
    difficulty: 'intermediate',
    estimatedHours: 25,
    prerequisites: ['cs_oop_architecture'],
    outcomes: [
      'Design clean modular schemas for Parking Lot, Snake & Ladder, and Splitwise',
      'Implement Strategy, Observer, Decorator, and Singleton patterns',
      'Deliver working, fully-tested code within a 90-minute live machine coding round'
    ],
    links: [
      { title: 'Compiler Arena: System Design Patterns', url: '/compiler' }
    ],
    tags: ['lld', 'machine-coding', 'oop-design', 'design-patterns']
  },

  // ── Projects & Shipping Modules ──
  {
    id: 'proj_fullstack_mvp',
    title: 'End-to-End Production Fullstack MVP & Microservice',
    topic: 'Full-Stack Execution',
    skillArea: 'projects_shipping',
    difficulty: 'intermediate',
    estimatedHours: 40,
    prerequisites: ['cs_oop_architecture'],
    outcomes: [
      'Architect a fullstack product with TypeScript, React, Node.js/Go, and PostgreSQL',
      'Implement JWT/Session authentication, rate limiting, and RBAC authorization',
      'Deploy live on AWS/Vercel with automated GitHub Actions CI/CD pipelines'
    ],
    links: [
      { title: 'Articles: Fullstack SDE Sprint Guide', url: '/articles/60-day-placement-sprint-roadmap' }
    ],
    tags: ['fullstack', 'react', 'nodejs', 'postgres', 'auth', 'ci-cd']
  },
  {
    id: 'proj_github_portfolio',
    title: 'Open Source, GitHub Engineering Presence & Portfolio',
    topic: 'Developer Presence',
    skillArea: 'projects_shipping',
    difficulty: 'beginner',
    estimatedHours: 15,
    prerequisites: [],
    outcomes: [
      'Curate a recruiter-converting GitHub profile with live demo links and documentation',
      'Author architectural READMEs with ER diagrams and benchmark charts',
      'Submit meaningful pull requests to active open-source repositories'
    ],
    links: [
      { title: 'Articles: Placement Sprint Portfolio', url: '/articles/60-day-placement-sprint-roadmap' }
    ],
    tags: ['github', 'portfolio', 'open-source', 'readme']
  },

  // ── Aptitude Modules ──
  {
    id: 'apt_quant_arithmetic',
    title: 'Speed Quantitative Aptitude & Arithmetic Precision',
    topic: 'Quantitative Aptitude',
    skillArea: 'aptitude',
    difficulty: 'beginner',
    estimatedHours: 25,
    prerequisites: [],
    outcomes: [
      'Solve Percentages, Profit/Loss, and Price-Expenditure invariance in under 45 seconds',
      'Master Time, Speed, Distance, Relative Velocity, and Work-Pipes calculations',
      'Apply shortcut modular arithmetic and divisibility rules without calculators'
    ],
    links: [
      { title: 'Article: Speed Aptitude Strategy', url: '/articles/tier2-speed-aptitude-strategy' }
    ],
    tags: ['aptitude', 'quant', 'percentages', 'speed-math', 'tcs-nqt']
  },
  {
    id: 'apt_logical_reasoning',
    title: 'Analytical & Logical Reasoning for Campus Assessments',
    topic: 'Logical Reasoning',
    skillArea: 'aptitude',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: ['apt_quant_arithmetic'],
    outcomes: [
      'Solve seating arrangements, blood relations, and syllogisms with 100% precision',
      'Decode alphanumeric patterns, series completion, and coding-decoding puzzles',
      'Crack data sufficiency and graph interpretation under assessment countdowns'
    ],
    links: [
      { title: 'Article: TCS Prime & Infosys Strategy', url: '/articles/tier2-speed-aptitude-strategy' }
    ],
    tags: ['logical-reasoning', 'puzzles', 'syllogisms', 'data-sufficiency']
  },

  // ── Communication & Behavioral Modules ──
  {
    id: 'comm_star_behavioral',
    title: 'STAR Behavioral Storytelling & Executive Presence',
    topic: 'Behavioral & Leadership',
    skillArea: 'communication',
    difficulty: 'intermediate',
    estimatedHours: 20,
    prerequisites: [],
    outcomes: [
      'Formulate 5 metric-backed STAR stories (Situation, Task, Action, Result)',
      'Defend technical conflicts, architectural failures, and ownership decisions',
      'Calibrate vocal pacing, clarity, and concise executive summaries in interviews'
    ],
    links: [
      { title: 'Voice Simulator: Behavioral Cockpit', url: '/simulator' },
      { title: 'Article: Deconstructing the Amazon Bar Raiser', url: '/articles/amazon-bar-raiser-star-framework' }
    ],
    tags: ['star', 'behavioral', 'leadership', 'voice-mock', 'amazon-rubric']
  },
  {
    id: 'comm_technical_communication',
    title: 'Live Whiteboard Thinking & Algorithmic Articulation',
    topic: 'Technical Communication',
    skillArea: 'communication',
    difficulty: 'intermediate',
    estimatedHours: 15,
    prerequisites: ['dsa_linear_foundations'],
    outcomes: [
      'Think out loud while coding to demonstrate algorithmic reasoning to interviewers',
      'Clarify constraints and edge cases before writing the first line of code',
      'Gracefully receive interviewer hints and pivot implementation strategies'
    ],
    links: [
      { title: 'Voice Simulator: Autonomous Interviewer', url: '/simulator' },
      { title: 'Article: Google Coding Round Evaluation', url: '/articles/google-coding-round-algorithmic-entropy' }
    ],
    tags: ['whiteboard', 'think-aloud', 'technical-interview', 'hints']
  },

  // ── Extra Tracks: Region & Target Specific ──
  {
    id: 'extra_eu_visa_cv',
    title: 'European Tech Career Track: Visas, Europass CV & Relocation',
    topic: 'Europe Mobility',
    skillArea: 'extra_tracks',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    outcomes: [
      'Comply with EU Blue Card / UK Skilled Worker eligibility criteria',
      'Draft an anonymous, GDPR-compliant European tech CV highlighting concrete business impact',
      'Evaluate relocation packages, tax brackets, and local cost of living in Berlin/Amsterdam'
    ],
    links: [
      { title: 'Dossier: Candidate Readiness Telemetry', url: '/dossier' }
    ],
    tags: ['europe', 'visa', 'blue-card', 'relocation', 'cv-standard']
  },
  {
    id: 'extra_startup_shipping_equity',
    title: 'Startup Engineering Track: Autonomy, Cold Outreach & Equity',
    topic: 'Startup Navigation',
    skillArea: 'extra_tracks',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    outcomes: [
      'Execute high-converting cold email outreach directly to technical founders',
      'Decipher startup stock options (ESOPs), strike price, vesting schedules, and dilution',
      'Demonstrate 0-to-1 rapid prototyping skills without over-engineering'
    ],
    links: [
      { title: 'Article: 60-Day Placement Sprint', url: '/articles/60-day-placement-sprint-roadmap' }
    ],
    tags: ['startup', 'equity', 'cold-email', 'founder', 'esop']
  },
  {
    id: 'extra_it_services_accelerator',
    title: 'IT Services High-Speed Aptitude & Business English Accelerator',
    topic: 'Consulting & IT Services',
    skillArea: 'extra_tracks',
    difficulty: 'beginner',
    estimatedHours: 20,
    prerequisites: [],
    outcomes: [
      'Clear TCS NQT and Infosys InfyTQ speed thresholds under timed conditions',
      'Master professional email etiquette and articulate verbal fluency for client rounds',
      'Synthesize corporate IT services delivery models and agile consulting structures'
    ],
    links: [
      { title: 'Article: TCS Prime & Infosys Specialist Strategy', url: '/articles/tier2-speed-aptitude-strategy' }
    ],
    tags: ['it-services', 'tcs', 'infosys', 'nqt', 'business-english']
  }
];

module.exports = {
  TARGET_PROFILES,
  MODULE_LIBRARY
};
