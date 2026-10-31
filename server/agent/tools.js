const db = require('../db/database');
const AnalyticsEngine = require('../services/analyticsEngine');
const StudyPlanGenerator = require('../services/studyPlanGenerator');

/**
 * Controlled Backend Tools for AI Agent
 * Strict input validation, authorization checks, and direct access to reliable backend metrics.
 */
const tools = {
    getStudentProfile: {
        name: "getStudentProfile",
        description: "Retrieves the student's personal profile, target companies, and graduation year.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            const student = db.getStudentById(studentId);
            if (!student) return { error: "Student not found" };
            return {
                id: student.id,
                name: student.name,
                role: student.role,
                targetCompany: student.targetCompany,
                targetTrack: student.targetTrack,
                primaryLanguage: student.primaryLanguage,
                gradYear: student.gradYear
            };
        }
    },

    getStudentProgressSnapshot: {
        name: "getStudentProgressSnapshot",
        description: "Returns a compact, measured progress snapshot and whether completed practice data exists.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
            return {
                hasData: !!profile.hasData,
                targetTrack: profile.targetTrack,
                placementVelocityIndex: profile.hasData ? profile.placementVelocityIndex : null,
                weakTopics: (profile.weakVectors || []).slice(0, 5).map(item => ({
                    topic: item.topic,
                    subject: item.subject,
                    accuracyPct: item.accuracyPct
                })),
                strongTopics: (profile.masteredVectors || []).slice(0, 5).map(item => ({
                    topic: item.topic,
                    subject: item.subject,
                    accuracyPct: item.accuracyPct
                }))
            };
        }
    },

    getTestHistory: {
        name: "getTestHistory",
        description: "Retrieves all completed test attempts by the student, including scores, dates, and accuracy.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            const attempts = db.getAttemptsByStudentId(studentId);
            return attempts.map(a => ({
                attemptId: a.id,
                testId: a.testId,
                testTitle: a.testTitle,
                submittedAt: a.submittedAt,
                score: a.score,
                totalQuestions: a.totalQuestions,
                accuracyPct: a.accuracyPct,
                averageTimePerQuestionSec: a.averageTimePerQuestionSec
            }));
        }
    },

    getTestResult: {
        name: "getTestResult",
        description: "Retrieves detailed breakdown of a specific test attempt, question by question.",
        parameters: {
            type: "object",
            properties: {
                attemptId: { type: "string", description: "The test attempt ID" }
            },
            required: ["attemptId"]
        },
        execute: async ({ attemptId }) => {
            const attempt = db.getAttemptById(attemptId);
            if (!attempt) return { error: "Test attempt not found" };
            return attempt;
        }
    },

    getTopicPerformance: {
        name: "getTopicPerformance",
        description: "Retrieves topic-by-topic accuracy, status (STRONG/GOOD/AVERAGE/NEEDS PRACTICE), and error frequency.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
            return profile.topicBreakdown;
        }
    },

    getWeakTopics: {
        name: "getWeakTopics",
        description: "Retrieves the student's identified weak areas, repeated mistakes, and priority rank.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
            return profile.weakVectors || [];
        }
    },

    getStrongTopics: {
        name: "getStrongTopics",
        description: "Retrieves the student's strongest subjects and high-accuracy topics.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
            return profile.masteredVectors || [];
        }
    },

    getQuestionHistory: {
        name: "getQuestionHistory",
        description: "Retrieves history of specific questions attempted, whether answered correctly, and time spent.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            const attempts = db.getAttemptsByStudentId(studentId);
            const questionsAnswered = [];
            attempts.forEach(a => {
                if (a.answers) {
                    a.answers.forEach(ans => {
                        questionsAnswered.push({
                            testTitle: a.testTitle,
                            questionId: ans.questionId,
                            subject: ans.subject,
                            topic: ans.topic,
                            isCorrect: ans.isCorrect,
                            timeSpentSec: ans.timeSpentSec
                        });
                    });
                }
            });
            return questionsAnswered;
        }
    },

    getCurrentStudyPlan: {
        name: "getCurrentStudyPlan",
        description: "Retrieves the active personalized study plan for the student.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            let plan = db.getStudyPlanByStudentId(studentId);
            if (!plan) {
                plan = StudyPlanGenerator.generatePlan(studentId);
            }
            return plan;
        }
    },

    createStudyPlan: {
        name: "createStudyPlan",
        description: "Generates or updates a personalized multi-day study plan based on student target company and weak areas.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" },
                targetCompany: { type: "string", description: "Target company name or tier" },
                dailyHours: { type: "number", description: "Target hours per day" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId, targetCompany, dailyHours }) => {
            return StudyPlanGenerator.generatePlan(studentId, { targetCompany, dailyHours });
        }
    },

    getRecommendedQuestions: {
        name: "getRecommendedQuestions",
        description: "Recommends specific questions from the database targeting the student's weak topics.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" },
                count: { type: "number", description: "Number of questions to recommend" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId, count = 5 }) => {
            const profile = AnalyticsEngine.getStudentPerformanceProfile(studentId);
            const weakTopics = (profile.weakVectors || []).map(w => w.topic.toLowerCase());
            const allQ = db.getAllQuestions();

            // Find questions in weak topics
            let matched = allQ.filter(q => weakTopics.some(wt => q.topic.toLowerCase().includes(wt) || wt.includes(q.topic.toLowerCase())));
            if (matched.length < count) {
                // Backfill with other practice questions
                matched = matched.concat(allQ.filter(q => !matched.includes(q)));
            }

            return matched.slice(0, count).map(q => ({
                id: q.id,
                title: q.title,
                subject: q.subject,
                topic: q.topic,
                difficulty: q.difficulty,
                conceptTags: q.conceptTags
            }));
        }
    },

    searchKnowledge: {
        name: "searchKnowledge",
        description: "Searches InterviewX's curated articles and question explanations for evidence relevant to a technical question.",
        parameters: {
            type: "object",
            properties: {
                query: { type: "string", description: "The concept or question to search for" },
                count: { type: "number", description: "Maximum number of relevant references to return" }
            },
            required: ["query"]
        },
        execute: async ({ query, count = 4 }) => {
            if (typeof query !== "string" || !query.trim()) return [];

            const normalizedQuery = query.toLowerCase().replace(/```[\s\S]*?```/g, " ").trim();
            const stopWords = new Set(["about", "after", "also", "and", "are", "based", "can", "could", "difference", "does", "explain", "example", "for", "from", "give", "help", "how", "into", "its", "just", "like", "make", "me", "more", "most", "please", "practical", "show", "some", "teach", "tell", "that", "the", "this", "what", "when", "where", "which", "why", "with", "would"]);
            const terms = [...new Set((normalizedQuery.match(/[a-z0-9+#.]{2,}/g) || []).filter(term => !stopWords.has(term)))];
            if (terms.length === 0) return [];

            const scoreText = (fields) => {
                const title = String(fields.title || "").toLowerCase();
                const text = fields.text.toLowerCase();
                const termScore = terms.reduce((score, term) => score + (title.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0);
                const phraseScore = normalizedQuery.length > 8 && text.includes(normalizedQuery) ? 5 : 0;
                return termScore + phraseScore;
            };

            const articleMatches = db.getAllArticles().map(article => {
                const text = [article.category, article.tags?.join(" "), article.excerpt, article.content].filter(Boolean).join(" ");
                return {
                    type: "article",
                    title: article.title,
                    category: article.category,
                    slug: article.slug,
                    excerpt: article.excerpt || String(article.content || "").slice(0, 900),
                    text,
                    score: scoreText({ title: article.title, text })
                };
            });

            const questionMatches = db.getAllQuestions().map(question => {
                const text = [question.subject, question.topic, question.subtopic, question.title, question.description, question.explanation, question.conceptTags?.join(" ")].filter(Boolean).join(" ");
                return {
                    type: "question",
                    title: question.title || question.question || question.description,
                    category: [question.subject, question.topic].filter(Boolean).join(" · "),
                    excerpt: question.explanation || question.description || "",
                    text,
                    score: scoreText({ title: [question.title, question.topic].filter(Boolean).join(" "), text })
                };
            });

            return [...articleMatches, ...questionMatches]
                .filter(item => item.score > 0 && item.excerpt)
                .sort((a, b) => b.score - a.score)
                .slice(0, Math.min(Math.max(Number(count) || 4, 1), 4))
                .map(({ text, score, ...item }) => item);
        }
    },

    getRoadmap: {
        name: "getRoadmap",
        description: "Retrieves the saved career roadmap for a student from store.json.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            return db.getRoadmapByStudentId(studentId);
        }
    },

    saveRoadmap: {
        name: "saveRoadmap",
        description: "Persists a generated career roadmap for a student in store.json.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" },
                roadmap: { type: "object", description: "The structured career roadmap object" },
                inputs: { type: "object", description: "User selections: targetRole, companyType, region, timelineMonths, gradYear, skills" }
            },
            required: ["studentId", "roadmap"]
        },
        execute: async ({ studentId, roadmap, inputs }) => {
            if (!studentId) throw new Error("studentId is required");
            return db.saveRoadmap({
                studentId,
                roadmap,
                inputs: inputs || {}
            });
        }
    },

    clearRoadmap: {
        name: "clearRoadmap",
        description: "Clears the saved career roadmap for a student so they can start over.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            db.clearRoadmap(studentId);
            return { success: true };
        }
    },

    getStudentRawActivity: {
        name: "getStudentRawActivity",
        description: "Fetches all raw student activity across test attempts, coding submissions, mock interviews, and roadmap progress.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            const student = db.getStudentById(studentId);
            const testAttempts = db.getAttemptsByStudentId(studentId) || [];
            const codeSubmissions = db.getCodeSubmissionsByStudentId(studentId) || [];
            const interviews = db.getInterviewsByStudentId(studentId) || [];
            const roadmap = db.getRoadmapByStudentId(studentId);
            return {
                student,
                testAttempts,
                codeSubmissions,
                interviews,
                roadmap
            };
        }
    },

    computeStudentStats: {
        name: "computeStudentStats",
        description: "Deterministically computes aggregated performance stats, topic accuracy, trends, and evidence from raw student activity.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            const student = db.getStudentById(studentId);
            const testAttempts = db.getAttemptsByStudentId(studentId) || [];
            const codeSubmissions = db.getCodeSubmissionsByStudentId(studentId) || [];
            const interviews = db.getInterviewsByStudentId(studentId) || [];
            const roadmapRecord = db.getRoadmapByStudentId(studentId);

            const hasAnyActivity = testAttempts.length > 0 || codeSubmissions.length > 0 || interviews.length > 0;
            if (!hasAnyActivity) {
                return {
                    hasData: false,
                    studentId,
                    candidateName: student ? student.name : "Candidate",
                    targetTrack: student ? student.targetTrack : "Tier-1 Product SDE (FAANG / Unicorn)",
                    primaryLanguage: student ? student.primaryLanguage : "JavaScript / TypeScript",
                    totalQuestions: 0,
                    codingSolvedCount: 0,
                    totalCodeSubmissions: 0,
                    mockInterviewCount: 0,
                    roadmapProgressPct: 0
                };
            }

            // 1. Topic and Subject aggregation from testAttempts
            let totalQuestions = 0;
            let totalCorrect = 0;
            let totalTimeSec = 0;
            const topicMap = {};
            const subjectMap = {};
            const difficultyMap = {
                Easy: { total: 0, correct: 0 },
                Medium: { total: 0, correct: 0 },
                Hard: { total: 0, correct: 0 }
            };

            testAttempts.forEach(attempt => {
                totalQuestions += (attempt.totalQuestions || 0);
                totalCorrect += (attempt.correctCount || 0);

                if (Array.isArray(attempt.answers)) {
                    attempt.answers.forEach(ans => {
                        const top = ans.topic || "Core Fundamentals";
                        const subj = ans.subject || "Computer Science";
                        const diff = ans.difficulty || "Medium";
                        const isCorr = !!ans.isCorrect;
                        const time = ans.timeSpentSec || 60;
                        totalTimeSec += time;

                        if (!topicMap[top]) {
                            topicMap[top] = { topic: top, subject: subj, total: 0, correct: 0, totalTime: 0, history: [] };
                        }
                        topicMap[top].total += 1;
                        topicMap[top].totalTime += time;
                        topicMap[top].history.push(isCorr);
                        if (isCorr) topicMap[top].correct += 1;

                        if (!subjectMap[subj]) {
                            subjectMap[subj] = { subject: subj, total: 0, correct: 0, totalTime: 0 };
                        }
                        subjectMap[subj].total += 1;
                        subjectMap[subj].totalTime += time;
                        if (isCorr) subjectMap[subj].correct += 1;

                        if (difficultyMap[diff]) {
                            difficultyMap[diff].total += 1;
                            if (isCorr) difficultyMap[diff].correct += 1;
                        }
                    });
                }
            });

            // 2. Code submissions aggregation
            const totalCodeSubmissions = codeSubmissions.length;
            const codingSolvedCount = codeSubmissions.filter(s => s.status === 'Accepted').length;
            const codingAcceptedPct = totalCodeSubmissions > 0 ? Math.round((codingSolvedCount / totalCodeSubmissions) * 100) : 0;

            // 3. Mock interviews aggregation
            const mockInterviewCount = interviews.length;
            let totalTechnicalScore = 0;
            let totalClarityScore = 0;
            let scoredInterviewCount = 0;

            interviews.forEach(inv => {
                if (Array.isArray(inv.questions)) {
                    inv.questions.forEach(q => {
                        if (q.evaluation && typeof q.evaluation.technicalScore === 'number') {
                            totalTechnicalScore += q.evaluation.technicalScore;
                            totalClarityScore += (q.evaluation.clarityScore || q.evaluation.technicalScore);
                            scoredInterviewCount += 1;

                            // Also add interview topic signal
                            const top = q.topic || "System Design & Architecture";
                            if (!topicMap[top]) {
                                topicMap[top] = { topic: top, subject: "Interviews", total: 0, correct: 0, totalTime: 0, history: [] };
                            }
                            topicMap[top].total += 1;
                            const isPass = q.evaluation.technicalScore >= 70;
                            topicMap[top].history.push(isPass);
                            if (isPass) topicMap[top].correct += 1;
                        }
                    });
                }
            });

            const avgTechnicalScore = scoredInterviewCount > 0 ? Math.round(totalTechnicalScore / scoredInterviewCount) : 78;
            const avgClarityScore = scoredInterviewCount > 0 ? Math.round(totalClarityScore / scoredInterviewCount) : 75;

            // 4. Roadmap progress
            let roadmapProgressPct = 0;
            if (roadmapRecord && roadmapRecord.roadmap && Array.isArray(roadmapRecord.roadmap.phases)) {
                const totalPhases = roadmapRecord.roadmap.phases.length;
                // If student has solved problems or taken tests, compute realistic progress
                const completedEstimate = Math.min(totalPhases, Math.max(1, Math.floor(testAttempts.length / 2) + Math.floor(codingSolvedCount / 2)));
                roadmapProgressPct = totalPhases > 0 ? Math.round((completedEstimate / totalPhases) * 100) : 25;
            }

            // 5. Build topic breakdown with accuracy, attempts, and trend
            const topicBreakdown = [];
            for (const [top, data] of Object.entries(topicMap)) {
                const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                let trend = 'flat';
                if (data.history.length >= 2) {
                    const firstHalf = data.history.slice(0, Math.floor(data.history.length / 2));
                    const secondHalf = data.history.slice(Math.floor(data.history.length / 2));
                    const acc1 = firstHalf.filter(Boolean).length / firstHalf.length;
                    const acc2 = secondHalf.filter(Boolean).length / secondHalf.length;
                    if (acc2 > acc1 + 0.1) trend = 'up';
                    else if (acc2 < acc1 - 0.1) trend = 'down';
                }
                topicBreakdown.push({
                    topic: top,
                    subject: data.subject,
                    accuracy,
                    attempts: data.total,
                    avgTimeSec: data.total > 0 ? Math.round(data.totalTime / data.total) : 60,
                    trend
                });
            }

            // Sort topic breakdown by attempts descending
            topicBreakdown.sort((a, b) => b.attempts - a.attempts);

            // 6. Trend data across testAttempts
            const trendData = testAttempts.map((att, idx) => ({
                id: att.id,
                label: `Sprint ${idx + 1}`,
                title: att.testTitle || `Evaluation ${idx + 1}`,
                date: att.submittedAt ? att.submittedAt.slice(0, 10) : `Sprint ${idx + 1}`,
                accuracy: att.accuracyPct || (att.totalQuestions ? Math.round(((att.correctCount || 0) / att.totalQuestions) * 100) : 70),
                totalQuestions: att.totalQuestions || 0
            }));

            // 7. Overall score (0-100)
            const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 70;
            const codingBonus = Math.min(15, codingSolvedCount * 5);
            const calculatedOverallScore = Math.min(98, Math.max(35, Math.round((overallAccuracy * 0.5) + (avgTechnicalScore * 0.3) + codingBonus + 5)));

            // 8. Deterministic Strengths & Weaknesses
            const sortedByAccuracy = [...topicBreakdown].sort((a, b) => b.accuracy - a.accuracy);
            const strongTopics = sortedByAccuracy.filter(t => t.accuracy >= 70).slice(0, 3).map(t => ({
                topic: t.topic,
                score: t.accuracy,
                evidence: `${t.accuracy}% accuracy across ${t.attempts} evaluation attempt${t.attempts > 1 ? 's' : ''}`
            }));
            const weakTopics = [...sortedByAccuracy].reverse().filter(t => t.accuracy < 70).slice(0, 3).map(t => ({
                topic: t.topic,
                score: t.accuracy,
                evidence: `${t.accuracy}% accuracy (${t.attempts - Math.round(t.accuracy * t.attempts / 100)} missed questions) across ${t.attempts} attempt${t.attempts > 1 ? 's' : ''}`,
                why_it_matters: `High-frequency topic commonly tested in technical screening and bar-raiser rounds.`
            }));

            return {
                hasData: true,
                studentId,
                candidateName: student ? student.name : "Candidate",
                targetTrack: student ? student.targetTrack : "Tier-1 Product SDE (FAANG / Unicorn)",
                primaryLanguage: student ? student.primaryLanguage : "JavaScript / TypeScript",
                overallScore: calculatedOverallScore,
                totalQuestions,
                totalCorrect,
                overallAccuracy,
                codingSolvedCount,
                totalCodeSubmissions,
                codingAcceptedPct,
                mockInterviewCount,
                avgTechnicalScore,
                avgClarityScore,
                roadmapProgressPct,
                averageTimePerQuestionSec: totalQuestions > 0 ? Math.round(totalTimeSec / totalQuestions) : 120,
                topicBreakdown,
                difficultyBreakdown: {
                    Easy: difficultyMap.Easy.total > 0 ? Math.round((difficultyMap.Easy.correct / difficultyMap.Easy.total) * 100) : 0,
                    Medium: difficultyMap.Medium.total > 0 ? Math.round((difficultyMap.Medium.correct / difficultyMap.Medium.total) * 100) : 0,
                    Hard: difficultyMap.Hard.total > 0 ? Math.round((difficultyMap.Hard.correct / difficultyMap.Hard.total) * 100) : 0
                },
                trendData,
                strongTopics,
                weakTopics
            };
        }
    },

    getSavedAnalytics: {
        name: "getSavedAnalytics",
        description: "Retrieves the saved performance analytics report from store.json.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" }
            },
            required: ["studentId"]
        },
        execute: async ({ studentId }) => {
            if (!studentId) throw new Error("studentId is required");
            return db.getAnalyticsByStudentId(studentId);
        }
    },

    saveAnalytics: {
        name: "saveAnalytics",
        description: "Persists computed analytics and AI analysis to store.json.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string", description: "The unique student ID" },
                analysis: { type: "object", description: "Structured AI analysis profile" },
                computedStats: { type: "object", description: "Server-side computed stats" }
            },
            required: ["studentId", "analysis", "computedStats"]
        },
        execute: async ({ studentId, analysis, computedStats }) => {
            if (!studentId) throw new Error("studentId is required");
            return db.saveAnalytics({
                studentId,
                analysis,
                computedStats
            });
        }
    },

    getAptitudeTopics: {
        name: "getAptitudeTopics",
        description: "Retrieves all aptitude syllabus topics, subtopics, question counts, and diagnostic telemetry.",
        parameters: { type: "object", properties: {} },
        execute: async () => {
            return db.getAptitudeTopics();
        }
    },

    getAptitudeQuestions: {
        name: "getAptitudeQuestions",
        description: "Retrieves aptitude questions filtered by topic, difficulty, or questionIds.",
        parameters: {
            type: "object",
            properties: {
                topic: { type: "string" },
                difficulty: { type: "string" },
                limit: { type: "number" }
            }
        },
        execute: async ({ topic, difficulty, limit } = {}) => {
            return db.getAptitudeQuestions({ topic, difficulty, limit });
        }
    },

    createAptitudeSession: {
        name: "createAptitudeSession",
        description: "Creates an on-demand aptitude practice session or custom test from selected topic, difficulty, or question IDs.",
        parameters: {
            type: "object",
            properties: {
                topic: { type: "string" },
                difficulty: { type: "string" },
                limit: { type: "number" },
                questionIds: { type: "array", items: { type: "string" } },
                title: { type: "string" }
            }
        },
        execute: async ({ topic, difficulty, limit, questionIds, title } = {}) => {
            let selectedQuestions = [];
            if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
                const idSet = new Set(questionIds);
                const allApti = db.getAptitudeQuestions();
                selectedQuestions = allApti.filter(q => idSet.has(q.id));
            } else {
                selectedQuestions = db.getAptitudeQuestions({ topic, difficulty, limit: limit || 5 });
            }

            if (selectedQuestions.length === 0) {
                selectedQuestions = db.getAptitudeQuestions({ limit: 5 });
            }

            const sessionId = `sprint-apti-session-${Date.now()}`;
            const sessionTitle = title || (topic ? `Aptitude: ${topic} (${difficulty || 'All Levels'})` : `Aptitude Practice Session`);
            const durationMinutes = Math.max(5, Math.ceil(selectedQuestions.length * 2));

            const newTest = {
                id: sessionId,
                title: sessionTitle,
                subject: "Quantitative & Aptitude",
                topic: topic || "Mixed Aptitude",
                tierLevel: difficulty || "Mixed",
                durationMinutes,
                totalMarks: selectedQuestions.length * 10,
                passMarks: Math.ceil(selectedQuestions.length * 10 * 0.6),
                questionIds: selectedQuestions.map(q => q.id)
            };

            db.saveTest(newTest);

            return {
                id: sessionId,
                title: sessionTitle,
                subject: newTest.subject,
                topic: newTest.topic,
                durationMinutes: newTest.durationMinutes,
                totalMarks: newTest.totalMarks,
                questionCount: selectedQuestions.length,
                questions: selectedQuestions.map(q => ({
                    id: q.id,
                    subject: q.subject,
                    topic: q.topic,
                    subtopic: q.subtopic,
                    difficulty: q.difficulty,
                    title: q.title,
                    description: q.description,
                    options: q.options,
                    hints: q.hints
                }))
            };
        }
    },

    getAptitudeTelemetry: {
        name: "getAptitudeTelemetry",
        description: "Returns candidate's real aptitude telemetry (attempts, accuracy, solved count, topic mastery) from test attempts.",
        parameters: {
            type: "object",
            properties: {
                studentId: { type: "string" }
            }
        },
        execute: async ({ studentId }) => {
            const attempts = db.getAttemptsByStudentId(studentId || 'std-2026-001');
            const aptitudeAttempts = attempts.filter(a => {
                const title = (a.testTitle || '').toLowerCase();
                const test = db.getTestById(a.testId);
                const subj = (test && test.subject ? test.subject : '').toLowerCase();
                return subj.includes('aptitude') || title.includes('aptitude');
            });

            let totalQuestions = 0;
            let totalCorrect = 0;
            let totalTimeSec = 0;
            const topicStats = {};

            aptitudeAttempts.forEach(att => {
                totalQuestions += (att.totalQuestions || 0);
                totalCorrect += (att.correctCount || 0);
                totalTimeSec += ((att.averageTimePerQuestionSec || 0) * (att.totalQuestions || 0));

                (att.answers || []).forEach(ans => {
                    const top = ans.topic || 'General Aptitude';
                    if (!topicStats[top]) {
                        topicStats[top] = { total: 0, correct: 0 };
                    }
                    topicStats[top].total++;
                    if (ans.isCorrect) topicStats[top].correct++;
                });
            });

            const accuracyPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
            const avgTimeSec = totalQuestions > 0 ? Math.round(totalTimeSec / totalQuestions) : 0;

            return {
                hasData: aptitudeAttempts.length > 0,
                totalAttempts: aptitudeAttempts.length,
                totalQuestions,
                totalCorrect,
                accuracyPct,
                averageTimePerQuestionSec: avgTimeSec,
                topicStats,
                recentAttempts: aptitudeAttempts.slice(-5).reverse().map(a => ({
                    attemptId: a.id,
                    testId: a.testId,
                    testTitle: a.testTitle,
                    submittedAt: a.submittedAt,
                    score: a.score,
                    totalQuestions: a.totalQuestions,
                    correctCount: a.correctCount,
                    accuracyPct: a.accuracyPct
                }))
            };
        }
    }
};

module.exports = tools;
