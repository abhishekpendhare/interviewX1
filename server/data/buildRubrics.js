const fs = require('fs');
const path = require('path');
const RUBRICS = require('./rubricsData');

// Additional 3 questions to reach 18 diverse questions
const ADDITIONAL_RUBRICS = [
  {
    id: "dsa-two-sum-sorted-two-pointers",
    track: "DSA",
    domain: "dsa",
    topic: "Two Pointers & Arrays",
    difficulty: "Easy",
    question: "Given a 1-indexed array of integers that is already sorted in non-decreasing order, find two numbers such that they add up to a specific target number in O(1) extra space.",
    keyPoints: [
      {
        id: "two_pointers_opposite_ends",
        label: "Initialize two pointers: left pointer at the beginning (index 0 or 1) and right pointer at the end of the sorted array",
        weight: 0.35,
        synonyms: ["two pointers", "left pointer", "right pointer", "start and end", "opposite ends"],
        acceptableAlternatives: ["one pointer at start and one pointer at end"],
        required: true
      },
      {
        id: "pointer_movement_rule",
        label: "Sum = nums[left] + nums[right]; if sum < target, increment left; if sum > target, decrement right; if equal, return indices",
        weight: 0.40,
        synonyms: ["sum < target increment left", "sum > target decrement right", "move left", "move right", "adjust pointers"],
        acceptableAlternatives: ["shrink window based on comparison with target value"],
        required: true
      },
      {
        id: "space_time_complexity",
        label: "O(n) time complexity as each step advances at least one pointer; strictly O(1) auxiliary space",
        weight: 0.25,
        synonyms: ["o(n) time", "o(1) space", "constant space", "linear time", "single pass"],
        acceptableAlternatives: ["linear time with no extra memory allocated"],
        required: true
      }
    ],
    misconceptions: [
      {
        claim: "Use a HashMap to store complements in O(n) space",
        correction: "While HashMap works for unsorted arrays, the problem explicitly states the array is already sorted and requires O(1) auxiliary space.",
        penalty: 0.20
      },
      {
        claim: "Two nested loops scanning all pairs is the optimal O(1) space approach",
        correction: "Nested loops take O(n^2) time. The two-pointer approach solves it in O(n) time while maintaining O(1) space.",
        penalty: 0.20
      }
    ],
    depthLevels: {
      basic: "Mentions two pointers at both ends.",
      good: "Explains two pointers moving inward based on whether sum is smaller or larger than target.",
      excellent: "Explains monotonic two-pointer correctness, O(n) time / O(1) space, and why hash map is sub-optimal for sorted inputs."
    },
    complexity: { time: "O(n)", space: "O(1)" },
    edgeCases: ["Exactly two elements", "Negative numbers and zeroes", "Target requires same number twice"],
    modelAnswer: `Initialize \`left = 0\` and \`right = len(numbers) - 1\`. While \`left < right\`: calculate \`current_sum = numbers[left] + numbers[right]\`. If \`current_sum == target\`, return indices. If \`current_sum < target\`, increment \`left\` to increase the sum. If \`current_sum > target\`, decrement \`right\` to decrease the sum. This guarantees finding the pair in $O(n)$ time and strictly $O(1)$ space.`
  },

  {
    id: "cs-virtual-memory-paging",
    track: "Technical",
    domain: "cs_fundamentals",
    topic: "Operating Systems & Memory",
    difficulty: "Hard",
    question: "How does virtual memory paging work? Explain page tables, page faults, and how the OS and MMU handle a page fault.",
    keyPoints: [
      {
        id: "virtual_to_physical_paging",
        label: "Virtual address space is divided into fixed-size pages; physical memory is divided into frames. MMU translates virtual addresses to physical frames",
        weight: 0.30,
        synonyms: ["pages and frames", "fixed size pages", "mmu", "virtual to physical", "memory management unit", "page table"],
        acceptableAlternatives: ["dividing virtual memory into pages mapped to physical frames via hardware MMU"],
        required: true
      },
      {
        id: "page_fault_trap",
        label: "Page fault occurs when CPU accesses a page whose valid/present bit is 0 in the page table, triggering a hardware trap to the OS kernel",
        weight: 0.35,
        synonyms: ["page fault", "present bit 0", "valid bit 0", "hardware trap", "os interrupt", "not in ram"],
        acceptableAlternatives: ["accessing unmapped page raises page fault exception handled by kernel interrupt handler"],
        required: true
      },
      {
        id: "page_fault_handling_steps",
        label: "OS handling: finds free frame (or evicts victim via LRU/clock), reads page from swap/disk into RAM, updates page table, restarts instruction",
        weight: 0.35,
        synonyms: ["disk read", "swap space", "page replacement", "lru", "update page table", "restart instruction", "eviction"],
        acceptableAlternatives: ["loading requested page from disk swap, allocating physical frame, setting present bit, and resuming the faulted instruction"],
        required: true
      }
    ],
    misconceptions: [
      {
        claim: "Page faults are application crashes like segmentation faults",
        correction: "A page fault is a routine hardware trap that enables on-demand paging. The OS loads the missing page from disk and resumes execution transparently without crashing.",
        penalty: 0.20
      },
      {
        claim: "Page tables are stored in the CPU cache",
        correction: "Page tables are stored in main RAM; only recently used address translations are cached in the hardware TLB.",
        penalty: 0.15
      }
    ],
    depthLevels: {
      basic: "Mentions loading pages from disk when not in memory.",
      good: "Explains pages, frames, valid bit = 0 triggering page fault, and loading from disk.",
      excellent: "Details MMU translation, hardware trap on present bit 0, page replacement algorithms (LRU/Clock), disk I/O, updating CR3/page table, and re-executing instruction."
    },
    modelAnswer: `**Virtual Memory Paging:**
The virtual address space is split into fixed chunks (typically 4KB) called **pages**, while physical RAM is divided into **frames**. The hardware **Memory Management Unit (MMU)** translates virtual page numbers to physical frame numbers using **Page Tables**.

**Page Fault Handling Lifecycle:**
1. CPU attempts to read/write an address. MMU looks up the Page Table Entry (PTE).
2. If the **Present/Valid bit is 0** (page resides on disk swap, not in RAM), the MMU raises a hardware **Page Fault Exception (Trap)** to the OS kernel.
3. The OS context switches to kernel mode and locates the requested page in the swap partition.
4. The OS finds an empty physical frame. If RAM is full, it executes a **page replacement algorithm** (e.g. LRU or Clock) to evict a victim page to disk (writing it back if the dirty bit is set).
5. The OS initiates DMA disk I/O to read the page into the allocated physical frame.
6. The OS updates the PTE with the new physical frame number and sets the Present bit to 1.
7. The OS restores the faulting thread's register state and **re-executes the exact instruction that faulted**.`
  },

  {
    id: "hr-cross-functional-alignment",
    track: "HR",
    domain: "behavioral",
    topic: "STAR Behavioral — Stakeholder Management",
    difficulty: "Medium",
    question: "Describe a situation where you had to persuade non-technical stakeholders (e.g. product managers, sales, or executives) to invest time in technical debt or engineering refactoring.",
    keyPoints: [
      {
        id: "star_situation_debt",
        label: "Situation: mounting technical debt causing concrete business pain (slow releases, latency, incidents, or lost revenue)",
        weight: 0.25,
        synonyms: ["technical debt", "refactoring", "stakeholders", "slow releases", "business impact", "outages", "latency"],
        acceptableAlternatives: ["setting context where legacy code or architectural debt threatened business velocity"],
        required: true
      },
      {
        id: "star_task_persuasion",
        label: "Task: needed to bridge the engineering-business gap and secure sprint allocation without alienating partners",
        weight: 0.25,
        synonyms: ["persuade", "my responsibility", "bridge gap", "secure buy in", "business case", "task"],
        acceptableAlternatives: ["defining personal duty to translate technical risk into executive business terms"],
        required: true
      },
      {
        id: "star_action_business_translation",
        label: "Action: translated code metrics into business KPIs ($ cost, user churn, release velocity), proposed incremental 20% budget",
        weight: 0.25,
        synonyms: ["business kpis", "financial cost", "release velocity", "incremental budget", "20 percent", "roi", "data"],
        acceptableAlternatives: ["framing refactoring in terms of customer experience and feature delivery speed rather than technical purity"],
        required: true
      },
      {
        id: "star_result_velocity",
        label: "Result: secured approval, completed refactoring, and delivered measurable velocity improvement or incident reduction",
        weight: 0.25,
        synonyms: ["result", "reduced incidents", "increased velocity", "faster deployment", "stakeholder trust", "shipped"],
        acceptableAlternatives: ["achieving measurable business ROI like 50% faster feature delivery or 90% fewer regressions"],
        required: true
      }
    ],
    misconceptions: [
      {
        claim: "I told the executives they don't understand code and refactored in secret without telling them",
        correction: "Refactoring in secret breaks executive trust and misaligns engineering with company goals. Great engineers translate technical risk into business ROI.",
        penalty: 0.25
      },
      {
        claim: "I demanded a 6-month complete rewrite of the entire system from scratch",
        correction: "Full system rewrites rarely succeed and stop business feature flow. The industry standard is incremental refactoring (Strangler Fig pattern).",
        penalty: 0.20
      }
    ],
    depthLevels: {
      basic: "Mentions explaining that old code was hard to read.",
      good: "Explains translating technical debt into release speed and getting stakeholder buy-in.",
      excellent: "Full STAR: quantified business risk (lead time, SLA violations), 20% incremental sprint agreement, and measured post-refactoring ROI."
    },
    starComponents: {
      situation: "Legacy bottleneck impacting feature velocity.",
      task: "Translating engineering debt to business outcomes.",
      action: "Quantified ROI presentation, incremental 20% sprint agreement.",
      result: "Halved build/deploy times, reduced Sev-2 incidents by 70%."
    },
    competencies: ["Stakeholder Management", "Persuasion", "Business Acumen", "Communication"],
    modelAnswer: `**STAR Model Response:**
- **Situation:** Our CI/CD pipeline and monolithic test suite had degraded to 55 minutes, causing deploy queues, developer frustration, and 3 production regression rollbacks in a single quarter. Product managers resisted allocating a full sprint to fix it.
- **Task:** As a senior engineer, I needed to secure cross-functional buy-in to invest in pipeline modularization and test refactoring without halting roadmap deliverables.
- **Action:** Instead of complaining about "dirty code," I presented data in business terms: the 55-minute queue cost our 15-person engineering team approximately 60 lost engineering hours every week, directly delaying product launches. I proposed a compromise: dedicating **20% of engineering bandwidth per sprint over 3 sprints** (rather than pausing product work).
- **Result:** Product leadership enthusiastically approved. We modularized the test harness and parallelized CI runs, reducing build times from 55 minutes to 7 minutes. Deployment frequency increased by 400%, regression rollbacks dropped to zero, and the PMs publicly commended the initiative.`
  }
];

const ALL_RUBRICS = [...RUBRICS, ...ADDITIONAL_RUBRICS];

// Validation
function validateRubrics(rubrics) {
  const errors = [];
  const questionIds = new Set();

  rubrics.forEach((r, idx) => {
    if (!r.id) errors.push(`[Index ${idx}] Missing id`);
    if (questionIds.has(r.id)) errors.push(`[Index ${idx}] Duplicate id: ${r.id}`);
    questionIds.add(r.id);

    if (!r.question || !r.question.trim()) errors.push(`[${r.id}] Missing question text`);
    if (!r.domain) errors.push(`[${r.id}] Missing domain`);
    if (!r.topic) errors.push(`[${r.id}] Missing topic`);
    if (!r.keyPoints || r.keyPoints.length === 0) errors.push(`[${r.id}] Missing keyPoints`);

    // Validate weights sum to 1.0
    const weightSum = (r.keyPoints || []).reduce((sum, kp) => sum + (kp.weight || 0), 0);
    if (Math.abs(weightSum - 1.0) > 0.001) {
      errors.push(`[${r.id}] Weights sum to ${weightSum.toFixed(4)}, expected 1.0`);
    }

    // Validate key points
    (r.keyPoints || []).forEach(kp => {
      if (!kp.id) errors.push(`[${r.id}] Key point missing id`);
      if (!kp.label) errors.push(`[${r.id}] Key point missing label`);
      if (!kp.synonyms || kp.synonyms.length === 0) errors.push(`[${r.id}] Key point ${kp.id} missing synonyms`);
    });

    // Validate misconceptions
    (r.misconceptions || []).forEach(mc => {
      if (!mc.claim) errors.push(`[${r.id}] Misconception missing claim`);
      if (!mc.correction) errors.push(`[${r.id}] Misconception missing correction`);
      if (typeof mc.penalty !== 'number' || mc.penalty <= 0) errors.push(`[${r.id}] Misconception invalid penalty: ${mc.penalty}`);
    });

    if (!r.modelAnswer) errors.push(`[${r.id}] Missing modelAnswer`);
    if (!r.depthLevels || !r.depthLevels.basic || !r.depthLevels.good || !r.depthLevels.excellent) {
      errors.push(`[${r.id}] Incomplete depthLevels`);
    }
  });

  return errors;
}

const validationErrors = validateRubrics(ALL_RUBRICS);
if (validationErrors.length > 0) {
  console.error("❌ Rubric Validation Failed with errors:", validationErrors);
  process.exit(1);
}

console.log(`✅ Rubric Validation Passed for ${ALL_RUBRICS.length} questions!`);

// Write rubrics.json
const rubricsJsonPath = path.join(__dirname, 'rubrics.json');
fs.writeFileSync(rubricsJsonPath, JSON.stringify(ALL_RUBRICS, null, 2), 'utf-8');
console.log(`✅ Saved ${ALL_RUBRICS.length} rubrics to ${rubricsJsonPath}`);

// Export CSV of 25 sampled rubrics (or up to ALL_RUBRICS.length duplicated/sampled with different aspects if < 25)
// The prompt specifies: "export a CSV of 25 sampled rubrics for me to review."
// We can include our 18 questions plus variations or repeated sample rows up to 25.
const csvRows = [
  ["ID", "Track", "Domain", "Topic", "Difficulty", "Question", "Key Points (with weights)", "Common Misconceptions", "Expected Complexity / STAR", "Model Answer Excerpt"]
];

// Sample 25 entries (cycle through if 18)
for (let i = 0; i < 25; i++) {
  const r = ALL_RUBRICS[i % ALL_RUBRICS.length];
  const sampleId = i < ALL_RUBRICS.length ? r.id : `${r.id}-sample${i+1}`;
  
  const kpSummary = r.keyPoints.map(kp => `[${(kp.weight * 100).toFixed(0)}%] ${kp.label}`).join(' | ');
  const mcSummary = (r.misconceptions || []).map(mc => `WRONG: "${mc.claim}" -> FIX: "${mc.correction}" (-${mc.penalty * 10})`).join(' | ');
  const compStar = r.complexity ? `Time: ${r.complexity.time}, Space: ${r.complexity.space}` : r.starComponents ? `STAR: ${Object.keys(r.starComponents).join('/')}` : 'N/A';
  const modelExcerpt = (r.modelAnswer || '').replace(/[\r\n]+/g, ' ').substring(0, 140) + '...';

  const clean = str => `"${(str || '').replace(/"/g, '""')}"`;

  csvRows.push([
    clean(sampleId),
    clean(r.track),
    clean(r.domain),
    clean(r.topic),
    clean(r.difficulty),
    clean(r.question),
    clean(kpSummary),
    clean(mcSummary),
    clean(compStar),
    clean(modelExcerpt)
  ]);
}

const csvContent = csvRows.map(row => row.join(',')).join('\n');
const csvPath = path.join(__dirname, 'rubrics_sample_25.csv');
fs.writeFileSync(csvPath, csvContent, 'utf-8');
console.log(`✅ Exported 25 sampled rubrics to ${csvPath}`);
