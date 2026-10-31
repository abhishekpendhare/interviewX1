// server/testMockEvaluation.js - Comprehensive test of Mock Interview Evaluation
const BASE_URL = 'http://localhost:3000/api';

async function postJson(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

async function runMockEvaluationTest() {
  console.log('====================================================');
  console.log('🧪 RUNNING MOCK INTERVIEW MULTI-TRACK EVALUATION TEST');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Technical Track - HashMap
    // ----------------------------------------------------
    const start1 = await postJson('/simulator/start', {
      track: 'Technical',
      persona: 'Staff SDE & Bar Raiser'
    });
    console.log(`[+] Track: Technical | Session: ${start1.sessionId}`);
    console.log(`[+] Question: "${start1.prompt}"`);
    console.log('----------------------------------------------------');

    // Case 1A: Strong Answer
    console.log('📝 CASE 1: SUBMITTING STRONG TECHNICAL ANSWER (HashMap Collisions)');
    const strongHashMap = `A HashMap handles collisions primarily via separate chaining, where each array index points to a linked list bucket of entries that hash to the same index. 
When the total number of entries exceeds the capacity multiplied by the load factor threshold (which defaults to 0.75 in Java), rehashing is triggered. During rehashing, the internal table doubles in capacity (O(n) amortized operation) and elements are redistributed. 
Furthermore, in Java 8+, when a single bucket chain exceeds 8 nodes, it treeifies into a balanced Red-Black tree (TreeBin) to guarantee O(log n) worst-case lookup instead of O(n) degenerate linked lists.`;

    const res1A = await postJson('/simulator/respond', {
      sessionId: start1.sessionId,
      responseText: strongHashMap
    });

    const eval1A = res1A.evaluation;
    console.log(`[+] Score: ${eval1A.overallScore}/100 | Verdict: ${eval1A.verdict}`);
    console.log(`[+] Dimensions:`, eval1A.dimensions);
    console.log(`[+] Feedback Lines:`, eval1A.feedbackLines);
    console.log(`[+] Follow-Up Generated: "${res1A.followUp}"`);
    console.log('----------------------------------------------------\n');

    // Case 1B: Weak Answer
    console.log('📝 CASE 2: SUBMITTING WEAK / SHALLOW ANSWER');
    const weakHashMap = `HashMap uses an array and a hash function. If two keys have same hash, it stores them in the list.`;

    const start2 = await postJson('/simulator/start', {
      track: 'Technical',
      persona: 'Staff SDE & Bar Raiser'
    });

    const res1B = await postJson('/simulator/respond', {
      sessionId: start2.sessionId,
      responseText: weakHashMap
    });

    const eval1B = res1B.evaluation;
    console.log(`[+] Score: ${eval1B.overallScore}/100 | Verdict: ${eval1B.verdict}`);
    console.log(`[+] Dimensions:`, eval1B.dimensions);
    console.log(`[+] Missing Critical:`, eval1B.missingCritical.map(m => m.label));
    console.log(`[+] Follow-Up Generated: "${res1B.followUp}"`);
    console.log('----------------------------------------------------\n');

    // Case 1C: Misconception Planted
    console.log('📝 CASE 3: SUBMITTING ANSWER WITH PLANTED MISCONCEPTION');
    const misconceptionHashMap = `HashMap handles collisions because HashMap uses binary search trees by default for every bucket slot. Also load factor is not important or does not resize automatically when full.`;

    const start3 = await postJson('/simulator/start', {
      track: 'Technical',
      persona: 'Staff SDE & Bar Raiser'
    });

    const res1C = await postJson('/simulator/respond', {
      sessionId: start3.sessionId,
      responseText: misconceptionHashMap
    });

    const eval1C = res1C.evaluation;
    console.log(`[+] Score: ${eval1C.overallScore}/100 | Verdict: ${eval1C.verdict}`);
    console.log(`[+] Incorrect Claims Caught:`, eval1C.incorrectClaims);
    console.log(`[+] Feedback Lines:`, eval1C.feedbackLines);
    console.log(`[+] Follow-Up Generated: "${res1C.followUp}"`);
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 4: JavaFoundation Track - ConcurrentHashMap
    // ----------------------------------------------------
    console.log('📝 CASE 4: SUBMITTING STRONG ANSWER FOR JAVA FOUNDATION TRACK');
    const startJava = await postJson('/simulator/start', {
      track: 'JavaFoundation',
      persona: 'Principal Java Architect'
    });
    console.log(`[+] Track: JavaFoundation | Question: "${startJava.prompt}"`);

    const strongJava = `In Java 8+, ConcurrentHashMap avoids locking the entire table through fine-grained bucket synchronization and lock-free CAS.
For an empty bucket, insertion uses lock free CAS (Compare-And-Swap) without acquiring locks.
When a hash collision occurs, a synchronized block is placed strictly on the head node of that specific bucket, allowing concurrent writes to all other buckets simultaneously.
Furthermore, read operations are completely lock free due to volatile memory visibility on node value and next pointers.
Additionally, when a bucket exceeds 8 nodes, it converts to balanced Red-Black trees guaranteeing O(log n) worst case lookup bounds instead of O(n) degenerate linked lists.
In contrast, legacy Hashtable and Collections.synchronizedMap lock the entire table with a single global monitor lock for every read and write.`;

    const resJava = await postJson('/simulator/respond', {
      sessionId: startJava.sessionId,
      responseText: strongJava
    });

    const evalJava = resJava.evaluation;
    console.log(`[+] Score: ${evalJava.overallScore}/100 | Verdict: ${evalJava.verdict}`);
    console.log(`[+] Dimensions:`, evalJava.dimensions);
    console.log(`[+] Feedback Lines:`, evalJava.feedbackLines);
    console.log(`[+] Follow-Up Generated: "${resJava.followUp}"`);
    console.log('----------------------------------------------------\n');

    // ----------------------------------------------------
    // TEST 5: SpringBoot Track - N+1 Select Problem
    // ----------------------------------------------------
    console.log('📝 CASE 5: SUBMITTING STRONG ANSWER FOR SPRING BOOT TRACK');
    const startSpring = await postJson('/simulator/start', {
      track: 'SpringBoot',
      persona: 'Enterprise Spring Architect'
    });
    console.log(`[+] Track: SpringBoot | Question: "${startSpring.prompt}"`);

    const strongSpring = `The N+1 query problem occurs when loading a parent entity with a @OneToMany association: 1 initial query loads N parent rows, and iterating through them fires N separate child SQL queries, resulting in O(N) database round-trip overhead and worst case latency spikes.
Notably, setting FetchType.EAGER does not solve or fix the problem for findAll() queries because JPQL executes the root SELECT query directly and then fires N subsequent child queries.
To properly fix it:
1. Use JPQL with 'JOIN FETCH' to load parents and children together in a single SQL query join.
2. Use Spring Data JPA '@EntityGraph(attributePaths = {"children"})' on repository methods.
3. Alternatively use Hibernate '@BatchSize' to fetch child collections in batched IN clauses.`;

    const resSpring = await postJson('/simulator/respond', {
      sessionId: startSpring.sessionId,
      responseText: strongSpring
    });

    const evalSpring = resSpring.evaluation;
    console.log(`[+] Score: ${evalSpring.overallScore}/100 | Verdict: ${evalSpring.verdict}`);
    console.log(`[+] Dimensions:`, evalSpring.dimensions);
    console.log(`[+] Feedback Lines:`, evalSpring.feedbackLines);
    console.log(`[+] Follow-Up Generated: "${resSpring.followUp}"`);
    console.log('----------------------------------------------------\n');

    // Verification Assertions
    if (eval1A.overallScore < 80) throw new Error(`Case 1A score ${eval1A.overallScore} is lower than hire threshold 80`);
    if (eval1B.overallScore > 60) throw new Error(`Case 1B score ${eval1B.overallScore} is higher than borderline threshold 60`);
    if (eval1C.incorrectClaims.length === 0) throw new Error('Case 1C failed to catch planted misconception');
    if (evalJava.overallScore < 80) throw new Error(`Java score ${evalJava.overallScore} is lower than hire threshold 80`);
    if (evalSpring.overallScore < 80) throw new Error(`Spring score ${evalSpring.overallScore} is lower than hire threshold 80`);

    console.log('🎉 ALL MOCK INTERVIEW EVALUATION TEST SUITES PASSED VERIFICATION WITH 100% SUCCESS!');

  } catch (err) {
    console.error('❌ Test Execution Failed:', err.message);
    process.exit(1);
  }
}

runMockEvaluationTest();
