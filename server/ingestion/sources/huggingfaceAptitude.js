/**
 * Ingestion Source: HuggingFace Aptitude Dataset (Apache-2.0 Licensed)
 * https://huggingface.co/datasets/Prathamesh25/aptitude-qa-dataset
 * India-focused campus placement aptitude, reasoning, and technical aptitude questions.
 */

async function ingestHuggingFaceAptitude(limit = 120) {
    console.log("📥 Ingesting India Campus Aptitude & Reasoning from HuggingFace dataset...");
    const questions = [];

    try {
        const url = `https://datasets-server.huggingface.co/rows?dataset=Prathamesh25%2Faptitude-qa-dataset&config=default&split=train&offset=0&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HF server returned ${res.status}`);
        }

        const data = await res.json();
        if (!data.rows || !Array.isArray(data.rows)) {
            throw new Error("Invalid rows structure from HF dataset");
        }

        let idx = 1;
        for (const rowObj of data.rows) {
            const msgs = rowObj.row?.messages || [];
            if (msgs.length < 2) continue;

            const userContent = msgs[0].content || "";
            const assistantContent = msgs[1].content || "";

            // Parse metadata from user content (e.g. Subject: ..., Level: ..., Category: ..., Question: ...)
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

            // Extract Answer
            let answerClean = assistantContent.replace(/Solution:\s*/i, '').trim();

            // Formulate clean 4-option MCQ
            const options = [
                answerClean.length > 80 ? answerClean.slice(0, 75) + "..." : answerClean,
                "Independent of parameter constraints",
                "Indeterminate without additional boundary conditions",
                "Null or Zero state invariant"
            ];

            questions.push({
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

        console.log(`✅ Ingested ${questions.length} aptitude questions from HuggingFace dataset.`);
        return questions;
    } catch (err) {
        console.error("❌ HuggingFace aptitude ingestion failed:", err.message);
        return [];
    }
}

module.exports = { ingestHuggingFaceAptitude };
