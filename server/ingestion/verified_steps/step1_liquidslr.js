const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../db/store.json');

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

function slugify(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function runStep1() {
    console.log("\n=======================================================");
    console.log("▶ [SOURCE 1] Fetching: liquidslr/interview-company-wise-problems");
    console.log("=======================================================");

    // Step A & B: Fetch and Parse
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

                if (!problemMap.has(slug)) {
                    problemMap.set(slug, {
                        id: slug,
                        title,
                        slug,
                        difficulty,
                        acceptance,
                        category,
                        tags,
                        companyTags: [comp.name],
                        timeLimitMs: 1000,
                        memoryLimitMb: 256,
                        description: `Solve the algorithmic challenge **${title}**.\n\n### Category\n**${category}** (${tags.join(', ')})\n\n### Objective\nImplement an optimal solution in JavaScript, Python, C++, or Java satisfying all edge cases with minimal asymptotic time and space complexity.`,
                        examples: [
                            {
                                input: "Standard sample test case input",
                                output: "Expected output result",
                                explanation: `Verify your logic handles edge boundaries.`
                            }
                        ],
                        constraints: [
                            "1 <= input.length <= 10^5",
                            "Target Time: O(n) or O(n log n)",
                            "Target Space: O(1) to O(n)"
                        ],
                        starterCode: {
                            javascript: `function solution(input) {\n    // Implement optimal solution\n    \n}`,
                            python: `class Solution:\n    def solution(self, input):\n        # Implement optimal solution\n        pass`,
                            cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        \n    }\n};`,
                            java: `import java.util.*;\n\nclass Solution {\n    public void solution() {\n        \n    }\n}`
                        },
                        testCases: [
                            { input: "Sample 1", expected: "Expected 1" }
                        ],
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

    const parsedList = Array.from(problemMap.values());
    console.log(`Fetched and parsed ${parsedList.length} unique items from liquidslr repository.`);

    // Step C — Write to DB
    let store = { students: [], questions: [], codingProblems: [], codeSubmissions: [], tests: [], testAttempts: [], studyPlans: [], interviews: [], conversations: [] };
    if (fs.existsSync(STORE_PATH)) {
        try {
            store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
        } catch (e) {}
    }

    const existingProblems = store.codingProblems || [];
    const mergedMap = new Map();
    for (const p of existingProblems) {
        mergedMap.set(p.slug || p.id, p);
    }
    for (const p of parsedList) {
        mergedMap.set(p.slug || p.id, p);
    }
    store.codingProblems = Array.from(mergedMap.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');

    // Step D — Verify by actually re-opening database file from disk
    const rawCheck = fs.readFileSync(STORE_PATH, 'utf8');
    const verifyStore = JSON.parse(rawCheck);
    const verifiedCount = (verifyStore.codingProblems || []).filter(p => p.source === "github.com/liquidslr/interview-company-wise-problems").length;

    console.log(`\n🔍 [VERIFICATION] Source 1 (liquidslr): Count of items in disk store.json = ${verifiedCount}`);
    
    // Step E — Gate
    if (verifiedCount === 0) {
        throw new Error("GATE FAILED: Verified count is 0 for liquidslr!");
    }
    console.log(`✅ [GATE PASSED] Source 1 verified with ${verifiedCount} items.\n`);
    return verifiedCount;
}

runStep1().catch(e => {
    console.error("Fatal in Step 1:", e.message);
    process.exit(1);
});
