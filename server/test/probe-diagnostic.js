/**
 * Phase 0 Diagnostic Probes
 * Evaluates 12 probe answers across 4 question domains:
 * 1. Technical (HashMap Collisions)
 * 2. DSA Verbal (Floyd's Cycle Finding)
 * 3. CS Fundamentals (Process vs Thread)
 * 4. Behavioral (Conflict Resolution STAR)
 *
 * Each question has:
 * - Probe A: Excellent
 * - Probe B: Partial
 * - Probe C: Wrong / Flawed (including long verbosity probe)
 */

const MockInterviewer = require('../agent/mockInterviewer');

const PROBES = [
  // 1. TECHNICAL: HashMap
  {
    domain: "Technical",
    bankKey: "Technical",
    questionIndex: 0,
    expectedMarks: { excellent: 9.5, partial: 5.5, wrong: 2.0 },
    probes: [
      {
        level: "excellent",
        label: "Technical - HashMap (Excellent)",
        answer: `A HashMap handles collisions using separate chaining where array indices hold linked lists of entries. When the number of elements exceeds the load factor threshold, which defaults to 0.75, rehashing is triggered: the internal array doubles in capacity in amortized O(n) time and redistributes all keys. In Java 8+, if a single bucket chain exceeds 8 nodes, it treeifies into a balanced Red-Black tree to guarantee O(log n) worst-case lookup rather than O(n).`
      },
      {
        level: "partial",
        label: "Technical - HashMap (Partial)",
        answer: `HashMap handles collisions using separate chaining where each bucket has a linked list. It has a load factor of 0.75 which resizes the table when full.`
      },
      {
        level: "wrong",
        label: "Technical - HashMap (Wrong with High Verbosity)",
        answer: `HashMap uses binary search trees by default for every bucket right from the start. The load factor is not important and does not resize automatically. However, for instance, we can consider worst case scenarios where O(n) operations happen. Furthermore, step 1 is looking at null keys, step 2 is checking failure modes, and additionally we examine corner cases and overflow with high verbosity to make this answer very long and detailed.`
      }
    ]
  },

  // 2. DSA VERBAL: Floyd's Cycle Detection
  {
    domain: "DSA Verbal",
    bankKey: "DSA",
    questionIndex: 1,
    expectedMarks: { excellent: 9.5, partial: 5.5, wrong: 2.0 },
    probes: [
      {
        level: "excellent",
        label: "DSA - Floyd Cycle (Excellent)",
        answer: `To detect a cycle in a singly linked list, we use Floyd's tortoise and hare algorithm with a slow pointer moving one step and a fast pointer moving two steps. If fast reaches null, no cycle exists. If they meet inside the cycle, we reset the slow pointer to the head and advance both pointers one step at a time. The point where they meet again is the cycle start. The mathematical proof shows that if head-to-start is distance L, cycle length is C, and meeting distance from start is k, then 2(L + k) - (L + k) = nC, so L = nC - k. This runs in O(n) time and O(1) auxiliary space without a visited hash set.`
      },
      {
        level: "partial",
        label: "DSA - Floyd Cycle (Partial)",
        answer: `We use two pointers, fast and slow. Slow moves one step and fast moves two steps. If they meet, there is a cycle. If fast hits null, there is no cycle. It takes O(n) time and O(1) space.`
      },
      {
        level: "wrong",
        label: "DSA - Floyd Cycle (Wrong)",
        answer: `To detect a cycle, the meeting point of fast and slow pointers is always the cycle start directly. Also, the standard and only optimal interview approach is to use a visited HashSet to detect cycles by storing node references in memory.`
      }
    ]
  },

  // 3. CS FUNDAMENTALS: Process vs Thread
  {
    domain: "CS Fundamentals",
    bankKey: "Technical",
    questionIndex: 2,
    expectedMarks: { excellent: 9.5, partial: 5.5, wrong: 2.0 },
    probes: [
      {
        level: "excellent",
        label: "CS Fundamentals - Process vs Thread (Excellent)",
        answer: `A process has its own isolated virtual address space, page tables, file descriptors, and PID, whereas threads within the same process share the virtual memory address space, heap, and open files, each having only their own stack and register set. Context switching overhead differs dramatically because a process context switch requires changing page tables and flushes the TLB, causing significant CPU cache misses. In contrast, a thread context switch preserves the TLB because the address space is shared, making it much cheaper and lightweight.`
      },
      {
        level: "partial",
        label: "CS Fundamentals - Process vs Thread (Partial)",
        answer: `A process is an executing program with isolated address space and heap, while threads share the address space of the process. Switching threads is cheaper than switching processes because threads share memory.`
      },
      {
        level: "wrong",
        label: "CS Fundamentals - Process vs Thread (Wrong with Jargon)",
        answer: `Threads have their own separate heap memory from the parent process. A process context switch is only slightly more expensive than a thread switch, with negligible difference. However, for example, worst case failure modes in O(1) can happen, step 1 is fork, step 2 is pthread, furthermore amortized tradeoffs exist.`
      }
    ]
  },

  // 4. BEHAVIORAL: Conflict Resolution (STAR)
  {
    domain: "Behavioral",
    bankKey: "HR",
    questionIndex: 0,
    expectedMarks: { excellent: 9.5, partial: 5.5, wrong: 2.0 },
    probes: [
      {
        level: "excellent",
        label: "Behavioral - Conflict Resolution (Excellent STAR)",
        answer: `In my previous project, we were building a high-throughput payments service and had a serious disagreement on database architecture: my teammate advocated for MongoDB while I argued for PostgreSQL with ACID guarantees. As the backend lead responsible for transaction integrity, my task was to resolve the dispute without slipping the deadline. For my action, rather than debating opinions, I built a benchmark script with prototype tests measuring 50,000 concurrent transactions under network latency. I actively listened to their need for document flexibility and proposed using PostgreSQL JSONB columns. As a result, we aligned on PostgreSQL with JSONB, shipped the service on schedule, and had zero financial reconciliation discrepancies in production.`
      },
      {
        level: "partial",
        label: "Behavioral - Conflict Resolution (Partial)",
        answer: `I was working on a project where my teammate and I disagreed on whether to use React or Vue. My role was frontend developer. I listened to their perspective, we discussed the pros and cons, and we decided to use React. The result was that we finished the project successfully.`
      },
      {
        level: "wrong",
        label: "Behavioral - Conflict Resolution (Wrong / Anti-pattern)",
        answer: `Whenever there is a disagreement with a teammate, I escalated to my manager immediately so they could tell the other person what to do. Alternatively, I just let them do it their way to avoid conflict, because arguing is a waste of time.`
      }
    ]
  }
];

function runDiagnostic() {
  console.log("================================================================================");
  console.log("PHASE 0: DIAGNOSTIC PROBE SUITE - CURRENT PIPELINE EVALUATION");
  console.log("================================================================================\n");

  const results = [];

  for (const group of PROBES) {
    const bank = MockInterviewer.INTERVIEW_BANKS[group.bankKey];
    const qObj = bank[group.questionIndex];
    console.log(`\n================================================================================`);
    console.log(`DOMAIN: ${group.domain}`);
    console.log(`QUESTION: "${qObj.q}"`);
    console.log(`================================================================================`);

    for (const probe of group.probes) {
      const evalResult = MockInterviewer.evaluateAgainstRubric(probe.answer, qObj.rubric);
      
      console.log(`\n--- [PROBE: ${probe.label}] ---`);
      console.log(`Word Count:      ${evalResult.wordCount}`);
      console.log(`Overall Score:   ${evalResult.overallScore} / 100  (equiv: ${(evalResult.overallScore / 10).toFixed(1)} / 10)`);
      console.log(`Dimensions:      Correctness: ${evalResult.dimensions.correctness}, Completeness: ${evalResult.dimensions.completeness}, Clarity: ${evalResult.dimensions.clarity}, EdgeCase: ${evalResult.dimensions.edgeCaseDepth}`);
      console.log(`Incorrect Claims Detected: ${evalResult.incorrectClaims.length}`);
      if (evalResult.incorrectClaims.length > 0) {
        evalResult.incorrectClaims.forEach(ic => console.log(`   - Detected: "${ic.claim}"`));
      }
      console.log(`Missing Critical: ${evalResult.missingCritical.length}`);
      if (evalResult.missingCritical.length > 0) {
        evalResult.missingCritical.forEach(mc => console.log(`   - Missed: "${mc.label}"`));
      }
      console.log(`Feedback Lines:`);
      evalResult.feedbackLines.forEach(fl => console.log(`   • ${fl}`));

      results.push({
        group: group.domain,
        level: probe.level,
        label: probe.label,
        wordCount: evalResult.wordCount,
        score100: evalResult.overallScore,
        score10: (evalResult.overallScore / 10).toFixed(1),
        incorrectCount: evalResult.incorrectClaims.length,
        missingCount: evalResult.missingCritical.length,
        verdict: evalResult.verdict,
        evalResult
      });
    }
  }

  // Check Inversions and Flaws
  console.log("\n\n================================================================================");
  console.log("DIAGNOSTIC SUMMARY & FLAW ANALYSIS");
  console.log("================================================================================");

  let inversionsFound = 0;
  for (const group of PROBES) {
    const groupResults = results.filter(r => r.group === group.domain);
    const excellent = groupResults.find(r => r.level === 'excellent');
    const partial = groupResults.find(r => r.level === 'partial');
    const wrong = groupResults.find(r => r.level === 'wrong');

    console.log(`\n${group.domain}:`);
    console.log(`  Excellent: ${excellent.score10} / 10`);
    console.log(`  Partial:   ${partial.score10} / 10`);
    console.log(`  Wrong:     ${wrong.score10} / 10`);

    if (parseFloat(wrong.score10) >= parseFloat(partial.score10)) {
      console.log(`  ❌ INVERSION DETECTED: Wrong (${wrong.score10}) scored >= Partial (${partial.score10})!`);
      inversionsFound++;
    }
    if (parseFloat(wrong.score10) >= parseFloat(excellent.score10)) {
      console.log(`  ❌ INVERSION DETECTED: Wrong (${wrong.score10}) scored >= Excellent (${excellent.score10})!`);
      inversionsFound++;
    }
  }

  // Legacy fallback test
  const legacyEval = MockInterviewer._legacyEvaluate("Any random sentence here", []);
  console.log(`\nLegacy Fallback Test (no rubric):`);
  console.log(`  Overall Score: ${legacyEval.overallScore} / 100`);
  console.log(`  Fixed scores returned: ${JSON.stringify(legacyEval.dimensions)}`);

  return { results, inversionsFound };
}

runDiagnostic();
