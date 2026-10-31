const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const BUNDLED_DB_FILE = path.join(__dirname, 'store.json');
const IS_SERVERLESS = !!process.env.VERCEL || !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const TMP_DB = '/tmp/store.json';
// In serverless environments (Vercel, Netlify, Lambda), bundle is read-only.
// Bootstrap /tmp/store.json from bundled store so state persists across warm invocations.
const DB_FILE = IS_SERVERLESS ? TMP_DB : BUNDLED_DB_FILE;
const { APTITUDE_QUESTIONS, APTITUDE_TESTS, APTITUDE_TOPICS_METADATA } = require('./aptitudeData');

// Initialize database data
let store = {
    students: [],
    sessions: [],
    resetTokens: [],
    questions: [],

    codingProblems: [],
    codeSubmissions: [],
    tests: [],
    testAttempts: [],
    studyPlans: [],
    interviews: [],
    conversations: [],
    roadmaps: [],
    analytics: []
};

// Seed questions with high-rigor CS core, quantitative reasoning, and behavioral leadership
const SEED_QUESTIONS = [
    // --- 1. DATA STRUCTURES & ALGORITHMIC COMPLEXITY ---
    {
        id: "q-dsa-01",
        subject: "Algorithms & Data Structures",
        topic: "Sliding Window & Two Pointers",
        subtopic: "Contiguous Array Optimization",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Sliding Window Maximum & Monotonic Deque",
        description: "Given an array `nums` and sliding window size `k`, what is the optimal data structure to compute the sliding window maximum in strictly O(n) total time?",
        options: [
            "Max-Heap (Priority Queue) with lazy deletion in O(n log k)",
            "Monotonically decreasing Deque storing indices in amortized O(1) per element",
            "Balanced Binary Search Tree (AVL/Red-Black) with O(n log k)",
            "Segment Tree with range maximum queries in O(n log n)"
        ],
        correctAnswerIndex: 1,
        explanation: "A monotonic deque maintains indices in decreasing order of values. Each array index is pushed and popped at most once across the entire traversal, guaranteeing strictly O(n) runtime and O(k) space.",
        hints: ["Think about why you don't need elements smaller than the newest incoming element in the current window."],
        conceptTags: ["dsa", "sliding-window", "monotonic-queue", "time-complexity"]
    },
    {
        id: "q-dsa-02",
        subject: "Algorithms & Data Structures",
        topic: "Dynamic Programming",
        subtopic: "Space Optimization & State Compression",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "0/1 Knapsack 1D Array Space Compression Direction",
        description: "When compressing the 0/1 Knapsack 2D DP table (items x capacity) into a single 1D array of size `W + 1`, why MUST the capacity loop iterate in reverse from W down to weight[i]?",
        options: [
            "To prevent cache misses during forward L1-cache reads",
            "To ensure dp[w - weight[i]] reflects the state from the previous item without being overwritten by the current item in the same step",
            "Because dynamic programming always requires right-to-left evaluation for optimal substructure",
            "To support unbounded items with infinite quantities"
        ],
        correctAnswerIndex: 1,
        explanation: "In 0/1 Knapsack, each item can only be selected once. Iterating backwards ensures dp[w - weight[i]] still holds the value computed for the previous item (i-1). Iterating forwards would solve the Unbounded Knapsack problem by allowing the same item to be reused.",
        hints: ["If you iterate forwards from 0 to W, what value does dp[w - weight[i]] contain by the time you reach capacity w?"],
        conceptTags: ["dsa", "dynamic-programming", "knapsack", "space-optimization"]
    },
    {
        id: "q-dsa-03",
        subject: "Algorithms & Data Structures",
        topic: "Graph Algorithms",
        subtopic: "Shortest Path & Negative Cycles",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Dijkstra vs Bellman-Ford Negative Weight Invariant",
        description: "Why does Dijkstra's algorithm fail to guarantee correctness when negative edge weights are present in a directed graph?",
        options: [
            "It enters an infinite loop because priority queues cannot store negative integers",
            "Its greedy choice property assumes that once a node's shortest distance is finalized and popped from the priority queue, no shorter path can be discovered later",
            "It cannot compute topological ordering for cyclic graphs",
            "Dijkstra only works on undirected bipartite graphs"
        ],
        correctAnswerIndex: 1,
        explanation: "Dijkstra relies on a greedy invariant: extending a path with non-negative edges can only increase or maintain distance. With negative edges, an unvisited longer path could become shorter upon taking a negative edge later, breaking the greedy finality.",
        hints: ["Consider what happens to already 'visited' or 'relaxed' vertices when a negative edge is encountered."],
        conceptTags: ["dsa", "graphs", "dijkstra", "bellman-ford"]
    },
    {
        id: "q-dsa-04",
        subject: "Algorithms & Data Structures",
        topic: "Trees & Hierarchies",
        subtopic: "Binary Search Tree Validation",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "BST Global Range Invariant",
        description: "Which statement accurately describes the condition required for a binary tree to be a valid Binary Search Tree (BST)?",
        options: [
            "For every node, node.left.val < node.val and node.right.val > node.val",
            "Every node must satisfy minVal < node.val < maxVal, where minVal and maxVal are inherited from all ancestor nodes",
            "The in-order traversal yields elements in descending order",
            "The height difference between left and right subtrees cannot exceed 1"
        ],
        correctAnswerIndex: 1,
        explanation: "Verifying only immediate parent-child relationships is insufficient. A valid BST requires every node in the entire left subtree to be strictly smaller than the ancestor root, and every node in the right subtree to be strictly greater.",
        hints: ["Think about a tree: Root=10, Right=15, Right's Left Child=6. Is it a valid BST even though 6 < 15?"],
        conceptTags: ["dsa", "trees", "bst", "recursion"]
    },

    // --- 2. DATABASE MANAGEMENT SYSTEMS (DBMS) ---
    {
        id: "q-dbms-01",
        subject: "Database Management Systems",
        topic: "Relational Normalization",
        subtopic: "BCNF vs 3NF",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Boyce-Codd Normal Form (BCNF) Condition",
        description: "A relation R is in Boyce-Codd Normal Form (BCNF) if and only if for every non-trivial functional dependency X -> Y:",
        options: [
            "Y is a prime attribute",
            "X is a super key",
            "Either X is a super key OR Y is a prime attribute",
            "No multivalued dependencies exist"
        ],
        correctAnswerIndex: 1,
        explanation: "In BCNF, the left-hand determinant X must strictly be a super key for all non-trivial FDs. 3NF relaxes this by allowing Y to be a prime attribute, which preserves functional dependencies at the expense of potential anomalies.",
        hints: ["Which normal form is stricter and disallows 'Y is a prime attribute'?"],
        conceptTags: ["dbms", "normalization", "bcnf", "3nf"]
    },
    {
        id: "q-dbms-02",
        subject: "Database Management Systems",
        topic: "Transaction Concurrency & ACID",
        subtopic: "Isolation Levels & Anomalies",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "Preventing Phantom Read Anomalies",
        description: "Which ANSI SQL transaction isolation level provides guaranteed protection against Phantom Reads?",
        options: [
            "Read Uncommitted",
            "Read Committed",
            "Repeatable Read",
            "Serializable"
        ],
        correctAnswerIndex: 3,
        explanation: "Serializable isolation prevents Phantom Reads (where a concurrent transaction inserts new records matching a range query) by enforcing predicate locks or strict two-phase locking (SS2PL).",
        hints: ["Repeatable Read locks existing rows but does not lock the gaps where new records can be inserted."],
        conceptTags: ["dbms", "transactions", "acid", "isolation-levels"]
    },
    {
        id: "q-dbms-03",
        subject: "Database Management Systems",
        topic: "B+ Tree Indexing Internals",
        subtopic: "Storage Architecture",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "B+ Tree Advantage over Traditional B-Tree in Databases",
        description: "Why do modern relational database engines (PostgreSQL, MySQL InnoDB) use B+ Trees instead of standard B-Trees for table indexing?",
        options: [
            "B+ Trees have O(1) point search time complexity",
            "All data pointers/records are stored exclusively in leaf nodes linked sequentially, maximizing internal node fan-out and enabling fast range scans",
            "B+ Trees require zero disk I/O operations",
            "B+ Trees do not require rebalancing during insertions"
        ],
        correctAnswerIndex: 1,
        explanation: "Because internal nodes only store keys (without record pointers), more keys fit into a single disk page, maximizing tree fan-out and keeping depth low (typically 3-4 levels for billions of rows). Leaf node linked lists make range scans (BETWEEN, >=) sequential and blazing fast.",
        hints: ["Consider what happens during a `WHERE age BETWEEN 20 AND 30` query."],
        conceptTags: ["dbms", "indexing", "b-plus-tree", "innodb"]
    },

    // --- 3. OPERATING SYSTEMS (OS) ---
    {
        id: "q-os-01",
        subject: "Operating Systems",
        topic: "Memory Management & Virtual Memory",
        subtopic: "Thrashing & Working Set Model",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "Thrashing State & OS Mitigation",
        description: "What constitutes 'thrashing' in an operating system, and how does the OS kernel remediate it?",
        options: [
            "CPU core execution lockups caused by cyclic mutex dependencies; mitigated by Banker's algorithm",
            "The system spends more time servicing page faults and disk I/O than executing user instructions; mitigated by reducing the degree of multiprogramming and swapping out processes",
            "Unrecoverable TLB cache corruption; mitigated by flushing kernel registers",
            "Segmentation fault loops caused by dangling heap pointers"
        ],
        correctAnswerIndex: 1,
        explanation: "Thrashing occurs when the aggregate working sets of active processes exceed available physical RAM frames, causing continuous page faults. The OS resolves it by suspending/swapping out processes to reduce active memory contention.",
        hints: ["Think about what happens to CPU utilization when page fault rate crosses a critical threshold."],
        conceptTags: ["os", "virtual-memory", "paging", "thrashing"]
    },
    {
        id: "q-os-02",
        subject: "Operating Systems",
        topic: "Process Synchronization",
        subtopic: "Deadlocks & Necessary Conditions",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Coffman Deadlock Conditions",
        description: "Which of the following is NOT one of the four Coffman conditions necessary for a system deadlock to occur?",
        options: [
            "Mutual Exclusion",
            "Hold and Wait",
            "Preemptive Resource Allocation",
            "Circular Wait"
        ],
        correctAnswerIndex: 2,
        explanation: "The four Coffman conditions are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption (resources cannot be forcibly taken), and 4) Circular Wait. Preemption is a mechanism used to PREVENT deadlocks.",
        hints: ["A deadlock requires that resources CANNOT be preempted."],
        conceptTags: ["os", "deadlock", "synchronization", "coffman"]
    },

    // --- 4. COMPUTER NETWORKS (CN) ---
    {
        id: "q-cn-01",
        subject: "Computer Networks",
        topic: "Transport Layer Protocols",
        subtopic: "TCP Connection Teardown & TIME_WAIT",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Purpose of 2*MSL in TCP TIME_WAIT State",
        description: "Why does the active closer of a TCP connection transition into the TIME_WAIT state for 2*MSL (Maximum Segment Lifetime)?",
        options: [
            "To allow delayed duplicate packets from the connection to expire in the network and ensure the final ACK was received by the remote endpoint",
            "To calculate cryptographic hashes before reclaiming socket memory",
            "To negotiate new window sizes for subsequent incoming SYN packets",
            "To flush OS kernel DNS caches"
        ],
        correctAnswerIndex: 0,
        explanation: "TIME_WAIT ensures: 1) The final ACK sent to the peer is acknowledged (if lost, the peer retransmits FIN), and 2) Stale duplicate segments traversing the network drain out completely so they do not corrupt a new connection reused on the same port.",
        hints: ["What happens if the final ACK from client to server gets lost in transit?"],
        conceptTags: ["computer-networks", "tcp", "handshake", "time-wait"]
    },
    {
        id: "q-cn-02",
        subject: "Computer Networks",
        topic: "Application & Transport Protocols",
        subtopic: "HTTP/2 vs HTTP/3 (QUIC)",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "HTTP/3 Head-of-Line Blocking Solution",
        description: "How does HTTP/3 overcome the transport-layer Head-of-Line (HoL) blocking inherent in HTTP/2?",
        options: [
            "By increasing TCP window size to 10MB",
            "By switching from TCP to QUIC over UDP, allowing independent stream multiplexing where a lost packet only halts its specific stream",
            "By caching all assets at DNS edge servers",
            "By compressing header fields using HPACK instead of QPACK"
        ],
        correctAnswerIndex: 1,
        explanation: "In HTTP/2 over TCP, a single dropped TCP packet halts all multiplexed streams until retransmitted (Transport HoL blocking). HTTP/3 runs on QUIC (UDP), handling stream retransmissions independently so packet loss in stream A does not stall stream B.",
        hints: ["HTTP/2 solved application-layer HoL blocking, but TCP still suffered from transport-layer HoL blocking."],
        conceptTags: ["computer-networks", "http3", "quic", "networking"]
    },

    // --- 5. OBJECT-ORIENTED DESIGN & LLD ---
    {
        id: "q-lld-01",
        subject: "Object-Oriented Design & LLD",
        topic: "SOLID Design Principles",
        subtopic: "Liskov Substitution Principle (LSP)",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Liskov Substitution Principle (LSP) Violation",
        description: "Which classic scenario demonstrates a direct violation of the Liskov Substitution Principle (LSP)?",
        options: [
            "A `Square` subclass inheriting from `Rectangle` where setting the width unexpectedly modifies height, breaking rectangle client expectations",
            "A class having more than one private helper method",
            "A payment processor interface having multiple implementation classes",
            "Using dependency injection instead of constructor parameter passing"
        ],
        correctAnswerIndex: 0,
        explanation: "LSP states that objects of a superclass should be replaceable with objects of its subclasses without altering program correctness. The Rectangle-Square problem violates LSP because client code expecting rectangular behavior breaks when height automatically alters with width.",
        hints: ["If S is a subtype of T, objects of type T may be replaced with objects of type S without altering desired properties."],
        conceptTags: ["lld", "solid", "lsp", "design-patterns"]
    },

    // --- 6. SYSTEM DESIGN FUNDAMENTALS ---
    {
        id: "q-sys-01",
        subject: "System Design Fundamentals",
        topic: "Distributed Systems & Consistency",
        subtopic: "CAP Theorem & PACELC",
        difficulty: "Hard",
        questionType: "multiple_choice",
        title: "PACELC Theorem Tradeoffs",
        description: "What trade-off does the PACELC theorem describe during normal system operation (when NO network partition exists)?",
        options: [
            "CPU usage vs RAM consumption",
            "Latency (L) vs Consistency (C)",
            "Encryption overhead vs Storage capacity",
            "Throughput vs Disaster recovery"
        ],
        correctAnswerIndex: 1,
        explanation: "PACELC extends CAP: If there is a Partition (P), how does system trade Availability (A) vs Consistency (C); Else (E), how does system trade Latency (L) vs Consistency (C)? When normal, maintaining strict consistency requires cross-node replication roundtrips, increasing latency.",
        hints: ["PACELC = Partition -> (A vs C) | Else -> (Latency vs Consistency)."],
        conceptTags: ["system-design", "cap-theorem", "pacelc", "distributed-systems"]
    },

    // --- 7. QUANTITATIVE & LOGICAL REASONING ---
    {
        id: "q-apti-01",
        subject: "Quantitative & Analytical Aptitude",
        topic: "Combinatorics & Probability",
        subtopic: "Conditional Probability & Bayes",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Dice Pair Expectation",
        description: "Two unbiased 6-sided dice are rolled simultaneously. What is the probability that the sum of the numbers is greater than 8 given that at least one die shows a 5?",
        options: [
            "7 / 11",
            "5 / 11",
            "6 / 36",
            "8 / 11"
        ],
        correctAnswerIndex: 1,
        explanation: "Outcomes with at least one 5: (5,1)..(5,6) [6 pairs] and (1,5)..(6,5) [6 pairs] minus (5,5) [1 overlap] = 11 total outcomes. Of these, outcomes where sum > 8 are: (4,5)=9, (5,4)=9, (5,5)=10, (5,6)=11, (6,5)=11. Exactly 5 outcomes out of 11. Therefore, P(Sum > 8 | at least one 5) = 5 / 11.",
        hints: ["List out all 11 outcomes where at least one 5 appears, then count how many give a sum of 9, 10, 11, or 12."],
        conceptTags: ["aptitude", "probability", "combinatorics"]
    },

    // --- 8. BEHAVIORAL & STAR LEADERSHIP ---
    {
        id: "q-hr-01",
        subject: "Behavioral & STAR Leadership",
        topic: "Engineering Conflict & Ownership",
        subtopic: "STAR Framework Alignment",
        difficulty: "Medium",
        questionType: "multiple_choice",
        title: "Disagreed with Senior Engineer Decision",
        description: "When answering 'Describe a situation where you disagreed with a technical design decision made by a team lead,' what is the most compelling structure under Amazon/Google behavioral evaluation?",
        options: [
            "Explain how the lead was factually wrong and how you forced the issue in a public pull request",
            "Frame using STAR: State the technical context (S), your responsibility (T), objectively present benchmarks/data-backed alternatives you proposed respectfully (A), and share the resulting metric improvement and team alignment (R)",
            "State that you never disagree with leaders because hierarchy must be respected unconditionally",
            "Focus entirely on your personal feelings without mentioning code or performance telemetry"
        ],
        correctAnswerIndex: 1,
        explanation: "Top tier tech companies evaluate the 'Have Backbone; Disagree and Commit' and 'Ownership' leadership principles. Grounding disagreements in telemetry, benchmarks, and respectful data-driven prototypes while prioritizing project outcome exemplifies senior engineer maturity.",
        hints: ["Focus on data, benchmarks, constructive collaboration, and measurable outcomes."],
        conceptTags: ["behavioral", "star-method", "leadership", "interviews"]
    }
];

// Seed 20+ High-Frequency Coding Problems (LeetCode / Placement SDE-1 standard)
const SEED_CODING_PROBLEMS = [
    {
        id: "two-sum",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "Easy",
        acceptance: "51.2%",
        category: "Arrays & Hash Tables",
        tags: ["Array", "Hash Table", "Two Pointers"],
        companyTags: ["Amazon", "Google", "Microsoft", "TCS Prime", "Infosys DSE"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices of the two numbers such that they add up to \`target\`**.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.\n\n### Algorithmic Objective\nAchieve strictly **O(n) time complexity** and **O(n) space complexity** using a single-pass hash map.`,
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation: "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
            },
            {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation: "nums[1] + nums[2] == 2 + 4 == 6, return [1, 2]."
            },
            {
                input: "nums = [3,3], target = 6",
                output: "[0,1]",
                explanation: "nums[0] + nums[1] == 3 + 3 == 6, return [0, 1]."
            }
        ],
        constraints: [
            "2 <= nums.length <= 10^4",
            "-10^9 <= nums[i] <= 10^9",
            "-10^9 <= target <= 10^9",
            "Exactly one valid answer exists."
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // TODO: Implement solution\n    return [];\n}`,
            python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # TODO: Implement solution\n        pass`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // TODO: Implement solution\n        return {};\n    }\n};`,
            java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // TODO: Implement solution\n        return new int[]{};\n    }\n}`
        }
    },
    {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeating Characters",
        slug: "longest-substring-without-repeating-characters",
        difficulty: "Medium",
        acceptance: "34.8%",
        category: "Sliding Window",
        tags: ["Hash Table", "String", "Sliding Window"],
        companyTags: ["Amazon", "Microsoft", "Adobe", "Razorpay"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.\n\n### Complexity Benchmark\n- **Target Time Complexity**: O(n)\n- **Target Space Complexity**: O(min(m, n)) where m is charset size.`,
        examples: [
            {
                input: 's = "abcabcbb"',
                output: "3",
                explanation: 'The answer is "abc", with the length of 3.'
            },
            {
                input: 's = "bbbbb"',
                output: "1",
                explanation: 'The answer is "b", with the length of 1.'
            },
            {
                input: 's = "pwwkew"',
                output: "3",
                explanation: 'The answer is "wke", with the length of 3. Notice "pwke" is a subsequence, not a substring.'
            }
        ],
        constraints: [
            "0 <= s.length <= 5 * 10^4",
            "s consists of English letters, digits, symbols and spaces."
        ],
        starterCode: {
            javascript: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    // TODO: Implement solution\n    return 0;\n}`,
            python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # TODO: Implement solution\n        pass`,
            cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // TODO: Implement solution\n        return 0;\n    }\n};`,
            java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // TODO: Implement solution\n        return 0;\n    }\n}`
        }
    },
    {
        id: "lru-cache",
        title: "LRU Cache Architecture",
        slug: "lru-cache",
        difficulty: "Hard",
        acceptance: "42.1%",
        category: "System Data Structures",
        tags: ["Hash Table", "Linked List", "Design", "Doubly-Linked List"],
        companyTags: ["Google", "Amazon", "Apple", "Uber", "Flipkart"],
        timeLimitMs: 1500,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) Cache**.\n\nImplement the \`LRUCache\` class:\n- \`LRUCache(int capacity)\`: Initialize LRU cache with positive size capacity.\n- \`int get(int key)\`: Return the value of the key if key exists, otherwise return \`-1\`.\n- \`void put(int key, int value)\`: Update the value of the key if present. Otherwise, insert the key-value pair. If keys exceed capacity, evict the least recently used key.\n\n### Requirement\nBoth \`get\` and \`put\` functions MUST run in **O(1) average time complexity**.`,
        examples: [
            {
                input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
                output: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
                explanation: "Key 2 is evicted when key 3 is added. Key 1 is evicted when key 4 is added."
            }
        ],
        constraints: [
            "1 <= capacity <= 3000",
            "0 <= key <= 10^4",
            "0 <= value <= 10^5",
            "At most 2 * 10^5 calls will be made to get and put."
        ],
        starterCode: {
            javascript: `/**\n * Your LRUCache object will be instantiated and called as such:\n * var obj = new LRUCache(capacity)\n * var param_1 = obj.get(key)\n * obj.put(key,value)\n */\nclass LRUCache {\n    /**\n     * @param {number} capacity\n     */\n    constructor(capacity) {\n        // TODO: Initialize data structures\n    }\n\n    /** \n     * @param {number} key\n     * @return {number}\n     */\n    get(key) {\n        // TODO: Implement get\n        return -1;\n    }\n\n    /** \n     * @param {number} key \n     * @param {number} value\n     * @return {void}\n     */\n    put(key, value) {\n        // TODO: Implement put\n    }\n}`,
            python: `class LRUCache:\n    def __init__(self, capacity: int):\n        # TODO: Initialize data structures\n        pass\n\n    def get(self, key: int) -> int:\n        # TODO: Implement get\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        # TODO: Implement put\n        pass`,
            cpp: `class LRUCache {\npublic:\n    LRUCache(int capacity) {\n        // TODO: Initialize data structures\n    }\n    \n    int get(int key) {\n        // TODO: Implement get\n        return -1;\n    }\n    \n    void put(int key, int value) {\n        // TODO: Implement put\n    }\n};`,
            java: `class LRUCache {\n    public LRUCache(int capacity) {\n        // TODO: Initialize data structures\n    }\n    \n    public int get(int key) {\n        // TODO: Implement get\n        return -1;\n    }\n    \n    public void put(int key, int value) {\n        // TODO: Implement put\n    }\n}`
        }
    },
    {
        id: "merge-intervals",
        title: "Merge Intervals",
        slug: "merge-intervals",
        difficulty: "Medium",
        acceptance: "47.1%",
        category: "Interval Scheduling",
        tags: ["Array", "Sorting", "Intervals"],
        companyTags: ["Meta", "Google", "Amazon", "Uber", "TCS Digital"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all intervals in the input*.\n\n### Complexity Constraint\nTarget **O(n log n)** time complexity due to sorting.`,
        examples: [
            {
                input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                output: "[[1,6],[8,10],[15,18]]",
                explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
            },
            {
                input: "intervals = [[1,4],[4,5]]",
                output: "[[1,5]]",
                explanation: "Intervals [1,4] and [4,5] are considered overlapping at point 4."
            }
        ],
        constraints: [
            "1 <= intervals.length <= 10^4",
            "intervals[i].length == 2",
            "0 <= start_i <= end_i <= 10^4"
        ],
        starterCode: {
            javascript: `/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nfunction merge(intervals) {\n    // TODO: Implement solution\n    return [];\n}`,
            python: `class Solution:\n    def merge(self, intervals: list[list[int]]) -> list[list[int]]:\n        # TODO: Implement solution\n        pass`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        // TODO: Implement solution\n        return {};\n    }\n};`,
            java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        // TODO: Implement solution\n        return new int[][]{};\n    }\n}`
        }
    },
    {
        id: "trapping-rain-water",
        title: "Trapping Rain Water",
        slug: "trapping-rain-water",
        difficulty: "Hard",
        acceptance: "60.4%",
        category: "Two Pointers & Geometry",
        tags: ["Array", "Two Pointers", "Dynamic Programming", "Monotonic Stack"],
        companyTags: ["Google", "Amazon", "Atlassian", "Goldman Sachs"],
        timeLimitMs: 1000,
        memoryLimitMb: 256,
        hintsCount: 3,
        description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.\n\n### Requirement\nAchieve **O(n) time** and **O(1) auxiliary space** using two converging pointers.`,
        examples: [
            {
                input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                output: "6",
                explanation: "The above elevation map traps 6 units of rain water."
            }
        ],
        constraints: [
            "n == height.length",
            "1 <= n <= 2 * 10^4",
            "0 <= height[i] <= 10^5"
        ],
        starterCode: {
            javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction trap(height) {\n    // TODO: Implement solution\n    return 0;\n}`,
            python: `class Solution:\n    def trap(self, height: list[int]) -> int:\n        # TODO: Implement solution\n        pass`,
            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int trap(vector<int>& height) {\n        // TODO: Implement solution\n        return 0;\n    }\n};`,
            java: `class Solution {\n    public int trap(int[] height) {\n        // TODO: Implement solution\n        return 0;\n    }\n}`
        }
    }];

// Seed Sprints and Benchmarks
const SEED_TESTS = [
    {
        id: "sprint-dsa-velocity",
        title: "Sprint Alpha: Algorithmic Complexity & Pointer Traversal",
        subject: "Algorithms & Data Structures",
        topic: "Arrays, Deque, Graphs, Dynamic Programming",
        questionIds: ["q-dsa-01", "q-dsa-02", "q-dsa-03", "q-dsa-04"],
        durationMinutes: 20,
        totalMarks: 40,
        passMarks: 28,
        tierLevel: "Product SDE-1"
    },
    {
        id: "sprint-dbms-internals",
        title: "Sprint Beta: Relational Internals & Index Optimization",
        subject: "Database Management Systems",
        topic: "Normalization, ACID, Isolation Levels, B+ Trees",
        questionIds: ["q-dbms-01", "q-dbms-02", "q-dbms-03"],
        durationMinutes: 15,
        totalMarks: 30,
        passMarks: 21,
        tierLevel: "Enterprise & High-Growth"
    },
    {
        id: "sprint-systems-architecture",
        title: "Sprint Gamma: OS Paging & High-Concurrency Networks",
        subject: "Systems & Distributed Networks",
        topic: "Virtual Memory, Deadlocks, TCP TIME_WAIT, HTTP/3 QUIC, PACELC",
        questionIds: ["q-os-01", "q-os-02", "q-cn-01", "q-cn-02", "q-sys-01", "q-lld-01"],
        durationMinutes: 25,
        totalMarks: 60,
        passMarks: 42,
        tierLevel: "Staff SDE & Core CS"
    },
    {
        id: "sprint-full-placement-diagnostic",
        title: "Full Placement Readiness Diagnostic Benchmark",
        subject: "Comprehensive Engineering Evaluation",
        topic: "Full CS Stack + Quantitative Reasoning + STAR Leadership",
        questionIds: ["q-dsa-01", "q-dsa-02", "q-dsa-03", "q-dbms-01", "q-dbms-02", "q-dbms-03", "q-os-01", "q-cn-01", "q-sys-01", "q-apti-01", "q-hr-01"],
        durationMinutes: 35,
        totalMarks: 110,
        passMarks: 75,
        tierLevel: "Day-0 All-Rounder"
    },
    ...APTITUDE_TESTS
];

// Password hash for 'InterviewX#2026' (bcrypt salt 10)
const DEMO_PASSWORD_HASH = bcrypt.hashSync("InterviewX#2026", 10);

// Seed Student Profile
const SEED_STUDENT = {
    id: "candidate-001",
    name: "Alex Morgan",
    email: "alex.morgan@interviewx.dev",
    passwordHash: DEMO_PASSWORD_HASH,
    college: "Institute of Technology & Science",
    department: "Computer Science & Engineering",
    graduationYear: "2026",
    targetTrack: "Tier-1 Product SDE (FAANG / Unicorn)",
    primaryLanguage: "JavaScript / TypeScript",
    placementVelocityIndex: 84.6,
    targetCompanies: ["Amazon", "Google", "Razorpay", "TCS Prime"],
    createdAt: "2026-08-10T09:00:00.000Z"
};


const SEED_ATTEMPTS = [
    {
        id: "att-hist-01",
        studentId: "candidate-001",
        testId: "sprint-dbms-internals",
        testTitle: "Sprint Beta: Relational Internals & Index Optimization",
        startedAt: "2026-09-22T10:00:00.000Z",
        submittedAt: "2026-09-22T10:13:45.000Z",
        score: 20,
        totalQuestions: 3,
        correctCount: 2,
        incorrectCount: 1,
        skippedCount: 0,
        accuracyPct: 66.7,
        averageTimePerQuestionSec: 275,
        answers: [
            { questionId: "q-dbms-01", selectedOption: 1, isCorrect: true, timeSpentSec: 240, subject: "Database Management Systems", topic: "Relational Normalization", difficulty: "Medium" },
            { questionId: "q-dbms-02", selectedOption: 2, isCorrect: false, timeSpentSec: 310, subject: "Database Management Systems", topic: "Transaction Concurrency & ACID", difficulty: "Hard" },
            { questionId: "q-dbms-03", selectedOption: 1, isCorrect: true, timeSpentSec: 275, subject: "Database Management Systems", topic: "B+ Tree Indexing Internals", difficulty: "Hard" }
        ]
    },
    {
        id: "att-hist-02",
        studentId: "candidate-001",
        testId: "sprint-full-placement-diagnostic",
        testTitle: "Full Placement Readiness Diagnostic Benchmark",
        startedAt: "2026-10-02T14:30:00.000Z",
        submittedAt: "2026-10-02T15:02:10.000Z",
        score: 90,
        totalQuestions: 11,
        correctCount: 9,
        incorrectCount: 2,
        skippedCount: 0,
        accuracyPct: 81.8,
        averageTimePerQuestionSec: 175,
        answers: [
            { questionId: "q-dsa-01", selectedOption: 1, isCorrect: true, timeSpentSec: 130, subject: "Algorithms & Data Structures", topic: "Sliding Window & Two Pointers", difficulty: "Medium" },
            { questionId: "q-dsa-02", selectedOption: 1, isCorrect: true, timeSpentSec: 180, subject: "Algorithms & Data Structures", topic: "Dynamic Programming", difficulty: "Hard" },
            { questionId: "q-dsa-03", selectedOption: 1, isCorrect: true, timeSpentSec: 150, subject: "Algorithms & Data Structures", topic: "Graph Algorithms", difficulty: "Medium" },
            { questionId: "q-dbms-01", selectedOption: 1, isCorrect: true, timeSpentSec: 140, subject: "Database Management Systems", topic: "Relational Normalization", difficulty: "Medium" },
            { questionId: "q-dbms-02", selectedOption: 3, isCorrect: true, timeSpentSec: 190, subject: "Database Management Systems", topic: "Transaction Concurrency & ACID", difficulty: "Hard" },
            { questionId: "q-dbms-03", selectedOption: 1, isCorrect: true, timeSpentSec: 160, subject: "Database Management Systems", topic: "B+ Tree Indexing Internals", difficulty: "Hard" },
            { questionId: "q-os-01", selectedOption: 1, isCorrect: true, timeSpentSec: 210, subject: "Operating Systems", topic: "Memory Management & Virtual Memory", difficulty: "Hard" },
            { questionId: "q-cn-01", selectedOption: 0, isCorrect: true, timeSpentSec: 140, subject: "Computer Networks", topic: "Transport Layer Protocols", difficulty: "Medium" },
            { questionId: "q-sys-01", selectedOption: 0, isCorrect: false, timeSpentSec: 230, subject: "System Design Fundamentals", topic: "Distributed Systems & Consistency", difficulty: "Hard" },
            { questionId: "q-apti-01", selectedOption: 1, isCorrect: true, timeSpentSec: 185, subject: "Quantitative & Analytical Aptitude", topic: "Combinatorics & Probability", difficulty: "Medium" },
            { questionId: "q-hr-01", selectedOption: 1, isCorrect: true, timeSpentSec: 110, subject: "Behavioral & STAR Leadership", topic: "Engineering Conflict & Ownership", difficulty: "Medium" }
        ]
    }
];

let saveTimeout = null;
let isSaving = false;
let pendingSave = false;

// Fast in-memory index maps for O(1) lookups
const problemIdMap = new Map();
const problemSlugMap = new Map();
const questionIdMap = new Map();

function rebuildIndexes() {
    problemIdMap.clear();
    problemSlugMap.clear();
    questionIdMap.clear();

    if (store.codingProblems) {
        for (let i = 0; i < store.codingProblems.length; i++) {
            const p = store.codingProblems[i];
            if (p.id) problemIdMap.set(p.id, p);
            if (p.slug) problemSlugMap.set(p.slug, p);
        }
    }

    if (store.questions) {
        for (let i = 0; i < store.questions.length; i++) {
            const q = store.questions[i];
            if (q.id) questionIdMap.set(q.id, q);
        }
    }
}

function initDb() {
    try {
        // In serverless (Vercel, Netlify): bootstrap /tmp/store.json from bundled read-only copy if not already present
        if (IS_SERVERLESS && !fs.existsSync(TMP_DB) && fs.existsSync(BUNDLED_DB_FILE)) {
            fs.copyFileSync(BUNDLED_DB_FILE, TMP_DB);
        }
        if (fs.existsSync(DB_FILE)) {
            const raw = fs.readFileSync(DB_FILE, 'utf8');
            store = JSON.parse(raw);
            if (!store.codingProblems || store.codingProblems.length < SEED_CODING_PROBLEMS.length) {
                store.codingProblems = SEED_CODING_PROBLEMS;
            } else {
                // Ensure curated seed problems (e.g. Two Sum) always have authentic descriptions, examples, and constraints
                SEED_CODING_PROBLEMS.forEach(sp => {
                    const idx = store.codingProblems.findIndex(p => p.id === sp.id || p.slug === sp.slug);
                    if (idx >= 0) {
                        store.codingProblems[idx] = { ...store.codingProblems[idx], ...sp };
                    } else {
                        store.codingProblems.unshift(sp);
                    }
                });
                // Strictly purge any private fields from in-memory problem store
                store.codingProblems.forEach(p => {
                    delete p.testCases;
                    delete p.solution;
                    delete p.editorial;
                    delete p.referenceSolutions;
                });
            }
            if (!store.questions || store.questions.length < SEED_QUESTIONS.length) {
                store.questions = SEED_QUESTIONS;
            }

            // Clean up placeholder duplicates and ensure all high-rigor aptitude questions are present
            store.questions = store.questions.filter(q => !q.title || !q.title.includes('Scenario Assessment'));
            APTITUDE_QUESTIONS.forEach(aq => {
                const existingIdx = store.questions.findIndex(q => q.id === aq.id);
                if (existingIdx >= 0) {
                    store.questions[existingIdx] = aq;
                } else {
                    store.questions.push(aq);
                }
            });

            if (!store.tests || store.tests.length < SEED_TESTS.length) {
                store.tests = SEED_TESTS;
            }
            // Ensure all aptitude tests are present
            APTITUDE_TESTS.forEach(at => {
                const existingIdx = store.tests.findIndex(t => t.id === at.id);
                if (existingIdx >= 0) {
                    store.tests[existingIdx] = at;
                } else {
                    store.tests.push(at);
                }
            });
            saveDb();

            if (!store.students || store.students.length === 0) {
                store.students = [SEED_STUDENT];
            } else {
                // Always patch candidate-001 with the correct auth credentials
                const demo = store.students.find(s => s.id === 'candidate-001');
                if (demo) {
                    demo.email = SEED_STUDENT.email;
                    demo.passwordHash = SEED_STUDENT.passwordHash;
                } else {
                    store.students.unshift(SEED_STUDENT);
                }
            }
            if (!store.testAttempts || store.testAttempts.length === 0) {
                store.testAttempts = SEED_ATTEMPTS;
            }

            try {
                const { ContentImporter } = require('../content/contentImporter');
                const diskArticles = ContentImporter.loadAllArticles();
                if (diskArticles && diskArticles.length > 0) {
                    store.articles = diskArticles;
                }
            } catch (err) {}
        } else {
            store.students = [SEED_STUDENT];
            store.questions = SEED_QUESTIONS;
            store.codingProblems = SEED_CODING_PROBLEMS;
            store.tests = SEED_TESTS;
            store.testAttempts = SEED_ATTEMPTS;
            store.codeSubmissions = [];
            store.studyPlans = [];
            store.interviews = [];
            store.conversations = [];
        }
        rebuildIndexes();
    } catch (e) {
        console.error("Database initialization error:", e);
        store.students = [SEED_STUDENT];
        store.questions = SEED_QUESTIONS;
        store.codingProblems = SEED_CODING_PROBLEMS;
        store.tests = SEED_TESTS;
        store.testAttempts = SEED_ATTEMPTS;
        rebuildIndexes();
    }
}

function saveDb(immediate = false) {
    if (immediate) {
        try {
            fs.writeFileSync(DB_FILE, JSON.stringify(store), 'utf8');
        } catch (err) {
            console.error("Database synchronous save failed:", err);
        }
        return;
    }

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
        if (isSaving) {
            pendingSave = true;
            return;
        }
        isSaving = true;
        try {
            const serialized = JSON.stringify(store);
            await fs.promises.writeFile(DB_FILE, serialized, 'utf8');
        } catch (err) {
            console.error("Database async save failed:", err);
        } finally {
            isSaving = false;
            if (pendingSave) {
                pendingSave = false;
                saveDb();
            }
        }
    }, 150);
}

const db = {
    // Student
    getStudentById: (id) => store.students.find(s => s.id === id) || store.students[0],
    updateStudent: (id, updates) => {
        const student = store.students.find(s => s.id === id);
        if (student) {
            Object.assign(student, updates);
            saveDb();
            return student;
        }
        return null;
    },

    // Questions & Sprints
    getAllQuestions: () => store.questions,
    getQuestionById: (id) => questionIdMap.get(id) || store.questions.find(q => q.id === id),
    getAllTests: () => store.tests,
    getTestById: (id) => {
        const test = store.tests.find(t => t.id === id);
        if (!test) return null;
        const populatedQuestions = test.questionIds.map(qid => questionIdMap.get(qid) || store.questions.find(q => q.id === qid)).filter(Boolean);
        return { ...test, questions: populatedQuestions };
    },

    // Quantitative & Aptitude Queries
    getAptitudeTopics: () => {
        return APTITUDE_TOPICS_METADATA.map(t => {
            const matching = (store.questions || []).filter(q => 
                q.subject === "Quantitative & Analytical Aptitude" && 
                (q.topic === t.title || (q.topic || '').toLowerCase().includes(t.id))
            );
            return {
                ...t,
                questionCount: matching.length || 3
            };
        });
    },
    getAptitudeQuestions: ({ topic, difficulty, limit } = {}) => {
        let list = (store.questions || []).filter(q => q.subject === "Quantitative & Analytical Aptitude");
        if (topic && topic !== 'all') {
            const meta = APTITUDE_TOPICS_METADATA.find(m => m.id === topic || m.title === topic);
            const targetTitle = meta ? meta.title : topic;
            list = list.filter(q => q.topic === targetTitle || (q.topic || '').toLowerCase().includes(topic.toLowerCase()));
        }
        if (difficulty && difficulty !== 'all') {
            list = list.filter(q => (q.difficulty || '').toLowerCase() === difficulty.toLowerCase());
        }
        if (limit && Number(limit) > 0) {
            list = list.slice(0, Number(limit));
        }
        return list;
    },
    saveTest: (testData) => {
        if (!store.tests) store.tests = [];
        const existingIdx = store.tests.findIndex(t => t.id === testData.id);
        if (existingIdx >= 0) {
            store.tests[existingIdx] = testData;
        } else {
            store.tests.push(testData);
        }
        saveDb();
        return testData;
    },

    // Test Attempts
    getAttemptsByStudentId: (studentId) => store.testAttempts.filter(a => a.studentId === studentId),
    saveTestAttempt: (attemptData) => {
        const attempt = {
            id: "att-" + Date.now(),
            submittedAt: new Date().toISOString(),
            ...attemptData
        };
        store.testAttempts.push(attempt);
        saveDb();
        return attempt;
    },

    // Coding Proving Ground (Optimized with O(1) hash maps)
    getCodingProblems: () => store.codingProblems || SEED_CODING_PROBLEMS,
    getCodingProblemById: (idOrSlug) => {
        return problemIdMap.get(idOrSlug) || problemSlugMap.get(idOrSlug) || (store.codingProblems || []).find(p => p.id === idOrSlug || p.slug === idOrSlug);
    },
    saveCodeSubmission: (submission) => {
        if (!store.codeSubmissions) store.codeSubmissions = [];
        const entry = {
            id: "sub-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            submittedAt: new Date().toISOString(),
            ...submission
        };
        store.codeSubmissions.push(entry);
        saveDb();
        return entry;
    },
    getCodeSubmissionsByStudentId: (studentId) => {
        if (!store.codeSubmissions) return [];
        return store.codeSubmissions.filter(s => s.studentId === studentId);
    },
    recordEditorialView: (studentId, problemId) => {
        if (!store.editorialViews) store.editorialViews = [];
        const exists = store.editorialViews.some(ev => ev.studentId === studentId && ev.problemId === problemId);
        if (!exists) {
            store.editorialViews.push({
                studentId,
                problemId,
                viewedAt: new Date().toISOString()
            });
            saveDb();
        }
        return true;
    },
    hasStudentViewedEditorial: (studentId, problemId) => {
        if (!store.editorialViews) return false;
        return store.editorialViews.some(ev => ev.studentId === studentId && ev.problemId === problemId);
    },
    hasStudentSolvedProblem: (studentId, problemId) => {
        if (!store.codeSubmissions) return false;
        return store.codeSubmissions.some(s => s.studentId === studentId && (s.problemId === problemId || s.slug === problemId) && s.status === 'Accepted');
    },

    // Study Plans & Milestones
    getStudyPlanByStudentId: (studentId) => {
        const plans = store.studyPlans.filter(p => p.studentId === studentId);
        return plans.length > 0 ? plans[plans.length - 1] : null;
    },
    saveStudyPlan: (plan) => {
        store.studyPlans.push(plan);
        saveDb();
        return plan;
    },

    // Mock Interviews
    getInterviewsByStudentId: (studentId) => store.interviews.filter(i => i.studentId === studentId),
    getInterviewById: (id) => store.interviews.find(i => i.id === id),
    saveInterview: (session) => {
        const idx = store.interviews.findIndex(i => i.id === session.id);
        if (idx >= 0) store.interviews[idx] = session;
        else store.interviews.push(session);
        saveDb();
        return session;
    },

    // Agent Conversations
    getConversation: (studentId, type = "neural_advisor") => {
        let conv = store.conversations.find(c => c.studentId === studentId && c.conversationType === type);
        if (!conv) {
            conv = {
                id: "conv-" + Date.now(),
                studentId,
                conversationType: type,
                messages: []
            };
            store.conversations.push(conv);
            saveDb();
        }
        return conv;
    },
    appendMessage: (studentId, type, message) => {
        let conv = store.conversations.find(c => c.studentId === studentId && c.conversationType === type);
        if (!conv) {
            conv = {
                id: "conv-" + Date.now(),
                studentId,
                conversationType: type,
                messages: []
            };
            store.conversations.push(conv);
        }
        conv.messages.push({
            id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            timestamp: new Date().toISOString(),
            ...message
        });
        saveDb();
        return conv;
    },
    clearConversation: (studentId, type) => {
        const conv = store.conversations.find(c => c.studentId === studentId && c.conversationType === type);
        if (conv) {
            conv.messages = [];
            saveDb();
        }
    },

    // Student Suggestions & Question Reviews
    getFeedbackByQuestionId: (questionId) => {
        if (!store.questionFeedback) store.questionFeedback = [];
        return store.questionFeedback.filter(f => f.questionId === questionId);
    },
    addQuestionFeedback: (feedbackData) => {
        if (!store.questionFeedback) store.questionFeedback = [];
        const entry = {
            id: "fbk-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            createdAt: new Date().toISOString(),
            upvotes: 0,
            ...feedbackData
        };
        store.questionFeedback.push(entry);
        saveDb();
        return entry;
    },
    getAllQuestionFeedback: () => store.questionFeedback || [],

    // Contact & Support Messages
    saveContactMessage: (contactData) => {
        if (!store.contactMessages) store.contactMessages = [];
        const entry = {
            id: "msg-" + Date.now() + "-" + Math.random().toString(36).substr(2, 6),
            submittedAt: new Date().toISOString(),
            status: "unread",
            ...contactData
        };
        store.contactMessages.push(entry);
        saveDb();
        return entry;
    },
    getContactMessages: () => store.contactMessages || [],

    // Journal & Technical Articles
    getAllArticles: () => {
        if (!store.articles || store.articles.length === 0) {
            try {
                const { ContentImporter } = require('../content/contentImporter');
                const diskArticles = ContentImporter.loadAllArticles();
                if (diskArticles && diskArticles.length > 0) {
                    store.articles = diskArticles;
                    return store.articles;
                }
            } catch (e) {}
            store.articles = SEED_ARTICLES;
            saveDb();
        }
        return store.articles;
    },
    setArticles: (articles) => {
        store.articles = articles;
        saveDb();
    },
    getArticleBySlug: (slug) => {
        if (!store.articles || store.articles.length === 0) {
            try {
                const { ContentImporter } = require('../content/contentImporter');
                const diskArticles = ContentImporter.loadAllArticles();
                if (diskArticles && diskArticles.length > 0) {
                    store.articles = diskArticles;
                }
            } catch (e) {}
            if (!store.articles || store.articles.length === 0) {
                store.articles = SEED_ARTICLES;
                saveDb();
            }
        }
        return store.articles.find(a => a.slug === slug || a.id === slug);
    },

    // Career Roadmaps
    getRoadmapByStudentId: (studentId) => {
        if (!store.roadmaps) store.roadmaps = [];
        return store.roadmaps.find(r => r.studentId === studentId) || null;
    },
    saveRoadmap: (roadmapData) => {
        if (!store.roadmaps) store.roadmaps = [];
        const existingIndex = store.roadmaps.findIndex(r => r.studentId === roadmapData.studentId);
        const existingRecord = existingIndex >= 0 ? store.roadmaps[existingIndex] : null;
        
        const history = (existingRecord && existingRecord.history) ? [...existingRecord.history] : [];
        if (existingRecord && existingRecord.roadmap) {
            history.unshift({
                version: existingRecord.version || 1,
                updatedAt: existingRecord.updatedAt,
                title: existingRecord.roadmap.title,
                goalHash: existingRecord.roadmap.goalHash
            });
            if (history.length > 5) history.length = 5;
        }

        const version = (existingRecord && existingRecord.version ? existingRecord.version : 0) + 1;

        const record = {
            id: roadmapData.id || "roadmap-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            version,
            history,
            updatedAt: new Date().toISOString(),
            ...roadmapData
        };
        if (existingIndex >= 0) {
            store.roadmaps[existingIndex] = record;
        } else {
            store.roadmaps.push(record);
        }
        saveDb();
        return record;
    },
    clearRoadmap: (studentId) => {
        if (!store.roadmaps) return;
        store.roadmaps = store.roadmaps.filter(r => r.studentId !== studentId);
        saveDb();
    },

    // Performance Analytics Profiles
    getAnalyticsByStudentId: (studentId) => {
        if (!store.analytics) store.analytics = [];
        return store.analytics.find(a => a.studentId === studentId) || null;
    },
    saveAnalytics: (analyticsData) => {
        if (!store.analytics) store.analytics = [];
        const existingIndex = store.analytics.findIndex(a => a.studentId === analyticsData.studentId);
        const record = {
            id: analyticsData.id || "analytics-" + Date.now() + "-" + Math.random().toString(36).substr(2, 4),
            updatedAt: new Date().toISOString(),
            ...analyticsData
        };
        if (existingIndex >= 0) {
            store.analytics[existingIndex] = record;
        } else {
            store.analytics.push(record);
        }
        saveDb();
        return record;
    },
    clearAnalytics: (studentId) => {
        if (!store.analytics) return;
        store.analytics = store.analytics.filter(a => a.studentId !== studentId);
        saveDb();
    },

    // ─── Auth: Users ───────────────────────────────────────────────
    findUserByEmail: (email) => {
        if (!store.students) return null;
        return store.students.find(s => s.email && s.email.toLowerCase() === email.toLowerCase()) || null;
    },
    createUser: async ({ name, email, password }) => {
        if (!store.students) store.students = [];
        const existing = store.students.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());
        if (existing) return { error: 'EMAIL_EXISTS' };
        const passwordHash = await bcrypt.hash(password, 10);
        const postHashCheck = store.students.find(s => s.email && s.email.toLowerCase() === email.toLowerCase());
        if (postHashCheck) return { error: 'EMAIL_EXISTS' };
        const newUser = {
            id: 'student-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            name,
            email,
            passwordHash,
            college: '',
            department: '',
            graduationYear: '',
            targetTrack: 'SDE (General)',
            primaryLanguage: 'JavaScript',
            placementVelocityIndex: 0,
            targetCompanies: [],
            createdAt: new Date().toISOString()
        };
        store.students.push(newUser);
        saveDb();
        return newUser;
    },
    verifyPassword: async (user, password) => {
        if (!user || !user.passwordHash) return false;
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (valid) return true;
        // Permissive fallback for admin/owner test accounts
        const emailLower = (user.email || '').toLowerCase();
        if (emailLower === 'abhishekpendhare31@gmail.com' || emailLower === 'abhinavjadhav070@gmail.com' || emailLower === 'abhishekstudio.editz@gmail.com') {
            const accepted = ['abhinav77#', 'abhishek77#', 'abhishek@123', 'abhishek123#', 'abhishekpendhare31', 'abhishekpendhare'];
            if (accepted.includes(String(password).toLowerCase())) {
                return true;
            }
        }
        return false;
    },

    // ─── Auth: Sessions ────────────────────────────────────────────
    createSession: (userId, rememberMe = false) => {
        if (!store.sessions) store.sessions = [];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = rememberMe
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            : null; // browser session
        const session = { token, userId, createdAt: new Date().toISOString(), expiresAt };
        store.sessions.push(session);
        saveDb();
        return session;
    },
    getSession: (token) => {
        if (!store.sessions) return null;
        const session = store.sessions.find(s => s.token === token);
        if (!session) return null;
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
            // expired — clean up
            store.sessions = store.sessions.filter(s => s.token !== token);
            saveDb();
            return null;
        }
        return session;
    },
    deleteSession: (token) => {
        if (!store.sessions) return;
        store.sessions = store.sessions.filter(s => s.token !== token);
        saveDb();
    },

    // ─── Auth: Password Reset ──────────────────────────────────────
    createPasswordResetToken: (email) => {
        if (!store.resetTokens) store.resetTokens = [];
        const normalizedEmail = String(email).trim().toLowerCase();
        // Remove prior tokens for this account and store only a digest of the
        // bearer token. The raw token is returned once for the reset email.
        store.resetTokens = store.resetTokens.filter(t => String(t.email).toLowerCase() !== normalizedEmail);
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        store.resetTokens.push({ tokenHash, email: normalizedEmail, expiresAt });
        saveDb();
        return token;
    },
    validateResetToken: (token) => {
        if (!store.resetTokens) return null;
        const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
        // Support unexpired tokens created by older app versions during rollout.
        const entry = store.resetTokens.find(t => t.tokenHash === tokenHash || t.token === token);
        if (!entry) return null;
        if (new Date(entry.expiresAt) < new Date()) {
            store.resetTokens = store.resetTokens.filter(t => t.tokenHash !== tokenHash && t.token !== token);
            saveDb();
            return null;
        }
        return entry;
    },
    removePasswordResetToken: (token) => {
        if (!store.resetTokens) return;
        const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
        store.resetTokens = store.resetTokens.filter(t => t.tokenHash !== tokenHash && t.token !== token);
        saveDb();
    },
    resetPassword: async (token, newPassword) => {
        const entry = db.validateResetToken(token);
        if (!entry) return { error: 'INVALID_OR_EXPIRED_TOKEN' };
        const user = db.findUserByEmail(entry.email);
        if (!user) return { error: 'USER_NOT_FOUND' };
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        store.resetTokens = store.resetTokens.filter(t => t.tokenHash !== crypto.createHash('sha256').update(String(token)).digest('hex') && t.token !== token);
        saveDb();
        return { success: true };
    }
};

const SEED_ARTICLES = [
    {
        id: "art-01",
        slug: "zero-copy-serialization-java-21",
        title: "Zero-Copy Serialization & Memory Invariants in High-Throughput Java 21",
        category: "SYSTEMS & RUNTIMES",
        date: "MAR 28, 2026",
        author: "Staff Systems Engineer",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
        tags: ["Java 21", "Memory Layout", "Performance", "Off-Heap"],
        excerpt: "How modern high-frequency financial engines leverage Java Foreign Function & Memory API to bypass GC overhead.",
        content: `### Architectural Background\n\nHigh-throughput backend architectures operating in the sub-millisecond realm cannot afford unpredictable Stop-The-World (STW) garbage collection pauses. Traditional Java serialization creates excessive intermediate heap allocations, inflating generational GC pressure.\n\n### The Foreign Function & Memory (FFM) Revolution\n\nJava 21 finalized JEP 454 (Foreign Function & Memory API), giving developers safe off-heap native memory allocation via \`Arena\` and \`MemorySegment\`.\n\n\`\`\`java\ntry (Arena arena = Arena.ofConfined()) {\n    MemorySegment segment = arena.allocate(1024 * 1024);\n    segment.set(ValueLayout.JAVA_INT, 0, 0xCAFEBABE);\n    // Zero-copy direct DMA transfer to native ring buffers\n}\n\`\`\`\n\n### Invariant Guarantees\n\n1. **Deterministic Lifecycles**: Memory is freed immediately upon exiting the arena block.\n2. **Spatial Safety**: Out-of-bounds reads throw immediate runtime exceptions rather than causing silent memory corruption.\n3. **Cache-Line Alignment**: Struct layouts align with 64-byte L1 data cache lines, eliminating false sharing across worker threads.`
    },
    {
        id: "art-02",
        slug: "monotonic-deques-sliding-window",
        title: "Why Monotonic Deques Beat Heaps in Real-Time Sliding Window Problems",
        category: "ALGORITHMS & DSA",
        date: "MAR 25, 2026",
        author: "Competitive Programming Lead",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
        tags: ["Sliding Window", "Monotonic Deque", "O(N) Complexity", "DSA"],
        excerpt: "A rigorous mathematical breakdown of amortized O(1) queue invariants for sliding maximum and minimum problems.",
        content: `### The Problem Pattern\n\nGiven an array of size $N$ and a moving window of size $K$, find the extreme value (min/max) at each step. Beginners reach for a \`PriorityQueue\` / Max-Heap, resulting in $O(N \\log K)$ runtime.\n\n### The Amortized O(1) Invariant\n\nA monotonic deque maintains elements in strictly decreasing order. When a new element enters at index $i$:\n\n1. We pop all elements from the back of the deque that are $\\le nums[i]$.\n2. We push index $i$ onto the back.\n3. We evict the front index if it has fallen outside the window $[i - K + 1, i]$.\n\nBecause each index enters and exits the deque at most once, the total operations across the entire array is bounded by $2N$, delivering strictly $O(N)$ runtime.`
    },
    {
        id: "art-03",
        slug: "amazon-bar-raiser-star-framework",
        title: "Deconstructing the Amazon Bar Raiser: How STAR Stories Get Scored",
        category: "LEADERSHIP & BEHAVIORAL",
        date: "MAR 22, 2026",
        author: "Former Principal Bar Raiser",
        readTime: "11 min read",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
        tags: ["STAR Method", "Behavioral", "Amazon LP", "Evaluation Rubric"],
        excerpt: "The exact 4-dimensional scoring matrix used behind closed doors to decide SDE-1 and SDE-2 hire recommendations.",
        content: `### The Bar Raiser Mandate\n\nThe Bar Raiser has a single objective: ensure the candidate raises the bar of the current team in at least 50% of the evaluated Leadership Principles.\n\n### The 4-Dimension Rubric\n\n1. **Scope & Ownership (40%)**: Did you personally drive the architectural decision, or did you merely follow a senior engineer's ticket?\n2. **Metric Grounding (30%)**: Was the outcome measured in quantified business terms (e.g., 'reduced p99 latency from 450ms to 85ms across 12M RPM')?\n3. **Frugality & Trade-offs (15%)**: What alternatives were rejected and why?\n4. **Deliver Results under Ambiguity (15%)**: How did you handle incomplete requirements or failing third-party dependencies?`
    },
    {
        id: "art-04",
        slug: "postgresql-btree-vs-lsm-trees",
        title: "PostgreSQL B-Tree vs LSM Trees: What Staff Engineers Expect in System Design",
        category: "SYSTEM ARCHITECTURE",
        date: "MAR 19, 2026",
        author: "Distributed Systems Architect",
        readTime: "9 min read",
        image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
        tags: ["PostgreSQL", "LSM-Tree", "B+Tree", "System Design"],
        excerpt: "Write amplification vs read amplification: selecting storage engine primitives under extreme transactional scale.",
        content: `### The Storage Engine Dilemma\n\nWhen designing a high-scale ingest system (e.g., Uber telemetry, financial order books), standard relational B-Trees incur random disk I/O for page updates.\n\n### Comparative Analysis\n\n| Attribute | B+ Tree (Postgres/InnoDB) | LSM Tree (RocksDB/Cassandra) |\n| :--- | :--- | :--- |\n| **Write Latency** | High (Random page updates) | Minimal (Sequential append to MemTable/WAL) |\n| **Read Latency** | Ultra-Fast (Single traversal) | Moderate (Bloom filters + Multi-SSTable merge) |\n| **Write Amplification** | 10x - 40x | 5x - 15x (Compaction overhead) |\n| **Space Amplification** | Low (In-place fragmentation) | Periodic (Transient during compactions) |`
    },
    {
        id: "art-05",
        slug: "mastering-two-pointer-invariants",
        title: "Mastering the Two-Pointer Invariant: From LeetCode Medium to Hard",
        category: "ALGORITHMS & DSA",
        date: "MAR 15, 2026",
        author: "Algorithms Specialist",
        readTime: "7 min read",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop",
        tags: ["Two Pointers", "Invariants", "Array Manipulation", "Proof"],
        excerpt: "How to formulate mathematical loop invariants so your two-pointer logic is provably bug-free before typing code.",
        content: `### The Logic of Loop Invariants\n\nA loop invariant is a formal predicate that holds true before and after each iteration. For two-pointer problems (e.g., Trapping Rain Water, 3Sum, Container With Most Water), formulating the invariant eliminates off-by-one errors completely.\n\n### The Invariant Recipe\n\n1. **Initialization**: State what is guaranteed before entering the loop (e.g., $left = 0, right = n-1$).\n2. **Maintenance**: Prove that moving the pointer with the smaller boundary never misses a strictly larger volume candidate.\n3. **Termination**: When $left \\ge right$, all potential candidates have been exhaustively tested.`
    },
    {
        id: "art-06",
        slug: "google-coding-round-algorithmic-entropy",
        title: "How Google Evaluates Go/No-Go on Coding Round Algorithmic Entropy",
        category: "INTERVIEW TELEMETRY",
        date: "MAR 12, 2026",
        author: "Staff Software Engineer",
        readTime: "10 min read",
        image: "https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=800&auto=format&fit=crop",
        tags: ["Google SDE", "Algorithmic Entropy", "Edge Cases", "Coding Rubric"],
        excerpt: "Why brute-force and disorganized code structure immediately triggers a 'Leaning No Hire' signal in Tier-1 calibrators.",
        content: `### What is Algorithmic Entropy?\n\nInterviewers measure how cleanly a candidate transitions from mathematical formulation to working, production-grade code. High entropy manifests as frequent backtracking, unhandled null pointers, and patching logic after test cases fail.\n\n### The 4 Stages of a Google Coding Round\n\n1. **Clarification & Constraints (5 mins)**: Types, volume, memory bounds, expected response.\n2. **High-Level Design & Complexity Proof (10 mins)**: State space, optimal algorithmic family, big-O proof.\n3. **Implementation with Modularity (20 mins)**: Separation of concerns, clear helper functions.\n4. **Dry Run with Edge Cases (10 mins)**: Empty arrays, duplicate keys, maximum integer overflow.`
    },
    {
        id: "art-07",
        slug: "virtual-threads-vs-reactive-concurrency",
        title: "Virtual Threads vs Reactive Streams: Concurrency Benchmarks in 2025",
        category: "SYSTEMS & RUNTIMES",
        date: "MAR 08, 2026",
        author: "Backend Lead",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=800&auto=format&fit=crop",
        tags: ["Project Loom", "WebFlux", "Virtual Threads", "Throughput"],
        excerpt: "Real-world load testing 100,000 concurrent sockets: throughput, p99 latency, and carrier thread pinning risks.",
        content: `### Synchronous Simplicity vs Reactive Complexity\n\nFor years, Reactive Programming (Spring WebFlux, RxJava) was necessary to achieve high concurrency on JVM by avoiding OS thread context-switching overhead. Project Loom changed this with Virtual Threads.\n\n### When to Beware of Carrier Thread Pinning\n\nVirtual threads unmount from carrier OS threads during blocking I/O (\`Socket.read()\`, \`Thread.sleep()\`). However, carrier threads remain **pinned** if blocking occurs inside:\n\n1. \`synchronized\` blocks or methods (Use \`ReentrantLock\` instead).\n2. Native JNI calls.\n\nMigrating away from legacy \`synchronized\` locks unlocks massive scale.`
    },
    {
        id: "art-08",
        slug: "tier2-speed-aptitude-strategy",
        title: "TCS Prime vs Infosys Specialist: The Definitive Tier-2 Speed Strategy",
        category: "CAREER & STRATEGY",
        date: "MAR 03, 2026",
        author: "Placement Director",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop",
        tags: ["TCS Prime", "Infosys DSE", "Quantitative Speed", "Strategy"],
        excerpt: "The high-yield playbook for breaking out of standard mass-recruitment bands into prime 9-14 LPA package tiers.",
        content: `### The Mass vs Prime Bifurcation\n\nMass drives filter candidates through basic aptitude. Prime and Specialist tracks introduce advanced algorithmic coding (Graphs, DP) and rigorous CS fundamentals (Transactions, ACID, OS Paging).\n\n### The High-Yield Strategy\n\n1. **Aptitude Floor**: Clear quantitative speed cutoff with 90%+ accuracy in first 25 minutes.\n2. **Coding Section**: Solve Problem 1 completely in under 20 minutes to bank time for the harder DP question.\n3. **Core CS Invariants**: Be ready to explain relational indexing, normal forms, and process scheduling.`
    },
    {
        id: "art-09",
        slug: "60-day-placement-sprint-roadmap",
        title: "The 60-Day Placement Sprint: Week-by-Week Roadmap for SDE-1 Offers",
        category: "ROADMAPS",
        date: "FEB 26, 2026",
        author: "InterviewX Engineering Team",
        readTime: "12 min read",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop",
        tags: ["60-Day Sprint", "SDE-1", "DSA Roadmap", "Fullstack"],
        excerpt: "Day 1 to 60 day-by-day progression: balancing DSA problem depth, core CS memory drills, and mock interview frequency.",
        content: `### The 4 Phases of Placement Velocity\n\n- **Weeks 1-3: Core Data Structures**: Arrays, HashMaps, Two Pointers, Sliding Window, LinkedLists, Binary Search, Trees, and Recursion.\n- **Weeks 4-5: Advanced Algorithms**: Graphs (BFS/DFS, Dijkstra), Dynamic Programming (1D, 2D, Knapsack), Heaps, and Trie.\n- **Weeks 6-7: CS Core Invariants & System Design**: DBMS (Indexing, Normalization), OS (Threads, Virtual Memory), Networks (TCP/IP, HTTP/3), and LLD (SOLID principles).\n- **Week 8: Mock Interview Pressure**: Daily timed voice mock interviews, resume defense, and behavioral STAR stories.`
    }
];

initDb();

module.exports = db;

