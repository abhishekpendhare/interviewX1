const db = require('../db/database');
const AnalyticsEngine = require('../services/analyticsEngine');
const EvidenceEvaluator = require('./evidenceEvaluator');
const DeliveryAnalyzer = require('../services/deliveryAnalyzer');
const crypto = require('node:crypto');
const fs = require('fs');
const path = require('path');

/**
 * STRATA Evidence-Based Voice Mock Interview Engine
 * 
 * Evaluates candidate responses with mathematical rigor:
 * 1. Rubric-based claim & misconception verification
 * 2. Mandatory transcript quote evidence for all credit
 * 3. Mark computed strictly in code from verified rubric points
 * 4. Separate advisory delivery analytics (WPM, fillers, rambling) that NEVER penalize correctness marks
 * 5. Dynamic follow-ups generated from identified gaps or edge-case expansions
 */
class MockInterviewer {

    static getBanks() {
        const banks = {
            Technical: [],
            DSA: [],
            DBMS: [],
            HR: [],
            JavaFoundation: [],
            SpringBoot: []
        };

        try {
            const rubricsPath = path.join(__dirname, '../data/rubrics.json');
            if (fs.existsSync(rubricsPath)) {
                const rubrics = JSON.parse(fs.readFileSync(rubricsPath, 'utf-8'));
                rubrics.forEach(r => {
                    const track = r.track || "Technical";
                    if (!banks[track]) banks[track] = [];
                    banks[track].push({
                        id: r.id,
                        q: r.question,
                        topic: r.topic,
                        difficulty: r.difficulty,
                        rubric: r
                    });
                });
            }
        } catch (e) {
            console.error("Failed to load rubrics bank in MockInterviewer:", e.message);
        }

        return banks;
    }

    static get INTERVIEW_BANKS() {
        return MockInterviewer.getBanks();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DYNAMIC FOLLOW-UP GENERATOR
    // Probes candidate's exact answer, missed points, or deepens edge cases
    // ─────────────────────────────────────────────────────────────────────────
    static generateDynamicFollowUp(questionText, studentAnswer, evalResult, rubric) {
        const { misconceptionsFound = [], missingCritical = [], rubricResults = [], overallScore = 0 } = evalResult;

        // 1. If candidate made an explicitly incorrect statement -> Probe that misconception
        if (misconceptionsFound.length > 0) {
            const mc = misconceptionsFound[0];
            return `You noted that "${mc.evidenceQuote || mc.claim}". In production environments, that assumption can lead to critical failure modes. Can you walk me through what actually happens under stress or high contention?`;
        }

        // 2. If candidate missed critical must-hit concepts -> Probe the primary missing concept
        const missingPoints = rubricResults.filter(r => r.status === "missing");
        if (missingPoints.length > 0) {
            const highestWeightMissed = missingPoints.sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];
            return `Good start. To explore the deeper architectural mechanics: could you specifically elaborate on **${highestWeightMissed.label}**?`;
        }

        // 3. If answer was very short or shallow -> Ask for concrete invariants
        if (evalResult.wordCount < 40) {
            return `That's a high-level summary. Could you dive deeper into the exact step-by-step algorithmic steps, time complexity bounds, and memory overhead?`;
        }

        // 4. If answer was strong (score >= 8.0) -> Challenge with distributed/senior trade-off
        if (rubric.domain === "technical" || rubric.domain === "dsa" || rubric.domain === "cs_fundamentals") {
            return `Excellent explanation. Let's push the constraints: how would your design adapt if this system is deployed across a distributed cluster with network partitions (CAP theorem), or if available memory is constrained while serving 50,000 requests/sec?`;
        } else {
            return `Strong response. Looking back on that experience, what is one structural decision you would approach differently today with the hindsight and technical depth you've gained since?`;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // START a new interview session
    // ─────────────────────────────────────────────────────────────────────────
    static startInterview({ studentId, mode = "Technical", role = "Staff SDE & Bar Raiser" }) {
        const banks = MockInterviewer.getBanks();
        const normalizedMode = banks[mode] ? mode : "Technical";
        const bank = banks[normalizedMode].length > 0 ? banks[normalizedMode] : banks.Technical;
        const firstQ = bank[0];

        const session = {
            id: "int-" + crypto.randomUUID(),
            studentId,
            mode: normalizedMode,
            role,
            status: "in_progress",
            currentQuestionIndex: 0,
            questions: [
                {
                    questionIndex: 0,
                    questionId: firstQ.id,
                    questionText: firstQ.q,
                    topic: firstQ.topic,
                    difficulty: firstQ.difficulty,
                    rubric: firstQ.rubric,
                    studentAnswer: null,
                    followUpGiven: false,
                    evaluation: null,
                    delivery: null
                }
            ],
            history: [],
            finalReport: null,
            startedAt: new Date().toISOString()
        };

        db.saveInterview(session);
        return session;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUBMIT an answer — evaluate against rubric, return dimension scores + follow-up
    // ─────────────────────────────────────────────────────────────────────────
    static async submitAnswer({ interviewId, studentId, studentAnswer, durationSeconds = 0, pauseData = null }) {
        const session = db.getInterviewById(interviewId);
        if (!session || session.studentId !== studentId || session.status === "completed") {
            return { error: "Interview session not found or already completed." };
        }

        const currentQ = session.questions[session.currentQuestionIndex];
        currentQ.studentAnswer = studentAnswer;

        // Perform Evidence-Based Rubric Evaluation
        const evalResult = await EvidenceEvaluator.evaluateAnswer({
            transcript: studentAnswer,
            rubric: currentQ.rubric,
            questionText: currentQ.questionText
        });
        currentQ.evaluation = evalResult;

        // Perform Separate Advisory Delivery Analysis (Never reduces correctness mark)
        const coveredCount = (evalResult.rubricResults || []).filter(r => r.status === "covered").length;
        const totalPoints = (evalResult.rubricResults || []).length || 4;
        const deliveryResult = DeliveryAnalyzer.analyze({
            transcript: studentAnswer,
            durationSeconds,
            pauseData,
            pointsCovered: coveredCount,
            totalPoints
        });
        currentQ.delivery = deliveryResult;

        const banks = MockInterviewer.getBanks();
        const bank = banks[session.mode] || banks.Technical;
        const nextIndex = session.currentQuestionIndex + 1;

        let followUp = null;
        let isFinal = false;

        // Dynamically generate follow-up question probing what the student said
        if (!currentQ.followUpGiven) {
            followUp = MockInterviewer.generateDynamicFollowUp(
                currentQ.questionText,
                studentAnswer,
                evalResult,
                currentQ.rubric
            );
            currentQ.followUpGiven = true;
        } else if (nextIndex < bank.length) {
            session.currentQuestionIndex = nextIndex;
            const nextQ = bank[nextIndex];
            session.questions.push({
                questionIndex: nextIndex,
                questionId: nextQ.id,
                questionText: nextQ.q,
                topic: nextQ.topic,
                difficulty: nextQ.difficulty,
                rubric: nextQ.rubric,
                studentAnswer: null,
                followUpGiven: false,
                evaluation: null,
                delivery: null
            });
        } else {
            session.status = "completed";
            isFinal = true;
            session.finalReport = MockInterviewer.generateFinalReport(session);
            MockInterviewer.persistInterviewPerformance(session);
        }

        db.saveInterview(session);

        return {
            interviewId: session.id,
            status: session.status,
            currentQuestionIndex: session.currentQuestionIndex,
            evaluation: evalResult,
            delivery: deliveryResult,
            followUp,
            isCompleted: isFinal,
            nextQuestion: isFinal ? null : session.questions[session.currentQuestionIndex].questionText,
            nextTopic: isFinal ? null : session.questions[session.currentQuestionIndex].topic,
            finalReport: session.finalReport
        };
    }

    /**
     * Backward-compatible synchronous rubric evaluation helper
     */
    static evaluateAgainstRubric(answer, rubric) {
        if (!rubric) return MockInterviewer._legacyEvaluate(answer, []);
        const offlineResult = EvidenceEvaluator.evaluateOffline(answer, rubric);
        return EvidenceEvaluator._formatFinalOutput(offlineResult, answer, rubric);
    }

    static _legacyEvaluate(answer, keyPoints) {
        const text = (answer || "").toLowerCase();
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        return {
            overallScore: 5.0,
            markBand: "5 to 6 — Acceptable",
            verdict: "BORDERLINE",
            dimensions: { correctness: 5.0, completeness: 5.0, depthAndTradeoffs: 5.0, edgeCases: 5.0, terminologyPrecision: 5.0 },
            incorrectClaims: [],
            missingCritical: [],
            feedbackLines: ["Evaluated against standard rubric baseline."],
            modelAnswer: "Not available.",
            wordCount,
            rubricType: "legacy"
        };
    }

    static generateFinalReport(session) {
        const evals = session.questions.map(q => q.evaluation).filter(Boolean);
        const deliveries = session.questions.map(q => q.delivery).filter(Boolean);
        if (evals.length === 0) return null;

        const avgOf = key => parseFloat((evals.reduce((s, e) => s + (e.dimensions?.[key] || 0), 0) / evals.length).toFixed(1));
        const avgOverall = parseFloat((evals.reduce((s, e) => s + (e.overallScore || 0), 0) / evals.length).toFixed(1));
        const avgWpm = deliveries.length > 0 ? Math.round(deliveries.reduce((s, d) => s + (d.wpm || 0), 0) / deliveries.length) : 135;

        const allMissedCritical = [];
        const allMisconceptions = [];
        evals.forEach(e => {
            (e.missingCritical || []).forEach(m => allMissedCritical.push(m.label));
            (e.misconceptionsFound || []).forEach(mc => allMisconceptions.push(mc.claim));
        });

        const topWeaknesses = [...new Set(allMissedCritical)].slice(0, 5);
        const factualErrors = [...new Set(allMisconceptions)].slice(0, 3);

        const overallMarkBand = 
            avgOverall >= 9.0 ? "9 to 10 — Excellent" :
            avgOverall >= 7.0 ? "7 to 8 — Strong" :
            avgOverall >= 5.0 ? "5 to 6 — Acceptable" :
            avgOverall >= 3.0 ? "3 to 4 — Weak" :
            "0 to 2 — No Credible Attempt";

        const verdict = 
            avgOverall >= 8.0 ? "HIRE SIGNAL — Recommend for Onsite Rounds" :
            avgOverall >= 5.5 ? "BORDERLINE — Targeted Edge-Case & Depth Preparation Needed" :
            "NOT READY — Significant Gaps in Architectural Mechanics";

        return {
            overallInterviewScore: avgOverall,
            markBand: overallMarkBand,
            verdict,
            dimensionAverages: {
                correctness: avgOf("correctness"),
                completeness: avgOf("completeness"),
                depthAndTradeoffs: avgOf("depthAndTradeoffs"),
                edgeCases: avgOf("edgeCases"),
                terminologyPrecision: avgOf("terminologyPrecision")
            },
            deliverySummary: {
                avgWpm,
                totalFillers: deliveries.reduce((s, d) => s + (d.totalFillers || 0), 0),
                paceSummary: avgWpm >= 120 && avgWpm <= 165 ? "Ideal Pace" : avgWpm < 120 ? "Deliberate / Slow" : "Fast"
            },
            questionsEvaluated: evals.length,
            topConceptGaps: topWeaknesses,
            factualErrorsDetected: factualErrors,
            perQuestionSummary: session.questions.map(q => ({
                questionText: q.questionText,
                topic: q.topic,
                difficulty: q.difficulty,
                score: q.evaluation?.overallScore || 0,
                markBand: q.evaluation?.markBand || "—",
                verdict: q.evaluation?.verdict || "—",
                criticalGaps: (q.evaluation?.missingCritical || []).map(p => p.label),
                wpm: q.delivery?.wpm || 0
            })),
            recommendedStudyTargets: topWeaknesses.slice(0, 3),
            interviewMode: session.mode,
            completedAt: new Date().toISOString()
        };
    }

    static persistInterviewPerformance(session) {
        try {
            if (!session.finalReport) return;
            const { overallInterviewScore, dimensionAverages } = session.finalReport;
            const student = db.getStudentById(session.studentId);
            if (!student) return;

            const existing = student.interviewScores || [];
            existing.push({
                sessionId: session.id,
                mode: session.mode,
                score: overallInterviewScore * 10, // Normalizes to 100-point scale for student profile history
                scoreOutOf10: overallInterviewScore,
                correctness: dimensionAverages.correctness * 10,
                completeness: dimensionAverages.completeness * 10,
                depthAndTradeoffs: dimensionAverages.depthAndTradeoffs * 10,
                conductedAt: session.finalReport.completedAt
            });

            const capped = existing.slice(-20);
            db.updateStudent(session.studentId, { interviewScores: capped });
        } catch (e) {
            console.error("Failed to persist interview performance:", e.message);
        }
    }

    /**
     * Request Re-evaluation on an answer
     */
    static requestReevaluation({ interviewId, studentId, questionIndex, studentNote = "" }) {
        const session = db.getInterviewById(interviewId);
        if (!session || session.studentId !== studentId) {
            return { error: "Interview session not found." };
        }

        const q = session.questions[questionIndex];
        if (!q) return { error: "Question index not found." };

        const reevalLog = {
            id: "reeval-" + crypto.randomUUID(),
            sessionId: interviewId,
            studentId,
            questionIndex,
            studentNote,
            originalScore: q.evaluation?.overallScore,
            requestedAt: new Date().toISOString(),
            status: "logged_for_review"
        };

        if (!session.reevaluations) session.reevaluations = [];
        session.reevaluations.push(reevalLog);
        db.saveInterview(session);

        return {
            success: true,
            reevalLog,
            message: "Re-evaluation request logged. Your response and transcript have been flagged for secondary review."
        };
    }
}

module.exports = MockInterviewer;
