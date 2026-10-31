const fs = require('fs');

async function testFeedbackAndApproach() {
    console.log('========================================================================');
    console.log('🧪 TESTING STUDENT FEEDBACK & APPROACH UPLOAD PERSISTENCE (PARTS 1 & 2)');
    console.log('========================================================================\n');

    const BASE_URL = 'http://localhost:3000';

    // ── 1. TEST QUESTION FEEDBACK: SUBMIT REVIEW ──
    console.log('[Step 1] Submitting a real student review on question "two-sum"...');
    const reviewPayload = {
        questionId: 'two-sum',
        type: 'review',
        rating: 5,
        category: 'clarity',
        text: 'Standard Day-0 LeetCode benchmark. Optimal O(n) single-pass hash map solution is tested strictly against memory bounds.'
    };

    const reviewRes = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-student-id': 'candidate-001' },
        body: JSON.stringify(reviewPayload)
    });
    const reviewData = await reviewRes.json();
    console.log('  Review Submit Response:', reviewData.success ? 'SUCCESS' : 'FAILED', '| ID:', reviewData.feedback?.id);

    // ── 2. TEST QUESTION FEEDBACK: SUBMIT SUGGESTION ──
    console.log('\n[Step 2] Submitting a real student suggestion on question "two-sum"...');
    const suggestionPayload = {
        questionId: 'two-sum',
        type: 'suggestion',
        category: 'alternative_approach',
        text: 'Alternative Approach: If the input is already sorted, a two-pointer approach gives O(n) time and O(1) space, avoiding hash map heap allocations.'
    };

    const suggRes = await fetch(`${BASE_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-student-id': 'candidate-001' },
        body: JSON.stringify(suggestionPayload)
    });
    const suggData = await suggRes.json();
    console.log('  Suggestion Submit Response:', suggData.success ? 'SUCCESS' : 'FAILED', '| ID:', suggData.feedback?.id);

    // ── 3. TEST QUESTION FEEDBACK: FETCH & VERIFY SUMMARY ──
    console.log('\n[Step 3] Fetching aggregated feedback for "two-sum"...');
    const getRes = await fetch(`${BASE_URL}/api/feedback/two-sum`, {
        headers: { 'x-student-id': 'candidate-001' }
    });
    const fbSummary = await getRes.json();
    console.log('  Total Feedback Count:', fbSummary.totalCount);
    console.log('  Total Reviews:', fbSummary.totalReviews);
    console.log('  Total Suggestions:', fbSummary.totalSuggestions);
    console.log('  Average Rating:', fbSummary.averageRating, '/ 5.0');
    console.log('  Own Feedback Flagged:', fbSummary.feedback.some(f => f.isOwnFeedback));

    // ── 4. TEST APPROACH UPLOAD ON CODING SUBMISSION ──
    console.log('\n[Step 4] Submitting code with real "My Approach" write-up on "two-sum"...');
    const approachText = `### Intuition & Approach
We use a Hash Map (lookup dictionary) to store seen elements and their indices.
For each number num at index i:
1. We compute complement = target - num.
2. If complement exists in map, return [map[complement], i].
3. Otherwise, store map[num] = i.

### Complexity Invariants
- Time Complexity: O(n) linear scan
- Space Complexity: O(n) auxiliary hash map`;

    const code = `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`;

    const subRes = await fetch(`${BASE_URL}/api/compiler/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-student-id': 'candidate-001' },
        body: JSON.stringify({
            problemId: 'two-sum',
            language: 'javascript',
            code,
            approachText
        })
    });
    const subData = await subRes.json();
    console.log('  Submission Status:', subData.status);
    console.log('  Approach Reviewed:', subData.approachReviewed);
    console.log('  Approach Alignment Score:', subData.approachReview?.matchScore + '%');
    console.log('  Approach Verdict:', subData.approachReview?.alignmentVerdict);

    // ── 5. TEST SUBMISSION HISTORY FETCH ──
    console.log('\n[Step 5] Fetching submission history for "two-sum"...');
    const histRes = await fetch(`${BASE_URL}/api/compiler/submissions/two-sum`, {
        headers: { 'x-student-id': 'candidate-001' }
    });
    const history = await histRes.json();
    console.log('  Past Submissions Count:', history.length);
    console.log('  Latest Submission has approachText:', !!history[0]?.approachText);
    console.log('  Saved Approach Sample:', history[0]?.approachText?.substring(0, 80) + '...');

    // ── 6. DIRECT DISK VERIFICATION (store.json) ──
    console.log('\n[Step 6] Re-reading database store.json from disk to confirm persistence...');
    // Wait 250ms for debounced async disk write to flush
    await new Promise(r => setTimeout(r, 300));
    const rawDb = JSON.parse(fs.readFileSync('server/db/store.json', 'utf8'));
    const diskFeedback = (rawDb.questionFeedback || []).filter(f => f.questionId === 'two-sum');
    const diskSubmissions = (rawDb.codeSubmissions || []).filter(s => s.problemId === 'two-sum' && s.approachText);

    console.log('  Disk Verified Feedback Count on "two-sum":', diskFeedback.length);
    console.log('  Disk Verified Approach Submissions on "two-sum":', diskSubmissions.length);

    const part1Pass = diskFeedback.length >= 2 && fbSummary.totalReviews >= 1 && fbSummary.totalSuggestions >= 1;
    const part2Pass = diskSubmissions.length >= 1 && subData.approachReviewed === true;

    console.log('\n========================================================================');
    console.log('🏁 VERIFICATION RESULTS:');
    console.log('  PART 1 (Student Suggestion / Review System):', part1Pass ? '✅ PASSED & PERSISTED' : '❌ FAILED');
    console.log('  PART 2 ("My Approach" Upload on Coding Problems):', part2Pass ? '✅ PASSED & PERSISTED' : '❌ FAILED');
    console.log('========================================================================\n');
}

testFeedbackAndApproach().catch(console.error);
