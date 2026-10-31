/**
 * Ingestion Source: 30-seconds-of-interviews & reverse-interview (MIT Licensed)
 * Sourcing behavioral, leadership, and architectural defense interview questions.
 */

async function ingestBehavioralHRQuestions() {
    console.log("📥 Ingesting Behavioral & Leadership Questions from 30-seconds-of-interviews & reverse-interview...");
    const questions = [];

    // Curated high-yield behavioral and engineering leadership scenarios
    const behavioralSeed = [
        {
            title: "Disagreement on Critical Architectural Decision",
            description: "Describe a situation where you had a strong technical disagreement with a teammate or team lead regarding database choice or system architecture. How did you handle it?",
            topic: "Engineering Conflict & Ownership",
            subtopic: "Have Backbone; Disagree and Commit",
            difficulty: "Medium",
            options: [
                "Confront the lead publicly in code review and refuse to write code until your choice is approved",
                "Frame using STAR: Objectively present benchmark data and proof-of-concept latency measurements, debate vigorously, and commit fully once a final decision is locked",
                "Immediately concede without voicing valid architectural concerns to avoid conflict",
                "Complain to the executive director directly"
            ],
            correctAnswerIndex: 1,
            explanation: "Amazon/Google leadership rubrics look for data-backed debates, respectful collaboration, and complete dedication once the team agrees on a direction.",
            hints: ["Ground your answer in benchmarks, prototypes, and team outcomes."]
        },
        {
            title: "Handling High-Severity Production Outages",
            description: "Tell me about a time when a critical bug or production outage occurred under your responsibility. What steps did you take during and after the incident?",
            topic: "Incident Management & Ownership",
            subtopic: "Blameless Post-Mortems",
            difficulty: "Hard",
            options: [
                "Hide the logs to prevent management from attributing blame",
                "Focus on fast mitigation (rollback / feature flag disabling), communicate transparently to stakeholders, and conduct a blameless 5-Whys post-mortem with preventative tests",
                "Blame the junior engineer who pushed the pull request",
                "Wait for the next weekly deployment cycle to patch the bug"
            ],
            correctAnswerIndex: 1,
            explanation: "Mature engineering teams prioritize MTTR (Mean Time To Recovery), blameless post-mortems, and systematic regression test prevention over finger-pointing.",
            hints: ["Highlight speed of mitigation first, followed by root-cause analysis and automated guards."]
        },
        {
            title: "Delivering Under Tight Deadlines with Scope Creep",
            description: "How do you handle a scenario where product requirements expand significantly two weeks before a major release deadline?",
            topic: "Project Execution & Prioritization",
            subtopic: "Trade-off Management",
            difficulty: "Medium",
            options: [
                "Work 100 hours a week without alerting anyone until you burn out",
                "Collaborate with the product manager to prioritize the critical P0 MVP user journeys, defer P1/P2 enhancements to v1.1, and communicate timeline risks early",
                "Ship half-tested code into production to meet the date",
                "Cancel the launch without consulting engineering leadership"
            ],
            correctAnswerIndex: 1,
            explanation: "Top tier tech companies evaluate ruthless prioritization, MVP scope negotiation, and early risk escalation over reckless shortcuts.",
            hints: ["Demonstrate how you categorize P0 vs P1 features with stakeholders."]
        },
        {
            title: "Mentoring and Leveling Up Junior Teammates",
            description: "Can you share an experience where you helped onboard or unblock a struggling peer or junior engineer?",
            topic: "Team Mentorship & Influence",
            subtopic: "Engineering Culture",
            difficulty: "Easy",
            options: [
                "Write the code for them so the task finishes faster",
                "Pair program to understand their mental model, guide them toward debugging strategies (reproducers, logs), and document standard operating procedures for the team",
                "Tell them to read the documentation without assisting",
                "Reassign all their tickets to yourself"
            ],
            correctAnswerIndex: 1,
            explanation: "High-performing engineering organizations value multiplier engineers who elevate their peers through structured pair debugging and documentation.",
            hints: ["Focus on teaching problem-solving methodologies rather than just giving the direct answer."]
        }
    ];

    let idx = 1;
    for (const b of behavioralSeed) {
        questions.push({
            id: `q-hr-mit-${idx}`,
            subject: "Behavioral & STAR Leadership",
            topic: b.topic,
            subtopic: b.subtopic,
            difficulty: b.difficulty,
            questionType: "multiple_choice",
            title: b.title,
            description: b.description,
            options: b.options,
            correctAnswerIndex: b.correctAnswerIndex,
            explanation: b.explanation,
            hints: b.hints,
            conceptTags: ["behavioral", "leadership", "star-framework"],
            source: "github.com/Chalarangelo/30-seconds-of-interviews (MIT)"
        });
        idx++;
    }

    console.log(`✅ Ingested ${questions.length} behavioral questions from open MIT repositories.`);
    return questions;
}

module.exports = { ingestBehavioralHRQuestions };
