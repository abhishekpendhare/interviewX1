export interface CandidateProfile {
  studentId: string;
  candidateName: string;
  targetTrack: string;
  primaryLanguage: string;
  hasData: boolean;
  totalSprints: number;
  totalQuestions: number;
  codingSolvedCount: number;
  totalCodeSubmissions?: number;
  placementVelocityIndex: number;
  algorithmicEntropy: number;
  systemsCoreIndex: number;
  quantitativeVelocity: number;
  communicationRating: number;
  velocityStatus: string;
  subjectBreakdown: Record<string, {
    totalEvaluated: number;
    correctCount: number;
    accuracyPct: number;
    avgTimeSec: number;
    rating: string;
  }>;
  topicBreakdown: Record<string, {
    topic: string;
    subject: string;
    totalEvaluated: number;
    accuracyPct: number;
    recentAccuracyPct: number;
    avgTimeSec: number;
    rating: string;
    recurringMistakes: number;
  }>;
  weakVectors: Array<{
    topic: string;
    subject: string;
    totalEvaluated: number;
    accuracyPct: number;
    urgency: string;
    recommendedAction: string;
  }>;
  masteredVectors: Array<{
    topic: string;
    subject: string;
    accuracyPct: number;
    rating: string;
  }>;
  sprintComparison?: {
    previousSprintTitle: string;
    previousAccuracy: number;
    latestSprintTitle: string;
    latestAccuracy: number;
    accuracyDelta: number;
    trajectory: string;
    analysis: string;
  } | null;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  acceptance: string;
  category: string;
  tags: string[];
  companyTags: string[];
  timeLimitMs: number;
  memoryLimitMb: number;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  hintsCount?: number;
  isSolved?: boolean;
}

export interface ProblemsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  totalSolved: number;
  totalCatalog: number;
  categories: string[];
  companies: string[];
  problems: CodingProblem[];
}

export interface SprintQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: string;
  title: string;
  description: string;
  options: string[];
  hints: string[];
}

export interface SprintBenchmark {
  id: string;
  title: string;
  subject: string;
  topic: string;
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  tierLevel: string;
  questions?: SprintQuestion[];
}

export interface InterviewSession {
  sessionId: string;
  track: string;
  persona: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  prompt: string;
  topic: string;
  difficulty: string;
}

export interface InterviewEvaluation {
  technicalScore: number;
  clarityScore: number;
  completenessScore: number;
  feedback: string;
  missedPoints: string[];
}

export interface AdvisorBriefing {
  candidateName: string;
  targetTrack: string;
  placementVelocityIndex: number;
  algorithmicEntropy: number;
  systemsCoreIndex: number;
  quantitativeVelocity: number;
  codingSolvedCount: number;
  headline: string;
  proactiveInsight: string;
  priorityFocusAreas: string[];
  masteredDomains: string[];
  recommendedAction: {
    title: string;
    route: string;
  };
}

export interface QuestionFeedback {
  id: string;
  questionId: string;
  studentId: string;
  studentName: string;
  type: 'review' | 'suggestion';
  rating?: number;
  category: 'clarity' | 'difficulty' | 'alternative_approach' | 'typo' | 'general';
  text: string;
  createdAt: string;
  upvotes?: number;
  isOwnFeedback?: boolean;
}

export interface FeedbackResponse {
  questionId: string;
  totalCount: number;
  totalReviews: number;
  totalSuggestions: number;
  averageRating: number | null;
  ratingCount: number;
  feedback: QuestionFeedback[];
}

export interface CodeSubmission {
  id: string;
  studentId: string;
  problemId: string;
  slug: string;
  problemTitle: string;
  difficulty: string;
  language: string;
  code: string;
  approachText?: string;
  approachReviewed?: boolean;
  approachReview?: {
    matchScore: number;
    alignmentVerdict: string;
    feedback: string;
    timeComplexityStated: string;
    reviewedAt: string;
  };
  status: string;
  runtime: string;
  memory: string;
  passedTestCases: number;
  totalTestCases: number;
  submittedAt: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  author: string;
  readTime: string;
  image: string;
  tags: string[];
  excerpt: string;
  content: string;
}

export interface AnalyticsStrength {
  topic: string;
  score: number;
  evidence: string;
}

export interface AnalyticsWeakness {
  topic: string;
  score: number;
  evidence: string;
  why_it_matters?: string;
}

export interface AnalyticsTopicItem {
  topic: string;
  subject?: string;
  accuracy: number;
  attempts: number;
  avgTimeSec?: number;
  trend: 'up' | 'down' | 'flat';
}

export interface AnalyticsSuggestion {
  title: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  estimated_time: string;
}

export interface AnalyticsTrendPoint {
  id?: string;
  label: string;
  title?: string;
  date: string;
  accuracy: number;
  totalQuestions?: number;
}

export interface AnalyticsProfileResponse {
  hasData: boolean;
  studentId?: string;
  candidateName?: string;
  targetTrack?: string;
  message?: string;
  cached?: boolean;
  updatedAt?: string;
  computedStats?: {
    candidateName?: string;
    targetTrack?: string;
    overallScore: number;
    totalQuestions: number;
    totalCorrect: number;
    overallAccuracy: number;
    codingSolvedCount: number;
    totalCodeSubmissions: number;
    codingAcceptedPct: number;
    mockInterviewCount: number;
    avgTechnicalScore: number;
    avgClarityScore: number;
    roadmapProgressPct: number;
    averageTimePerQuestionSec: number;
    difficultyBreakdown: {
      Easy: number;
      Medium: number;
      Hard: number;
    };
    trendData: AnalyticsTrendPoint[];
    topicBreakdown: AnalyticsTopicItem[];
    strongTopics: AnalyticsStrength[];
    weakTopics: AnalyticsWeakness[];
  };
  analysis?: {
    overall_score: number;
    summary: string;
    strengths: AnalyticsStrength[];
    weaknesses: AnalyticsWeakness[];
    topic_breakdown: AnalyticsTopicItem[];
    suggestions: AnalyticsSuggestion[];
    next_milestone: string;
  };
}

export interface AptitudeTopic {
  id: string;
  title: string;
  name?: string;
  subtopics: string[];
  description: string;
  icon: string;
  color: string;
  questionCount: number;
  difficultyCounts?: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
}

export interface AptitudeQuestion {
  id: string;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  options: string[];
  hints: string[];
}

export interface AptitudeTelemetry {
  hasData: boolean;
  totalAttempts: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracyPct: number;
  averageTimePerQuestionSec: number;
  topicStats: Record<string, { total: number; correct: number }>;
  recentAttempts: Array<{
    attemptId: string;
    testId: string;
    testTitle: string;
    submittedAt: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
    accuracyPct: number;
  }>;
}

export interface AptitudeSessionResponse {
  id: string;
  title: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  totalMarks: number;
  questionCount: number;
  questions: AptitudeQuestion[];
}



