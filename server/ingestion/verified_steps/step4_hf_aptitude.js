const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '../../db/store.json');

async function runStep4() {
    console.log("\n=======================================================");
    console.log("▶ [SOURCE 4] Fetching: HuggingFace Aptitude Dataset (Apache-2.0)");
    console.log("=======================================================");

    // Step A — Fetch
    const url = 'https://datasets-server.huggingface.co/rows?dataset=Prathamesh25%2Faptitude-qa-dataset&config=default&split=train&offset=0&limit=100';
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HF server returned ${res.status}`);
    }

    const data = await res.json();
    if (!data.rows || !Array.isArray(data.rows)) {
        throw new Error("Invalid rows structure from HF dataset");
    }

    console.log(`Fetched ${data.rows.length} rows from HuggingFace dataset.`);

    // Step B — Parse
    const parsedQuestions = [];
    let idx = 1;

    for (const rowObj of data.rows) {
        const msgs = rowObj.row?.messages || [];
        if (msgs.length < 2) continue;

        const userContent = msgs[0].content || "";
        const assistantContent = msgs[1].content || "";

        let subject = "Quantitative & Analytical Aptitude";
        let difficulty = "Medium";
        let topic = "Quantitative Aptitude";
        let questionText = userContent;

        if (userContent.includes("Subject:")) {
            const lines = userContent.split('\n');
            for (const line of lines) {
                if (line.startsWith("Subject:")) {
                    const rawSubj = line.replace("Subject:", "").trim();
                    if (rawSubj.includes("Technical")) subject = "Technical & Core Aptitude";
                    else if (rawSubj.includes("Reasoning")) subject = "Logical & Analytical Reasoning";
                }
                if (line.startsWith("Level:")) {
                    const rawLvl = line.replace("Level:", "").trim();
                    if (rawLvl.includes("Basic")) difficulty = "Easy";
                    else if (rawLvl.includes("Advanced")) difficulty = "Hard";
                }
                if (line.startsWith("Category:")) {
                    topic = line.replace("Category:", "").trim().replace(/\(\d+–\d+\)/, '').trim() || topic;
                }
                if (line.startsWith("Question:")) {
                    questionText = line.replace("Question:", "").trim();
                }
            }
        }

        let answerClean = assistantContent.replace(/Solution:\s*/i, '').trim();

        const options = [
            answerClean.length > 80 ? answerClean.slice(0, 75) + "..." : answerClean,
            "Independent of parameter constraints",
            "Indeterminate without additional boundary conditions",
            "Null or Zero state invariant"
        ];

        parsedQuestions.push({
            id: `q-apti-hf-${idx}`,
            subject: "Quantitative & Analytical Aptitude",
            topic,
            subtopic: "Campus Recruitment Core",
            difficulty,
            questionType: "multiple_choice",
            title: questionText.length > 70 ? questionText.slice(0, 67) + "..." : questionText,
            description: questionText,
            options,
            correctAnswerIndex: 0,
            explanation: assistantContent || "Apply foundational mathematical and logical principles to verify correctness.",
            hints: ["Identify the primary rate or invariant given in the problem statement."],
            conceptTags: ["aptitude", "quantitative", "campus-placement"],
            source: "huggingface.co/datasets/Prathamesh25/aptitude-qa-dataset (Apache-2.0)"
        });
        idx++;
    }

    console.log(`Parsed ${parsedQuestions.length} aptitude questions.`);

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
    const verifiedCount = (verifyStore.questions || []).filter(q => q.source === "huggingface.co/datasets/Prathamesh25/aptitude-qa-dataset (Apache-2.0)").length;

    console.log(`\n🔍 [VERIFICATION] Source 4 (HF Aptitude): Count of items in disk store.json = ${verifiedCount}`);
    console.log(`Total assessment questions now in store.json = ${verifyStore.questions.length}`);

    // Step E — Gate
    if (verifiedCount === 0) {
        throw new Error("GATE FAILED: Verified count is 0 for HF Aptitude!");
    }
    console.log(`✅ [GATE PASSED] Source 4 verified with ${verifiedCount} items.\n`);
    return verifiedCount;
}

runStep4().catch(e => {
    console.error("Fatal in Step 4:", e.message);
    process.exit(1);
});
