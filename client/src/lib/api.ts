import axios from 'axios';
import type { 
  CandidateProfile, 
  CodingProblem, 
  ProblemsResponse,
  SprintBenchmark, 
  InterviewSession, 
  AdvisorBriefing,
  QuestionFeedback,
  FeedbackResponse,
  CodeSubmission,
  Article,
  AnalyticsProfileResponse,
  AptitudeTopic,
  AptitudeQuestion,
  AptitudeTelemetry,
  AptitudeSessionResponse
} from './types';

const API_BASE = '/api';

export interface AdvisorMessage {
  id?: string;
  sender: 'user' | 'agent';
  content: string;
  provider?: string;
  toolCallsMade?: string[];
  timestamp?: string;
}

export interface AdvisorConversation {
  messages: AdvisorMessage[];
}

export interface AdvisorResponse {
  content: string;
  provider?: string;
  toolCallsMade?: string[];
}

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('strata_has_session');
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath !== '/login' && currentPath !== '/signup' && currentPath !== '/') {
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}&expired=true`;
        }
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Candidate Profile & Telemetry
  getProfile: async (): Promise<CandidateProfile> => {
    const res = await apiClient.get<CandidateProfile>('/candidate/profile');
    return res.data;
  },

  updateProfile: async (updates: Partial<CandidateProfile>): Promise<CandidateProfile> => {
    const res = await apiClient.post<CandidateProfile>('/candidate/profile', updates);
    return res.data;
  },

  // Proactive AI Signal Briefing
  getAdvisorBriefing: async (): Promise<AdvisorBriefing> => {
    const res = await apiClient.get<AdvisorBriefing>('/advisor/briefing');
    return res.data;
  },

  // Coding Proving Ground
  getCodingProblems: async (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    difficulty?: string; 
    company?: string; 
    search?: string; 
  }): Promise<ProblemsResponse> => {
    const res = await apiClient.get<ProblemsResponse>('/compiler/problems', { params });
    return res.data;
  },

  getCodingProblem: async (idOrSlug: string): Promise<CodingProblem> => {
    const res = await apiClient.get<CodingProblem>(`/compiler/problems/${idOrSlug}`);
    return res.data;
  },

  runCode: async (params: { problemId: string; code: string; language: string; customInput?: string }) => {
    const res = await apiClient.post('/compiler/run', params);
    return res.data;
  },

  submitCode: async (params: { problemId: string; code: string; language: string; approachText?: string }) => {
    const res = await apiClient.post('/compiler/submit', params);
    return res.data;
  },

  getProblemSubmissions: async (problemId: string): Promise<CodeSubmission[]> => {
    const res = await apiClient.get<CodeSubmission[]>(`/compiler/submissions/${problemId}`);
    return res.data;
  },

  getProblemHint: async (problemId: string, hintIndex: number): Promise<{ hintIndex: number; totalHints: number; text: string }> => {
    const res = await apiClient.post(`/compiler/problems/${problemId}/hint`, { hintIndex });
    return res.data;
  },

  getProblemEditorial: async (problemId: string, giveUp: boolean = false): Promise<{ unlocked: boolean; editorial: { approach: string; complexity: { time: string; space: string }; code: Record<string, string> }; solvedPrior: boolean; warning?: string }> => {
    const res = await apiClient.get(`/compiler/problems/${problemId}/editorial`, { params: { giveUp } });
    return res.data;
  },

  // Student Suggestions & Question Reviews
  getQuestionFeedback: async (questionId: string): Promise<FeedbackResponse> => {
    const res = await apiClient.get<FeedbackResponse>(`/feedback/${questionId}`);
    return res.data;
  },

  submitQuestionFeedback: async (data: {
    questionId: string;
    type: 'review' | 'suggestion';
    rating?: number;
    text: string;
    category?: string;
  }): Promise<{ success: boolean; feedback: QuestionFeedback }> => {
    const res = await apiClient.post<{ success: boolean; feedback: QuestionFeedback }>('/feedback', data);
    return res.data;
  },

  // Foundations & Sprints
  getSprints: async (): Promise<SprintBenchmark[]> => {
    const res = await apiClient.get<SprintBenchmark[]>('/foundations/sprints');
    return res.data;
  },

  getSprintDetails: async (id: string): Promise<SprintBenchmark> => {
    const res = await apiClient.get<SprintBenchmark>(`/foundations/sprints/${id}`);
    return res.data;
  },

  submitSprintAttempt: async (sprintId: string, answers: Array<{ questionId: string; selectedOption: number; timeSpentSec: number }>) => {
    const res = await apiClient.post(`/foundations/sprints/${sprintId}/submit`, { answers });
    return res.data;
  },

  // Quantitative & Aptitude
  getAptitudeTopics: async (): Promise<AptitudeTopic[]> => {
    const res = await apiClient.get<AptitudeTopic[]>('/foundations/aptitude/topics');
    return res.data;
  },

  getAptitudeQuestions: async (params?: { topic?: string; difficulty?: string; limit?: number }): Promise<AptitudeQuestion[]> => {
    const res = await apiClient.get<AptitudeQuestion[]>('/foundations/aptitude/questions', { params });
    return res.data;
  },

  createAptitudeSession: async (params: {
    topic?: string;
    difficulty?: string;
    limit?: number;
    questionIds?: string[];
    title?: string;
  }): Promise<AptitudeSessionResponse> => {
    const res = await apiClient.post<AptitudeSessionResponse>('/foundations/aptitude/session', params);
    return res.data;
  },

  getAptitudeTelemetry: async (): Promise<AptitudeTelemetry> => {
    const res = await apiClient.get<AptitudeTelemetry>('/foundations/aptitude/telemetry');
    return res.data;
  },

  // Voice Mock Interview Simulation
  startSimulation: async (params: { track: string; persona: string }): Promise<InterviewSession> => {
    const res = await apiClient.post<InterviewSession>('/simulator/start', params);
    return res.data;
  },

  transcribeAudio: async (formData: FormData): Promise<{
    transcript: string;
    rawTranscript: string;
    confidence: number;
    detectedTerms: string[];
    warnings: string[];
    audioDurationSeconds: number;
  }> => {
    const res = await apiClient.post('/simulator/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  respondToSimulation: async (params: {
    sessionId: string;
    responseText: string;
    durationSeconds?: number;
    pauseData?: any;
  }) => {
    const res = await apiClient.post('/simulator/respond', params);
    return res.data;
  },

  requestReevaluation: async (params: {
    sessionId: string;
    questionIndex: number;
    studentNote?: string;
  }) => {
    const res = await apiClient.post('/simulator/reevaluate', params);
    return res.data;
  },

  getSimulationRubrics: async () => {
    const res = await apiClient.get('/simulator/rubrics');
    return res.data;
  },

  // Neural Advisor & Co-Pilot
  getAdvisorConversation: async (mode: string): Promise<AdvisorConversation> => {
    const res = await apiClient.get<AdvisorConversation>('/advisor/conversation', { params: { mode } });
    return res.data;
  },

  clearAdvisorConversation: async (mode: string): Promise<void> => {
    await apiClient.delete('/advisor/conversation', { params: { mode } });
  },

  queryAdvisor: async (params: { query: string; mode?: string }): Promise<AdvisorResponse> => {
    const res = await apiClient.post<AdvisorResponse>('/advisor/query', params);
    return res.data;
  },

  // Technical Journal & High-Velocity Articles
  getArticles: async (params?: { category?: string; tag?: string }): Promise<Article[]> => {
    const res = await apiClient.get<Article[]>('/articles', { params });
    return res.data;
  },

  getArticle: async (slug: string): Promise<Article> => {
    const res = await apiClient.get<Article>(`/articles/${slug}`);
    return res.data;
  },

  // Performance Analytics Dashboard
  getAnalyticsProfile: async (force: boolean = false): Promise<AnalyticsProfileResponse> => {
    const res = await apiClient.get<AnalyticsProfileResponse>('/analytics/profile', {
      params: force ? { force: 'true' } : {}
    });
    return res.data;
  },

  reanalyzeProfile: async (): Promise<AnalyticsProfileResponse> => {
    const res = await apiClient.post<AnalyticsProfileResponse>('/analytics/reanalyze');
    return res.data;
  },

  sendContactMessage: async (payload: { name: string; email: string; message: string; category?: string }): Promise<{ success: boolean; message: string; ticketId?: string; delivery?: 'email' | 'saved' }> => {
    const res = await apiClient.post<{ success: boolean; message: string; ticketId?: string; delivery?: 'email' | 'saved' }>('/contact', payload);
    return res.data;
  }
};


