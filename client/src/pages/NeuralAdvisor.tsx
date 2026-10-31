import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUp,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  Code2,
  Compass,
  LoaderCircle,
  MessageSquareText,
  RotateCcw,
  Sparkles,
  Terminal,
  User,
} from 'lucide-react';
import { api, type AdvisorConversation, type AdvisorMessage } from '@/lib/api';
import { MarkdownContent } from '@/components/ui/MarkdownContent';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

type AdvisorMode = 'live_query' | 'code_audit' | 'concept_decompiler' | 'placement_strategy';

const modes: { id: AdvisorMode; label: string; detail: string; icon: typeof Terminal; prompt: string; placeholder: string }[] = [
  { id: 'live_query', label: 'Ask a question', detail: 'Algorithms, systems, CS', icon: Terminal, prompt: 'Explain the difference between a process and a thread, with a practical example.', placeholder: 'Ask about algorithms, databases, operating systems, or system design…' },
  { id: 'code_audit', label: 'Review code', detail: 'Complexity and edge cases', icon: Code2, prompt: 'Review this function for correctness, complexity, and edge cases:\n```js\nfunction example(items) {\n  return items;\n}\n```', placeholder: 'Paste code and include its expected behavior and constraints…' },
  { id: 'concept_decompiler', label: 'Learn a concept', detail: 'Step-by-step explanation', icon: BookOpen, prompt: 'Teach me database indexes with an example, then give me one check question.', placeholder: 'Which concept would you like explained from intuition to example?' },
  { id: 'placement_strategy', label: 'Plan my practice', detail: 'Your next focused step', icon: Compass, prompt: 'Based on my saved practice data, what should I focus on this week?', placeholder: 'Ask for a practice plan or a recommendation for your next session…' },
];

const conversationKey = (mode: AdvisorMode) => ['advisor-conversation', mode] as const;

function welcomeMessage(mode: AdvisorMode) {
  if (mode === 'code_audit') return 'Paste a code snippet with its language, expected behavior, and constraints. I’ll organize the review around correctness, complexity, and edge cases.';
  if (mode === 'concept_decompiler') return 'Name a concept and I’ll start with the intuition, walk through an example, and finish with the details interviewers often ask about.';
  if (mode === 'placement_strategy') return 'Ask for a next step or a study plan. When saved practice data is available, I’ll use it to tailor the recommendation.';
  return 'Ask a technical question. I can explain algorithms and core CS topics, and use the InterviewX study library when it has a relevant reference.';
}

function describeSources(toolCallsMade: string[] = []) {
  const labels: string[] = [];
  if (toolCallsMade.includes('searchKnowledge')) labels.push('InterviewX study library');
  if (toolCallsMade.some(tool => ['getStudentProgressSnapshot', 'getWeakTopics', 'getRecommendedQuestions'].includes(tool))) labels.push('saved practice results');
  return labels;
}

export default function NeuralAdvisor() {
  const { user } = useAuth();
  const [mode, setMode] = useState<AdvisorMode>('live_query');
  const [inputQuery, setInputQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const selectedMode = modes.find(item => item.id === mode) ?? modes[0];
  const activeConversationKey = conversationKey(mode);

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: api.getProfile, enabled: !!user });
  const conversationQuery = useQuery({
    queryKey: activeConversationKey,
    queryFn: () => api.getAdvisorConversation(mode),
    enabled: !!user,
    staleTime: 0,
  });
  const messages = conversationQuery.data?.messages ?? [];

  const queryMutation = useMutation({
    mutationFn: ({ query, selectedMode }: { query: string; selectedMode: AdvisorMode }) => api.queryAdvisor({ query, mode: selectedMode }),
    onMutate: async ({ query, selectedMode }) => {
      const key = conversationKey(selectedMode);
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<AdvisorConversation>(key, current => ({
        messages: [...(current?.messages ?? []), {
          id: `local-${Date.now()}`,
          sender: 'user',
          content: query,
          timestamp: new Date().toISOString(),
        }],
      }));
      return { key, selectedMode };
    },
    onSuccess: (response, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData<AdvisorConversation>(context.key, current => ({
        messages: [...(current?.messages ?? []), { ...response, sender: 'agent', timestamp: new Date().toISOString() }],
      }));
    },
    onError: (error, _variables, context) => {
      if (!context) return;
      const serverMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
      queryClient.setQueryData<AdvisorConversation>(context.key, current => ({
        messages: [...(current?.messages ?? []), {
          id: `error-${Date.now()}`,
          sender: 'agent',
          content: serverMessage || 'I couldn’t complete that response. Please try again in a moment.',
          provider: 'Connection notice',
        }],
      }));
    },
  });

  const clearMutation = useMutation({
    mutationFn: (selectedMode: AdvisorMode) => api.clearAdvisorConversation(selectedMode),
    onSuccess: (_result, clearedMode) => queryClient.setQueryData<AdvisorConversation>(conversationKey(clearedMode), { messages: [] }),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, queryMutation.isPending, mode]);

  const sendQuery = () => {
    const query = inputQuery.trim();
    if (!query || queryMutation.isPending || query.length > 4000) return;
    setInputQuery('');
    queryMutation.mutate({ query, selectedMode: mode });
  };

  const submitPrompt = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendQuery();
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      sendQuery();
    }
  };

  const setSuggestion = (prompt: string) => {
    setInputQuery(prompt);
    inputRef.current?.focus();
  };

  const visibleMessages = messages.length > 0 ? messages : [];
  const pendingForThisMode = queryMutation.isPending && queryMutation.variables?.selectedMode === mode;

  return (
    <section className="relative flex-1 overflow-hidden bg-[#0B1020] px-4 pb-28 pt-6 text-slate-100 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="advisor-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
              InterviewX AI Coach
            </div>
            <h1 id="advisor-title" className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">A clearer next step for every interview question.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Get a technical walkthrough, a structured code review, or practice guidance grounded in your saved progress when available.</p>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-slate-400 shadow-lg shadow-black/10">
            <BrainCircuit aria-hidden="true" className="h-4 w-4 text-cyan-300" />
            <span className="text-slate-300">Target track</span>
            <span className="max-w-44 truncate font-medium text-violet-200">{profile?.targetTrack || 'Software engineering interviews'}</span>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Choose a coaching mode">
          {modes.map(item => {
            const Icon = item.icon;
            const active = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(item.id)}
                className={`min-h-[76px] rounded-2xl border px-3 py-3 text-left transition-[border-color,background-color,box-shadow,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${active ? 'border-violet-300/40 bg-gradient-to-br from-violet-500/15 to-cyan-400/[0.07] text-white shadow-[0_8px_28px_rgba(65,68,190,0.12)]' : 'border-white/10 bg-[#10172D]/70 text-slate-300 hover:border-white/20 hover:bg-white/[0.06]'}`}
              >
                <span className="flex items-center gap-2 text-xs font-semibold sm:text-sm"><Icon aria-hidden="true" className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-300' : 'text-violet-300'}`} />{item.label}</span>
                <span className="mt-1.5 block pl-6 text-[10px] leading-4 text-slate-500 sm:text-[11px]">{item.detail}</span>
              </button>
            );
          })}
        </div>

        <section className="flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#10172D]/75 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl" aria-label="Advisor conversation">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><MessageSquareText aria-hidden="true" className="h-4 w-4" /></span>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-100">{selectedMode.label}</p><p className="text-[11px] text-slate-500">Your conversation is saved by coaching mode</p></div>
            </div>
            <button
              type="button"
              onClick={() => clearMutation.mutate(mode)}
              disabled={clearMutation.isPending || queryMutation.isPending || (messages.length === 0 && !conversationQuery.isError)}
              className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium text-slate-400 transition-[color,border-color,background-color] hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              aria-label={`Clear ${selectedMode.label.toLowerCase()} conversation`}
            >
              {clearMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">New chat</span>
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6" role="log" aria-live="polite" aria-relevant="additions text">
            {conversationQuery.isLoading && messages.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-violet-300" />Loading this conversation…</div>
            )}

            {!conversationQuery.isLoading && visibleMessages.length === 0 && (
              <div className="mx-auto flex min-h-[220px] max-w-2xl flex-col items-center justify-center py-8 text-center">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-violet-400/15 to-cyan-400/10 text-cyan-200"><Bot aria-hidden="true" className="h-6 w-6" /></span>
                <h2 className="text-lg font-semibold text-white">Let’s work through it together.</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">{welcomeMessage(mode)}</p>
              </div>
            )}

            {visibleMessages.map((message: AdvisorMessage, index: number) => {
              const isUser = message.sender === 'user';
              return (
                <article key={message.id || `${message.timestamp || 'message'}-${index}`} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200"><Bot aria-hidden="true" className="h-4 w-4" /></span>}
                  <div className={`min-w-0 max-w-[min(100%,54rem)] rounded-2xl border px-4 py-3 shadow-sm ${isUser ? 'border-violet-300/20 bg-violet-500/[0.12] text-slate-100' : 'border-white/[0.08] bg-[#0B1020]/80 text-slate-300'}`}>
                    <div className="mb-1.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500"><span>{isUser ? 'You' : 'InterviewX Coach'}</span>{message.timestamp && <time dateTime={message.timestamp}>{new Date(message.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>}</div>
                    <MarkdownContent content={message.content} className="text-[13px] sm:text-sm" />
                    {(message.provider || !!message.toolCallsMade?.length) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-2.5 text-[10px] text-slate-500">
                        <Sparkles aria-hidden="true" className="h-3 w-3 text-cyan-300" />
                        {message.provider && <span>{message.provider}</span>}
                        {describeSources(message.toolCallsMade).map(source => <span key={source} className="rounded-full border border-white/10 px-2 py-0.5 text-slate-400">{source}</span>)}
                      </div>
                    )}
                  </div>
                  {isUser && <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-300"><User aria-hidden="true" className="h-4 w-4" /></span>}
                </article>
              );
            })}

            {pendingForThisMode && <div className="flex items-center gap-3 text-sm text-slate-400"><span className="grid h-8 w-8 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200"><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /></span>Thinking through your question…</div>}
            <div ref={bottomRef} />
          </div>

          {!user ? (
            <div className="border-t border-white/[0.08] bg-black/20 p-6 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-300">
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Sign in to consult the Neural Technical Advisor and save your personalized coaching history.</span>
              </div>
              <div className="flex items-center justify-center gap-3 pt-1">
                <Link
                  to="/login?redirect=/advisor"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 text-xs sm:text-sm font-semibold text-[#080e1d] hover:brightness-110 transition-all shadow-lg shadow-violet-900/20"
                >
                  <span>Sign In to Chat</span>
                  <ArrowUp className="w-3.5 h-3.5 rotate-45" />
                </Link>
                <Link
                  to="/signup?redirect=/advisor"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors"
                >
                  <span>Create Account</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-t border-white/[0.08] bg-black/10 px-4 py-4 sm:px-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Try asking</span>
                {[selectedMode.prompt, mode === 'placement_strategy' ? 'Make the plan fit a 30-minute study session.' : 'Give me a small example and one practice question.'].map((prompt, index) => (
                  <button key={`${mode}-${index}`} type="button" onClick={() => setSuggestion(prompt)} className="min-h-9 max-w-full truncate rounded-full border border-white/10 bg-white/[0.03] px-3 text-[11px] text-slate-400 transition-[color,border-color,background-color] hover:border-violet-300/30 hover:bg-violet-300/[0.08] hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{index === 0 ? 'Suggested prompt' : index === 1 ? 'Add an example' : prompt}</button>
                ))}
              </div>

              <form onSubmit={submitPrompt} className="flex items-end gap-2 rounded-2xl border border-white/10 bg-[#0B1020] p-2 focus-within:border-violet-300/40 focus-within:ring-2 focus-within:ring-violet-400/10">
                <label htmlFor="advisor-input" className="sr-only">Your question for the InterviewX AI Coach</label>
                <textarea
                  ref={inputRef}
                  id="advisor-input"
                  rows={2}
                  maxLength={4000}
                  value={inputQuery}
                  onChange={event => setInputQuery(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder={selectedMode.placeholder}
                  disabled={queryMutation.isPending}
                  className="max-h-40 min-h-12 flex-1 resize-y bg-transparent px-2 py-2 text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-600 disabled:opacity-60"
                />
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className={`text-[10px] tabular-nums ${inputQuery.length > 3800 ? 'text-amber-300' : 'text-slate-600'}`}>{inputQuery.length}/4000</span>
                  <button
                    type="submit"
                    disabled={queryMutation.isPending || !inputQuery.trim() || inputQuery.length > 4000}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 text-sm font-semibold text-[#080e1d] shadow-lg shadow-violet-900/20 transition-[transform,filter,box-shadow] hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {queryMutation.isPending ? <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" /> : <ArrowUp aria-hidden="true" className="h-4 w-4" />}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </form>
              <p className="mt-2 px-1 text-[10px] text-slate-600"><Check aria-hidden="true" className="mr-1 inline h-3 w-3 text-cyan-400" />Enter to send · Shift+Enter for a new line · Answers may need verification</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
