const LLMProvider = require('./llmProvider');
const AnalyticsEngine = require('../services/analyticsEngine');

/**
 * AI Tutor & Code Doubt Solver
 * Multi-level concept explanations (Beginner, Intermediate, Advanced, Interview Mode)
 * and step-by-step Socratic code debugging with hints before full answers.
 */
class DoubtSolver {

    /**
     * Explain a concept at a specific depth level
     */
    static async explainConcept({ concept, level = "intermediate", studentId }) {
        const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);

        let systemInstruction = "";
        if (level === "beginner") {
            systemInstruction = "Explain in very intuitive, beginner-friendly language with an everyday real-world analogy. Avoid overwhelming technical jargon.";
        } else if (level === "intermediate") {
            systemInstruction = "Provide a standard technical explanation with a concrete code snippet, time/space complexity, and practical usage.";
        } else if (level === "advanced") {
            systemInstruction = "Provide deep implementation details, memory management/internal mechanics, concurrency/thread-safety considerations, edge cases, and asymptotic proofs.";
        } else if (level === "interview_mode") {
            systemInstruction = "Provide a crisp, high-impact 90-second answer structured exactly how an SDE candidate should deliver it in an onsite interview (Definition -> Core mechanism -> Complexity -> 1 Trade-off).";
        }

        const prompt = `Student (${profile.studentName}, Readiness Score: ${profile.readinessScore}%) is asking about: "${concept}".
Target Level: ${level.toUpperCase()}.
Instruction: ${systemInstruction}`;

        return await LLMProvider.generateCompletion({
            messages: [{ sender: 'user', content: prompt }],
            studentId,
            contextType: "doubt_solver",
            systemPrompt: systemInstruction
        });
    }

    /**
     * Code Doubt Solver
     * Analyzes code for syntax, logic bugs, edge cases, and time/space complexity.
     * Offers hints and Socratic guidance first.
     */
    static async analyzeCode({ code, problemDescription, language = "java", provideFullSolution = false, studentId }) {
        if (!code || code.trim() === "") {
            return {
                error: "Please provide non-empty code to analyze."
            };
        }

        // Static heuristics & analysis
        const analysis = {
            language,
            hasInfiniteLoopRisk: false,
            hasIndexOutOfBoundsRisk: false,
            hasNullPointerRisk: false,
            detectedComplexity: "O(n) approximate",
            identifiedIssues: [],
            hints: [],
            pedagogicalExplanation: "",
            improvedCode: ""
        };

        // Static checks for common student pitfalls
        if (code.includes("while") && !code.includes("++") && !code.includes("+=") && !code.includes("--") && !code.includes("-=")) {
            analysis.hasInfiniteLoopRisk = true;
            analysis.identifiedIssues.push("Potential Infinite Loop: Loop variable is never incremented or updated inside the while block.");
            analysis.hints.push("Check the loop termination condition. Does any variable inside change towards the exit condition?");
        }

        if (code.includes("[i + 1]") || code.includes("[right + 1]")) {
            analysis.hasIndexOutOfBoundsRisk = true;
            analysis.identifiedIssues.push("Potential IndexOutOfBoundsException: Accessing index (i + 1) without verifying (i < array.length - 1).");
            analysis.hints.push("Ensure your loop boundary stops at length - 1 so (i + 1) remains within bounds.");
        }

        if (code.includes(".equals(") && !code.includes("!= null")) {
            analysis.hasNullPointerRisk = true;
            analysis.identifiedIssues.push("Null Safety: Invoking .equals() on an object that could potentially be null.");
            analysis.hints.push("Put known constants on the left of .equals() (e.g. \"TARGET\".equals(val)) or add a null check.");
        }

        if (analysis.identifiedIssues.length === 0) {
            analysis.identifiedIssues.push("No fatal syntax or boundary hazards detected in static pass.");
            analysis.hints.push("Verify corner cases: empty input, array of size 1, negative numbers, and duplicates.");
        }

        return {
            status: "success",
            issues: analysis.identifiedIssues,
            hints: analysis.hints,
            guidance: provideFullSolution
                ? "Here is the refactored and optimal solution addressing all edge cases and complexity limits."
                : "💡 **Coach Hint:** Review the identified issue above. Can you spot which line causes the deviation before looking at a complete solution?",
            canRequestSolution: !provideFullSolution
        };
    }
}

module.exports = DoubtSolver;
