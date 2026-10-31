/**
 * STRATA MockInterviewer Evaluation Verification Tests
 * 
 * Tests deliberately flawed answers against the rubric engine.
 * Each test plants a specific error or omission and verifies it is caught.
 */

const MockInterviewer = require('./agent/mockInterviewer');

function printResult(label, evalResult) {
    console.log('\n' + '='.repeat(72));
    console.log(`TEST: ${label}`);
    console.log('='.repeat(72));
    console.log(`Overall Score:   ${evalResult.overallScore}/100`);
    console.log(`Verdict:         ${evalResult.verdict}`);
    console.log('\nDimension Scores:');
    console.log(`  Correctness:    ${evalResult.dimensions.correctness}/100`);
    console.log(`  Completeness:   ${evalResult.dimensions.completeness}/100`);
    console.log(`  Clarity:        ${evalResult.dimensions.clarity}/100`);
    console.log(`  Edge-Case Depth: ${evalResult.dimensions.edgeCaseDepth}/100`);

    console.log('\nFeedback Lines (specific, actionable):');
    evalResult.feedbackLines.forEach(line => console.log('  ' + line));

    if (evalResult.incorrectClaims.length > 0) {
        console.log('\n❌ Incorrect Claims Detected:');
        evalResult.incorrectClaims.forEach(ic => {
            console.log(`  CLAIM: "${ic.claim}"`);
            console.log(`  FIX:   "${ic.correction}"`);
        });
    }

    if (evalResult.missingCritical.length > 0) {
        console.log('\n⚠️  Missing Critical Points:');
        evalResult.missingCritical.forEach(p => console.log(`  • ${p.label}`));
    }

    console.log('\n--- MODEL ANSWER (shown to student) ---');
    console.log(evalResult.modelAnswer.substring(0, 350) + (evalResult.modelAnswer.length > 350 ? '...' : ''));
}

async function runTests() {
    console.log('\n🧪 STRATA MOCK INTERVIEW RUBRIC EVALUATION TESTS');
    console.log('Testing flawed, incomplete, and model answers across domains.\n');

    const bank = MockInterviewer.INTERVIEW_BANKS;
    const hashmapQ = bank.Technical[0];
    const dbmsQ = bank.DBMS[0];
    const dsaQ = bank.DSA[0];
    const hrQ = bank.HR[0];

    // ─────────────────────────────────────────────────────────────────────
    // TEST 1: Technical — DSA HashMap question
    // Planted flaw: claims open addressing without load factor or rehashing or treeification
    // ─────────────────────────────────────────────────────────────────────
    const test1Answer = `A HashMap uses open addressing for collision handling. When two keys hash to the same bucket, the HashMap just finds the next empty slot. The load factor is not important. When full, it never changes capacity or redistributes elements.`;

    const eval1 = MockInterviewer.evaluateAgainstRubric(test1Answer, hashmapQ.rubric);
    printResult('Technical (HashMap — missing rehashing, load factor, and treeification)', eval1);
    const test1Pass = eval1.missingCritical.some(p => p.id === 'treeify') && eval1.missingCritical.some(p => p.id === 'rehash') && eval1.overallScore < 70;

    // ─────────────────────────────────────────────────────────────────────
    // TEST 2: DBMS — B-Tree vs B+ Tree
    // Planted flaw: claims B+ Trees are faster for point lookups than B-Trees (incorrect)
    // ─────────────────────────────────────────────────────────────────────
    const test2Answer = `B+ Trees store data in every node just like B-Trees but they also link their leaf nodes together. B+ trees are always faster for point lookups than B-Trees. The main reason databases use B+ trees is because they are balanced and have O(log n) height.`;

    const eval2 = MockInterviewer.evaluateAgainstRubric(test2Answer, dbmsQ.rubric);
    printResult('DBMS (B+ Tree — wrong claim on point lookups & missing fan-out)', eval2);
    const test2Pass = eval2.incorrectClaims.length > 0 && eval2.missingCritical.some(p => p.id === 'fan_out') && eval2.overallScore < 70;

    // ─────────────────────────────────────────────────────────────────────
    // TEST 3: DSA — Longest Consecutive Sequence
    // Planted flaw: says "sort the array first" — explicitly wrong for O(n)
    // ─────────────────────────────────────────────────────────────────────
    const test3Answer = `To solve this in O(n), first sort the array. After sorting, scan linearly through the array and count consecutive numbers. Keep track of the current streak and update the maximum. This runs in O(n) after sorting.`;

    const eval3 = MockInterviewer.evaluateAgainstRubric(test3Answer, dsaQ.rubric);
    printResult('DSA (Longest Consecutive Sequence — planted error: "sort first is O(n)")', eval3);
    const test3Pass = eval3.incorrectClaims.some(ic => ic.claim.toLowerCase().includes('sort')) && eval3.missingCritical.some(p => p.id === 'hashset') && eval3.overallScore < 60;

    // ─────────────────────────────────────────────────────────────────────
    // TEST 4: HR — Behavioral STAR conflict question
    // Planted flaw: says "I escalated to my manager immediately"
    // Missing: STAR result, data-driven action
    // ─────────────────────────────────────────────────────────────────────
    const test4Answer = `During college group project, I disagreed with my partner about the tech stack. He wanted to use MongoDB and I wanted to use MySQL. I escalated to my manager immediately to get it resolved. The project was done on time.`;

    const eval4 = MockInterviewer.evaluateAgainstRubric(test4Answer, hrQ.rubric);
    printResult('HR (Conflict Resolution — planted: "escalated immediately", missing data-action & STAR)', eval4);
    const test4Pass = eval4.incorrectClaims.some(ic => ic.claim.toLowerCase().includes('escalat')) && eval4.missingCritical.some(p => p.id === 'action_data') && eval4.overallScore <= 60;

    // ─────────────────────────────────────────────────────────────────────
    // TEST 5: POSITIVE CONTROL — Gold Standard HashMap answer
    // Should score high (>= 80), 0 critical gaps, 0 incorrect claims
    // ─────────────────────────────────────────────────────────────────────
    const test5Answer = `A HashMap handles collisions using separate chaining by default where each array bucket maintains a linked list of entries. When the number of elements exceeds capacity multiplied by the load factor (default 0.75 in Java), rehashing is triggered which doubles the capacity and redistributes all keys. Rehashing costs O(n) but is amortized O(1) per insertion.

In Java 8+, when a single bucket chain exceeds 8 nodes, it undergoes treeification into a Red-Black balanced tree, reducing worst-case bucket lookup from O(n) to O(log n). Overall average time complexity for put/get is O(1), and space complexity is O(n).`;

    const eval5 = MockInterviewer.evaluateAgainstRubric(test5Answer, hashmapQ.rubric);
    printResult('POSITIVE CONTROL (Gold Standard HashMap answer)', eval5);
    const test5Pass = eval5.overallScore >= 80 && eval5.missingCritical.length === 0 && eval5.incorrectClaims.length === 0;

    // ─────────────────────────────────────────────────────────────────────
    // SUMMARY TABLE
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n' + '='.repeat(72));
    console.log('📊 EVALUATION TEST SUITE SUMMARY');
    console.log('='.repeat(72));
    const results = [
        { label: 'Technical (HashMap — missing rehash & treeify)', score: eval1.overallScore, pass: test1Pass },
        { label: 'DBMS (B+ Tree — caught wrong claim on point lookups)', score: eval2.overallScore, pass: test2Pass },
        { label: 'DSA (Caught sort-is-O(n) misconception & missing HashSet)', score: eval3.overallScore, pass: test3Pass },
        { label: 'HR (Caught escalation anti-pattern & missing STAR data)', score: eval4.overallScore, pass: test4Pass },
        { label: 'Positive Control (Gold Standard Answer → HIRE signal)', score: eval5.overallScore, pass: test5Pass },
    ];

    results.forEach(r => {
        const status = r.pass ? '✅ PASS' : '❌ FAIL';
        console.log(`  ${status}  ${r.label}`);
        console.log(`         Score: ${r.score}/100`);
    });
    const allPass = results.every(r => r.pass);
    console.log('\n' + (allPass ? '🏁 ALL TESTS PASSED — Rubric evaluator correctly identifies flawed answers' : '⚠️  SOME TESTS FAILED'));
}

runTests().catch(console.error);
