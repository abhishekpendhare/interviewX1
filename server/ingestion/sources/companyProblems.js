/**
 * Ingestion Source: liquidslr/interview-company-wise-problems
 * High-velocity company-wise problem metadata ingestion for FAANG, Unicorns, and Prime Enterprise recruiters.
 */

const MAJOR_COMPANIES = [
    { name: "Amazon", folder: "Amazon" },
    { name: "Google", folder: "Google" },
    { name: "Microsoft", folder: "Microsoft" },
    { name: "Meta", folder: "Meta" },
    { name: "Apple", folder: "Apple" },
    { name: "Uber", folder: "Uber" },
    { name: "Adobe", folder: "Adobe" },
    { name: "Bloomberg", folder: "Bloomberg" },
    { name: "Goldman Sachs", folder: "Goldman Sachs" },
    { name: "Flipkart", folder: "Flipkart" },
    { name: "Walmart Labs", folder: "Walmart Labs" },
    { name: "LinkedIn", folder: "LinkedIn" },
    { name: "Nvidia", folder: "Nvidia" },
    { name: "Oracle", folder: "Oracle" },
    { name: "Cisco", folder: "Cisco" },
    { name: "Netflix", folder: "Netflix" },
    { name: "TCS Prime", folder: "tcs" },
    { name: "Infosys DSE", folder: "Infosys" },
    { name: "Cognizant", folder: "Cognizant" },
    { name: "Wipro", folder: "Wipro" },
    { name: "Accenture", folder: "Accenture" }
];

function parseCSVLine(line) {
    const result = [];
    let insideQuotes = false;
    let current = '';

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

const CURATED_PROBLEMS = {
    'two-sum': {
        category: 'Arrays & Hash Tables',
        tags: ['Array', 'Hash Table', 'Two Pointers'],
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
    }
};

function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function ingestCompanyProblems() {
    console.log("📥 Ingesting Company-Wise Coding Problem Metadata from liquidslr/interview-company-wise-problems...");
    const problemMap = new Map();

    for (const comp of MAJOR_COMPANIES) {
        try {
            const url = `https://raw.githubusercontent.com/liquidslr/interview-company-wise-problems/main/${encodeURIComponent(comp.folder)}/5.%20All.csv`;
            const res = await fetch(url);
            if (!res.ok) {
                console.warn(`  ⚠️ Could not fetch CSV for ${comp.name} (${res.status})`);
                continue;
            }

            const text = await res.text();
            const lines = text.split('\n').filter(l => l.trim().length > 0);
            if (lines.length <= 1) continue;

            const rows = lines.slice(1);
            let count = 0;

            for (const row of rows) {
                const cols = parseCSVLine(row);
                if (cols.length < 5) continue;

                const rawDiff = (cols[0] || 'MEDIUM').toUpperCase();
                const difficulty = rawDiff.includes('EASY') ? 'Easy' : rawDiff.includes('HARD') ? 'Hard' : 'Medium';
                const title = cols[1] || '';
                if (!title) continue;

                const rawAcceptance = parseFloat(cols[3]) || 0.45;
                const acceptance = `${(rawAcceptance < 1 ? rawAcceptance * 100 : rawAcceptance).toFixed(1)}%`;
                const topicsStr = cols[5] || 'Algorithms';
                const tags = topicsStr.split(',').map(t => t.replace(/"/g, '').trim()).filter(Boolean);
                const category = tags[0] || 'Algorithms';
                const slug = slugify(title);

                const curated = CURATED_PROBLEMS[slug];
                if (!problemMap.has(slug)) {
                    problemMap.set(slug, {
                        id: slug,
                        title,
                        slug,
                        difficulty,
                        acceptance,
                        category: curated?.category || category,
                        tags: curated?.tags || tags,
                        companyTags: [comp.name],
                        timeLimitMs: 1000,
                        memoryLimitMb: 256,
                        description: curated ? curated.description : `Solve the algorithmic challenge **${title}**.\n\n### Problem Category\n**${category}** (${tags.join(', ')})\n\n### Objective\nImplement an optimal solution in JavaScript, Python, C++, or Java satisfying all edge cases with minimal asymptotic time and space complexity.`,
                        examples: curated ? curated.examples : [
                            {
                                input: "Standard sample test case input",
                                output: "Expected output result",
                                explanation: `Verify your solution handles standard inputs and extreme edge conditions.`
                            }
                        ],
                        constraints: curated ? curated.constraints : [
                            "1 <= input.length <= 10^5",
                            "Target Time Complexity: O(n) or O(n log n)",
                            "Target Space Complexity: O(1) to O(n)"
                        ],
                        starterCode: curated ? curated.starterCode : {
                            javascript: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write your optimal solution here\n    \n}`,
                            python: `class Solution:\n    def solution(self, input):\n        # Write your optimal solution here\n        pass`,
                            cpp: `#include <vector>\n#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Implement solution\n    }\n};`,
                            java: `import java.util.*;\n\nclass Solution {\n    public void solution() {\n        // Implement solution\n    }\n}`
                        },
                        hintsCount: 3,
                        source: "github.com/liquidslr/interview-company-wise-problems"
                    });
                } else {
                    const existing = problemMap.get(slug);
                    if (!existing.companyTags.includes(comp.name)) {
                        existing.companyTags.push(comp.name);
                    }
                }
                count++;
            }
            console.log(`  ✓ Ingested ${count} problems for ${comp.name}`);
        } catch (err) {
            console.error(`  ❌ Failed for ${comp.name}:`, err.message);
        }
    }

    const problemList = Array.from(problemMap.values());
    console.log(`✅ Total unique company-wise coding problems assembled: ${problemList.length}`);
    return problemList;
}

module.exports = { ingestCompanyProblems };
