const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../db/store.json');

async function runStep5() {
    console.log("\n=======================================================");
    console.log("▶ [SOURCE 5] Fetching: 30-seconds-of-interviews & reverse-interview (MIT)");
    console.log("=======================================================");

    const parsedQuestions = [];

    // 1. Fetch file list from 30-seconds-of-interviews repo
    try {
        const treeRes = await fetch('https://api.github.com/repos/Chalarangelo/30-seconds-of-interviews/git/trees/master?recursive=1', {
            headers: { 'User-Agent': 'node-fetch' }
        });
        if (treeRes.ok) {
            const treeData = await treeRes.json();
            const mdFiles = (treeData.tree || [])
                .map(f => f.path)
                .filter(p => p.startsWith('questions/') && p.endsWith('.md') && !p.includes('template'));

            console.log(`Found ${mdFiles.length} interview questions in 30-seconds-of-interviews.`);

            // Fetch a batch of high-yield questions
            const selectedFiles = mdFiles.slice(0, 30);
            let idx = 1;

            for (const filePath of selectedFiles) {
                try {
                    const fileUrl = `https://raw.githubusercontent.com/Chalarangelo/30-seconds-of-interviews/master/${filePath}`;
                    const res = await fetch(fileUrl);
                    if (!res.ok) continue;

                    const md = await res.text();
                    const lines = md.split('\n');
                    const titleLine = lines.find(l => l.startsWith('### '));
                    const title = titleLine ? titleLine.replace('### ', '').trim() : path.basename(filePath, '.md');

                    // Extract answer
                    let answer = "";
                    let answerIdx = lines.findIndex(l => l.includes('#### Answer'));
                    if (answerIdx >= 0) {
                        answer = lines.slice(answerIdx + 1, answerIdx + 12).join('\n').trim();
                    }

                    // Extract tag
                    let tag = "Technical & Architecture";
                    let tagLine = lines.find(l => l.includes('<!-- tags:'));
                    if (tagLine) {
                        tag = tagLine.replace('<!-- tags:', '').replace('-->', '').replace(/[()]/g, '').trim();
                    }

                    const options = [
                        answer.length > 85 ? answer.slice(0, 80) + "..." : (answer || "Optimal implementation pattern"),
                        "Alternative design without memory optimization",
                        "Anti-pattern resulting in race conditions",
                        "Deprecated syntax in modern standards"
                    ];

                    parsedQuestions.push({
                        id: `q-30s-${idx++}`,
                        subject: "Object-Oriented Design & LLD",
                        topic: tag.toUpperCase(),
                        subtopic: "Engineering Best Practices",
                        difficulty: "Medium",
                        questionType: "multiple_choice",
                        title,
                        description: `### ${title}\n\nExplain the underlying architectural principle, memory implication, and trade-offs in modern production engineering.`,
                        options,
                        correctAnswerIndex: 0,
                        explanation: answer || "Follow standard engineering patterns and language specifications.",
                        hints: ["Think about scope, memory lifecycle, and performance overhead."],
                        conceptTags: ["30-seconds", tag, "engineering-interviews"],
                        source: "github.com/Chalarangelo/30-seconds-of-interviews (MIT)"
                    });
                } catch (e) {}
            }
        }
    } catch (e) {
        console.warn("⚠️ 30-seconds fetch error:", e.message);
    }

    // 2. Fetch reverse-interview questions (Engineering Culture, On-Call, Architecture)
    try {
        const revRes = await fetch('https://raw.githubusercontent.com/viraptor/reverse-interview/master/README.md');
        if (revRes.ok) {
            const revText = await revRes.text();
            const lines = revText.split('\n');
            let idx = 1;

            const questionsLines = lines.filter(l => l.trim().startsWith('* [ ]') || l.trim().startsWith('- [ ]') || l.trim().startsWith('* ')).slice(0, 25);
            for (const ql of questionsLines) {
                const qText = ql.replace(/^[\*\-\s\[\]]+/, '').trim();
                if (qText.length < 10) continue;

                parsedQuestions.push({
                    id: `q-rev-${idx++}`,
                    subject: "Behavioral & STAR Leadership",
                    topic: "Engineering Culture & System Architecture",
                    subtopic: "Team Practices & On-Call Health",
                    difficulty: "Medium",
                    questionType: "behavioral",
                    title: qText,
                    description: `During senior engineering and bar-raiser rounds, evaluate this architectural and organizational prompt:\n\n**"${qText}"**\n\nHow do mature engineering teams structure and defend this practice?`,
                    options: [
                        "Ground in continuous telemetry, automated CI/CD pipelines, blameless post-mortems, and documented SLAs",
                        "Rely on manual unversioned deployments without monitoring",
                        "Defer all architectural decisions to external consultants",
                        "Avoid writing integration tests to ship faster"
                    ],
                    correctAnswerIndex: 0,
                    explanation: "High-performing engineering teams prioritize automation, observability, blameless culture, and clear service-level objectives.",
                    hints: ["Focus on automation, telemetry, and team operational health."],
                    conceptTags: ["reverse-interview", "culture", "leadership"],
                    source: "github.com/viraptor/reverse-interview (MIT)"
                });
            }
        }
    } catch (e) {
        console.warn("⚠️ reverse-interview fetch error:", e.message);
    }

    console.log(`Parsed ${parsedQuestions.length} total questions from Source 5.`);

    // Step C — Write to DB
    let store = { students: [], questions: [], codingProblems: [], codeSubmissions: [], tests: [], testAttempts: [], studyPlans: [], interviews: [], conversations: [] };
    if (fs.existsSync(STORE_PATH)) {
        try {
            store = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
        } catch (e) {}
    }

    const existingQuestions = store.questions || [];
    const questionMap = new Map();
    for (const q of existingQuestions) {
        questionMap.set(q.id, q);
    }
    for (const q of parsedQuestions) {
        questionMap.set(q.id, q);
    }
    store.questions = Array.from(questionMap.values());
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');

    // Step D — Verify by actually re-opening database file from disk
    const rawCheck = fs.readFileSync(STORE_PATH, 'utf8');
    const verifyStore = JSON.parse(rawCheck);
    const verifiedCount = (verifyStore.questions || []).filter(q => 
        q.source === "github.com/Chalarangelo/30-seconds-of-interviews (MIT)" || 
        q.source === "github.com/viraptor/reverse-interview (MIT)"
    ).length;

    console.log(`\n🔍 [VERIFICATION] Source 5 (30s & Reverse-Interview): Count of items in disk store.json = ${verifiedCount}`);
    console.log(`Total assessment questions now in store.json = ${verifyStore.questions.length}`);

    // Step E — Gate
    if (verifiedCount === 0) {
        throw new Error("GATE FAILED: Verified count is 0 for Source 5!");
    }
    console.log(`✅ [GATE PASSED] Source 5 verified with ${verifiedCount} items.\n`);
    return verifiedCount;
}

runStep5().catch(e => {
    console.error("Fatal in Step 5:", e.message);
    process.exit(1);
});
