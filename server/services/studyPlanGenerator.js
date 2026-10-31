const db = require('../db/database');
const AnalyticsEngine = require('./analyticsEngine');

/**
 * Study Plan Generator
 * Algorithmic generator producing a structured, adaptive multi-day preparation schedule
 * grounded in the student's identified weak areas, goals, and daily time budget.
 */
class StudyPlanGenerator {
    
    static generatePlan(studentId, preferences = {}) {
        const student = db.getStudentById(studentId);
        const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);

        const targetCompany = preferences.targetCompany || (student ? student.targetCompany : "Tier-1 Product Companies");
        const dailyHours = parseFloat(preferences.dailyHours) || 2.5;
        const durationDays = parseInt(preferences.durationDays, 10) || 7;

        const weakTopics = profile.weakTopics || [];
        const strongTopics = profile.strongTopics || [];

        // Primary focus topics
        const primaryFocus1 = weakTopics[0] ? weakTopics[0].topic : "Dynamic Programming";
        const primarySubject1 = weakTopics[0] ? weakTopics[0].subject : "DSA";

        const primaryFocus2 = weakTopics[1] ? weakTopics[1].topic : "DBMS Normalization & BCNF";
        const primarySubject2 = weakTopics[1] ? weakTopics[1].subject : "DBMS";

        const primaryFocus3 = weakTopics[2] ? weakTopics[2].topic : "Operating Systems & Virtual Memory";
        const primarySubject3 = weakTopics[2] ? weakTopics[2].subject : "Operating Systems";

        const maintainTopic = strongTopics[0] ? strongTopics[0].topic : "Arrays & Two Pointers";

        // Generate 7-day schedule
        const schedule = [
            {
                dayNumber: 1,
                title: `Intensive Concept Mastery: ${primaryFocus1}`,
                focusSubject: primarySubject1,
                focusTopic: primaryFocus1,
                taskType: "concept_learning",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.4),
                practiceQuestionCount: 10,
                description: `Deep-dive into fundamentals, error patterns, and edge cases in ${primaryFocus1}. Address recent mistakes.`,
                isCompleted: false
            },
            {
                dayNumber: 2,
                title: `Targeted Practice & State Transitions: ${primaryFocus1}`,
                focusSubject: primarySubject1,
                focusTopic: primaryFocus1,
                taskType: "problem_solving",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.6),
                practiceQuestionCount: 12,
                description: `Solve 12 curated Medium-to-Hard problems specifically on ${primaryFocus1}. Time each problem.`,
                isCompleted: false
            },
            {
                dayNumber: 3,
                title: `Core Conceptual Revision: ${primaryFocus2}`,
                focusSubject: primarySubject2,
                focusTopic: primaryFocus2,
                taskType: "concept_learning",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.5),
                practiceQuestionCount: 10,
                description: `Review candidate keys, functional dependencies, 3NF vs BCNF decompositions, and SQL query plans.`,
                isCompleted: false
            },
            {
                dayNumber: 4,
                title: `Speed Maintenance & Strong Topic Polish: ${maintainTopic}`,
                focusSubject: "Revision",
                focusTopic: maintainTopic,
                taskType: "speed_drill",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.4),
                practiceQuestionCount: 15,
                description: `Maintain high-speed accuracy in already strong topics (${maintainTopic}). Solve 15 speed problems.`,
                isCompleted: false
            },
            {
                dayNumber: 5,
                title: `System & Infrastructure Deep-Dive: ${primaryFocus3}`,
                focusSubject: primarySubject3,
                focusTopic: primaryFocus3,
                taskType: "concept_learning",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.5),
                practiceQuestionCount: 8,
                description: `Address virtual memory paging, cache invalidation strategies, and TCP handshake edge conditions.`,
                isCompleted: false
            },
            {
                dayNumber: 6,
                title: `Comprehensive Timed Mock Assessment`,
                focusSubject: "Full Assessment",
                focusTopic: "Mixed High-Yield Topics",
                taskType: "timed_mock",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.7),
                practiceQuestionCount: 20,
                description: `Simulate onsite interview pressure with a full 60-minute multi-subject placement screening.`,
                isCompleted: false
            },
            {
                dayNumber: 7,
                title: `Error Log Analysis & Retest Weak Topics`,
                focusSubject: "Retest & Review",
                focusTopic: `${primaryFocus1} & ${primaryFocus2}`,
                taskType: "retest",
                estimatedMinutes: Math.round(dailyHours * 60 * 0.5),
                practiceQuestionCount: 10,
                description: `Verify improvement! Retest problems you missed in earlier tests to measure delta.`,
                isCompleted: false
            }
        ];

        const plan = {
            studentId,
            targetCompany,
            dailyHours,
            durationDays,
            summary: `Personalized ${durationDays}-day sprint targeting ${targetCompany}. Focuses 65% of study bandwidth on identified weak topics (${primaryFocus1}, ${primaryFocus2}) while maintaining ${maintainTopic}.`,
            primaryWeakTopics: [primaryFocus1, primaryFocus2],
            schedule,
            activeDay: 1,
            progressPct: 0
        };

        db.saveStudyPlan(plan);
        return plan;
    }
}

module.exports = StudyPlanGenerator;
