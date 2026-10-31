const fs = require('fs');
const path = require('path');

const { ingestCompanyProblems } = require('./sources/companyProblems');
const { ingestCodeforcesProblems } = require('./sources/codeforces');
const { ingestHuggingFaceAptitude } = require('./sources/huggingfaceAptitude');
const { ingestBehavioralHRQuestions } = require('./sources/behavioralHR');
const { generateAIQuestionBank } = require('./sources/aiQuestionGenerator');

const STORE_PATH = path.join(__dirname, '../db/store.json');

async function runPipeline() {
    console.log("==================================================================");
    console.log("🚀 STRATA Content Sourcing & Ingestion Pipeline");
    console.log("==================================================================");

    // Load existing database store
    let currentStore = {
        students: [],
        questions: [],
        codingProblems: [],
        codeSubmissions: [],
        tests: [],
        testAttempts: [],
        studyPlans: [],
        interviews: [],
        conversations: []
    };

    if (fs.existsSync(STORE_PATH)) {
        try {
            const raw = fs.readFileSync(STORE_PATH, 'utf8');
            currentStore = JSON.parse(raw);
        } catch (e) {
            console.warn("⚠️ Could not parse existing store.json, creating new structure.");
        }
    }

    const sourceStats = {
        companyWiseGitHub: 0,
        codeforcesAPI: 0,
        huggingfaceAptitude: 0,
        behavioralMIT: 0,
        aiGenerated: 0
    };

    // 1. Ingest Company-Wise Coding Problems
    const companyProblems = await ingestCompanyProblems();
    sourceStats.companyWiseGitHub = companyProblems.length;

    // 2. Ingest Codeforces Problems (Official API)
    const codeforcesProblems = await ingestCodeforcesProblems(120);
    sourceStats.codeforcesAPI = codeforcesProblems.length;

    // 3. Ingest HuggingFace Aptitude
    const aptitudeQuestions = await ingestHuggingFaceAptitude(150);
    sourceStats.huggingfaceAptitude = aptitudeQuestions.length;

    // 4. Ingest Behavioral & HR Questions
    const behavioralQuestions = await ingestBehavioralHRQuestions();
    sourceStats.behavioralMIT = behavioralQuestions.length;

    // 5. Ingest AI-Generated CS Core Questions
    const aiQuestions = await generateAIQuestionBank();
    sourceStats.aiGenerated = aiQuestions.length;

    // Merge & Deduplicate Coding Problems
    const existingProblems = currentStore.codingProblems || [];
    const problemMap = new Map();

    // Preserve existing first
    for (const p of existingProblems) {
        problemMap.set(p.slug || p.id, p);
    }

    for (const p of [...companyProblems, ...codeforcesProblems]) {
        const key = p.slug || p.id;
        if (!problemMap.has(key)) {
            problemMap.set(key, p);
        } else {
            // Merge company tags
            const existing = problemMap.get(key);
            if (p.companyTags) {
                existing.companyTags = Array.from(new Set([...(existing.companyTags || []), ...p.companyTags]));
            }
        }
    }

    // Merge & Deduplicate Questions
    const existingQuestions = currentStore.questions || [];
    const questionMap = new Map();

    for (const q of existingQuestions) {
        questionMap.set(q.id, q);
    }

    for (const q of [...aptitudeQuestions, ...behavioralQuestions, ...aiQuestions]) {
        if (!questionMap.has(q.id)) {
            questionMap.set(q.id, q);
        }
    }

    currentStore.codingProblems = Array.from(problemMap.values());
    currentStore.questions = Array.from(questionMap.values());

    // Save to store.json
    fs.writeFileSync(STORE_PATH, JSON.stringify(currentStore, null, 2), 'utf8');

    // Generate Audit Telemetry Summary Report
    console.log("\n==================================================================");
    console.log("📊 STRATA CONTENT INGESTION SUMMARY AUDIT REPORT");
    console.log("==================================================================");

    console.log("\n1. SOURCING BREAKDOWN (Attribution):");
    console.log(`  • liquidslr/interview-company-wise-problems : ${sourceStats.companyWiseGitHub} items`);
    console.log(`  • Codeforces Official API (problemset.problems): ${sourceStats.codeforcesAPI} items`);
    console.log(`  • HuggingFace Aptitude Dataset (Apache-2.0)  : ${sourceStats.huggingfaceAptitude} items`);
    console.log(`  • 30-seconds-of-interviews / reverse-interview : ${sourceStats.behavioralMIT} items`);
    console.log(`  • STRATA Neural Core Generator (ai-generated) : ${sourceStats.aiGenerated} items`);

    console.log(`\n2. TOTAL STORED CONTENT:`);
    console.log(`  • Total Algorithmic Coding Problems: ${currentStore.codingProblems.length}`);
    console.log(`  • Total CS / Assessment Questions : ${currentStore.questions.length}`);

    // Subject Breakdown
    const subjectCounts = {};
    const diffCounts = {};
    for (const q of currentStore.questions) {
        const subj = q.subject || "General";
        const diff = q.difficulty || "Medium";
        subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
        diffCounts[diff] = (diffCounts[diff] || 0) + 1;
    }

    console.log("\n3. QUESTIONS PER SUBJECT:");
    for (const [subj, count] of Object.entries(subjectCounts)) {
        console.log(`  • ${subj.padEnd(38)}: ${count} questions`);
    }

    console.log("\n4. QUESTIONS PER DIFFICULTY:");
    for (const [diff, count] of Object.entries(diffCounts)) {
        console.log(`  • ${diff.padEnd(10)}: ${count} questions`);
    }

    // Company Tag Counts for Coding Problems
    const companyProblemCounts = {};
    for (const p of currentStore.codingProblems) {
        if (p.companyTags) {
            for (const c of p.companyTags) {
                companyProblemCounts[c] = (companyProblemCounts[c] || 0) + 1;
            }
        }
    }

    console.log("\n5. CODING PROBLEMS PER TARGET COMPANY:");
    for (const [comp, count] of Object.entries(companyProblemCounts)) {
        console.log(`  • ${comp.padEnd(20)}: ${count} problems`);
    }

    console.log("\n==================================================================");
    console.log("✅ INGESTION PIPELINE EXECUTED SUCCESSFULLY — store.json UPDATED");
    console.log("==================================================================\n");

    return {
        totalCodingProblems: currentStore.codingProblems.length,
        totalQuestions: currentStore.questions.length,
        sourceStats,
        subjectCounts,
        companyProblemCounts
    };
}

if (require.main === module) {
    runPipeline().catch(err => {
        console.error("FATAL Ingestion Error:", err);
        process.exit(1);
    });
}

module.exports = { runPipeline };
