const Judge0Service = require('../services/judge0Service');
const { PROBLEM_JUDGE_REGISTRY } = require('../data/problemJudgeData');

async function testTwoSum() {
    const data = PROBLEM_JUDGE_REGISTRY['two-sum'];
    const altTwoSum = `
function twoSum(nums, target) {
    const pairs = nums.map((val, idx) => ({ val, idx }));
    pairs.sort((a, b) => a.val - b.val);
    let left = 0, right = pairs.length - 1;
    while (left < right) {
        const sum = pairs[left].val + pairs[right].val;
        if (sum === target) return [pairs[right].idx, pairs[left].idx]; // Inverted order
        if (sum < target) left++;
        else right--;
    }
    return [];
}`;
    
    let allPassed = true;
    for (const tc of data.hiddenTestCases) {
        const res = await Judge0Service.executeCode({
            code: altTwoSum,
            language: 'javascript',
            stdin: JSON.stringify(tc.input),
            expectedOutput: JSON.stringify(tc.expected),
            problemId: 'two-sum',
            rawInput: tc.input
        });
        if (res.status !== 'Accepted') {
            console.log(`Test ${tc.id} (${tc.name}) FAIL: status=${res.status}, stdout=${res.stdout}, stderr=${res.stderr}`);
            allPassed = false;
        } else {
            console.log(`Test ${tc.id} (${tc.name}) PASS`);
        }
    }
    console.log(`All 16 Two-Sum alt tests passed: ${allPassed}`);
}

testTwoSum();
