import { useState, useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Square, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Award, 
  RefreshCw, 
  Terminal, 
  Activity, 
  Layers,
  ArrowRight,
  Clock,
  RotateCcw,
  HelpCircle,
  FileText,
  Gauge,
  MessageSquare,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';
import { api } from '@/lib/api';

export default function VoiceSimulator() {
  const queryClient = useQueryClient();

  const [selectedTrack, setSelectedTrack] = useState('Technical');
  const [selectedPersona, setSelectedPersona] = useState('Staff SDE & Bar Raiser');
  const [session, setSession] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingTTS, setIsSpeakingTTS] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [pushToTalkEnabled, setPushToTalkEnabled] = useState(false);
  
  // Audio & Mic Level state
  const [micLevel, setMicLevel] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  
  // Transcript & Review state
  const [answerText, setAnswerText] = useState('');
  const [interimSpeech, setInterimSpeech] = useState('');
  const [isReviewStep, setIsReviewStep] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionMetadata, setTranscriptionMetadata] = useState<{
    confidence?: number;
    detectedTerms?: string[];
    warnings?: string[];
    provider?: string;
  }>({});

  // History & Reports
  const [evaluationHistory, setEvaluationHistory] = useState<any[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
  const [finalReport, setFinalReport] = useState<any>(null);

  // Re-evaluation modal state
  const [reevalIndex, setReevalIndex] = useState<number | null>(null);
  const [reevalNote, setReevalNote] = useState('');
  const [reevalStatus, setReevalStatus] = useState<string | null>(null);

  // Audio recording refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initialize Web Speech API for real-time live caption preview
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (final) {
          setAnswerText(prev => prev ? `${prev.trim()} ${final.trim()}` : final.trim());
          setInterimSpeech('');
        } else {
          setInterimSpeech(interim);
        }
      };

      recog.onend = () => {
        // Recognition ended; handled cleanly by MediaRecorder
      };

      recog.onerror = (err: any) => {
        console.warn("Speech recognition notice:", err.error || err);
      };

      recognitionRef.current = recog;
    }
  }, []);

  // Text-To-Speech Synthesizer
  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingTTS(true);
    utterance.onend = () => setIsSpeakingTTS(false);
    utterance.onerror = () => setIsSpeakingTTS(false);
    window.speechSynthesis.speak(utterance);
  };

  // Start Simulation Mutation
  const startMutation = useMutation({
    mutationFn: () => api.startSimulation({ track: selectedTrack, persona: selectedPersona }),
    onSuccess: (data: any) => {
      setSession(data);
      setEvaluationHistory([]);
      setDeliveryHistory([]);
      setFinalReport(null);
      setAnswerText('');
      setInterimSpeech('');
      setIsReviewStep(false);
      setTimerSeconds(0);
      speakText(data.prompt);
    }
  });

  // Submit Answer Mutation
  const respondMutation = useMutation({
    mutationFn: (payload: { answerSubmission: string; duration: number }) => api.respondToSimulation({
      sessionId: session?.sessionId || session?.interviewId,
      responseText: payload.answerSubmission,
      durationSeconds: payload.duration
    }),
    onSuccess: (data: any) => {
      if (data.evaluation) {
        setEvaluationHistory(prev => [...prev, data.evaluation]);
      }
      if (data.delivery) {
        setDeliveryHistory(prev => [...prev, data.delivery]);
      }

      if (data.isCompleted) {
        setFinalReport(data.finalReport);
        setSession(null);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        const nextPrompt = data.followUp || data.nextQuestion;
        setSession((prev: any) => ({
          ...prev,
          prompt: nextPrompt,
          currentQuestionIndex: data.currentQuestionIndex
        }));
        speakText(nextPrompt);
      }

      setAnswerText('');
      setInterimSpeech('');
      setIsReviewStep(false);
      setTimerSeconds(0);
    }
  });

  // Re-evaluation Mutation
  const reevalMutation = useMutation({
    mutationFn: (payload: { questionIndex: number; note: string }) => api.requestReevaluation({
      sessionId: session?.sessionId || session?.interviewId || (finalReport && session?.id),
      questionIndex: payload.questionIndex,
      studentNote: payload.note
    }),
    onSuccess: (data: any) => {
      setReevalStatus(data.message || "Re-evaluation request submitted successfully.");
      setTimeout(() => {
        setReevalIndex(null);
        setReevalNote('');
        setReevalStatus(null);
      }, 2500);
    }
  });

  // 2. Audio Meter & Recording Start
  const startRecordingAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // AudioContext & Analyser for real mic level meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let silenceCounter = 0;

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicLevel(normalized);

        // Pause timeout check: ~3 seconds of low volume
        if (normalized < 6) {
          silenceCounter += 0.05;
          if (silenceCounter >= 3.2 && timerSeconds > 4) {
            // Silence pause detected: auto finalize recording to review
            stopRecordingAudio();
            return;
          }
        } else {
          silenceCounter = 0;
        }

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // MediaRecorder for server-side audio processing
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioTranscribe(audioBlob);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;

      // Start Web Speech live caption preview
      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }

      setIsRecording(true);
      setTimerSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Microphone access denied or unsupported:", err);
      alert("Microphone access is required for voice interview mode. Please grant microphone permissions or type your answer.");
    }
  };

  // Stop Recording Audio & Send to Transcribe Review
  const stopRecordingAudio = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setMicLevel(0);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }

    setIsRecording(false);
  };

  // Send Audio to Server Transcription with Vocabulary Hints
  const handleAudioTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('fallbackTranscript', answerText);
      formData.append('audioDurationSeconds', timerSeconds.toString());

      const data = await api.transcribeAudio(formData);
      if (data.transcript) {
        setAnswerText(data.transcript);
      }
      setTranscriptionMetadata({
        confidence: data.confidence,
        detectedTerms: data.detectedTerms,
        warnings: data.warnings,
        provider: (data as any).provider
      });
      setIsReviewStep(true);
    } catch (err) {
      console.warn("Server audio transcription fallback to client text:", err);
      setIsReviewStep(true);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Confirm Transcript & Submit for Mark Evaluation
  const handleConfirmAndEvaluate = () => {
    const finalAnswer = answerText.trim();
    if (!finalAnswer) return;
    respondMutation.mutate({
      answerSubmission: finalAnswer,
      duration: timerSeconds
    });
  };

  // Re-record Answer
  const handleReRecord = () => {
    setAnswerText('');
    setInterimSpeech('');
    setIsReviewStep(false);
    setTranscriptionMetadata({});
    setTimerSeconds(0);
    startRecordingAudio();
  };

  return (
    <section className="relative flex-1 overflow-hidden bg-[#0B1020] px-4 pb-32 pt-6 text-slate-100 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="simulator-title">
      <div aria-hidden="true" className="pointer-events-none absolute -left-48 -top-40 h-[30rem] w-[30rem] rounded-full bg-violet-600/10 blur-[110px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-48 top-32 h-[28rem] w-[28rem] rounded-full bg-cyan-500/[0.07] blur-[120px]" />
      
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/[0.08] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-200">
              <Mic aria-hidden="true" className="h-3.5 w-3.5 text-cyan-300" />
              <span>Evidence-Based Voice Interview Bar Raiser</span>
            </div>
            <h1 id="simulator-title" className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Real-Time AI Mock Interview Booth
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Rigorous rubric scoring calculated in code from confirmed speech evidence. No LLM grade typing. Delivery analyzed advisory-only.
            </p>
          </div>

          {/* Controls: Voice & Push-to-Talk */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs">
              <label htmlFor="ptt-checkbox" className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  id="ptt-checkbox"
                  type="checkbox"
                  checked={pushToTalkEnabled}
                  onChange={(e) => setPushToTalkEnabled(e.target.checked)}
                  className="rounded border-white/20 bg-slate-900 text-cyan-400 focus:ring-cyan-300"
                />
                <span>Push-To-Talk Mode</span>
              </label>
            </div>

            <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                aria-pressed={voiceEnabled}
                className="flex min-h-9 items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                {voiceEnabled ? <Volume2 aria-hidden="true" className="h-4 w-4 text-cyan-300" /> : <VolumeX aria-hidden="true" className="h-4 w-4 text-slate-500" />}
                <span>Voice {voiceEnabled ? 'on' : 'off'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Setup Screen */}
        {!session && !finalReport && (
          <div className="mx-auto w-full max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#151C35] via-[#10172D] to-[#101D30] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
            <div className="border-b border-white/10 pb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Session Calibration</div>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Select Practice Track & Interviewer Persona</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">Questions evaluate against structured rubrics with mandatory transcript evidence verification.</p>
            </div>

            <div className="space-y-4">
              <fieldset>
                <legend className="mb-2 block text-sm font-medium text-slate-300">Interview Track</legend>
                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  {['Technical', 'DSA', 'DBMS', 'HR'].map(t => (
                    <button
                      key={t}
                      onClick={() => setSelectedTrack(t)}
                      aria-pressed={selectedTrack === t}
                      className={`min-h-12 rounded-xl border px-3 py-3 text-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                        selectedTrack === t
                          ? 'border-violet-300/30 bg-violet-400/[0.12] text-violet-100 shadow-md shadow-violet-950/30'
                          : 'border-white/10 bg-[#0B1020]/55 text-slate-400 hover:border-violet-300/25 hover:bg-white/[0.04] hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="interviewer-persona" className="mb-2 block text-sm font-medium text-slate-300">Interviewer Persona</label>
                <select
                  id="interviewer-persona"
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-[#0B1020]/70 px-3 py-2.5 text-sm text-slate-200 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                >
                  <option value="Staff SDE & Bar Raiser">Staff SDE & Bar Raiser (Rigorous Trade-off & Depth Focus)</option>
                  <option value="Engineering Manager">Engineering Manager (System Architecture & Collaboration)</option>
                  <option value="Senior Frontend Architect">Senior Frontend Architect (Web Standards & Performance)</option>
                  <option value="Talent & Behavioral Lead">Talent & Behavioral Lead (STAR Framework & Culture Alignment)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-[#080e1d] shadow-lg shadow-violet-950/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-wait disabled:opacity-60"
            >
              {startMutation.isPending ? <RefreshCw aria-hidden="true" className="h-4 w-4 animate-spin" /> : <Play aria-hidden="true" className="h-4 w-4" />}
              <span>{startMutation.isPending ? 'Calibrating Question & Rubric…' : 'Enter Interview Booth'}</span>
            </button>
          </div>
        )}

        {/* Active Simulation Booth */}
        {session && (
          <div className="max-w-4xl mx-auto w-full space-y-6">
            
            {/* Booth Visualizer & Question Stage */}
            <div className="space-y-6 rounded-3xl border border-violet-300/20 bg-gradient-to-br from-[#151C35] via-[#10172D] to-[#101D30] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300"></span>
                  <span className="font-semibold text-cyan-200">LIVE SESSION • ROUND {session.currentQuestionIndex + 1}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Track: <strong className="text-white">{session.track}</strong></span>
                  <span>Persona: <strong className="text-violet-200">{session.persona}</strong></span>
                </div>
              </div>

              {/* Real Audio HUD & Microphone Level Meter */}
              <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-white/10 bg-[#0B1020]/70 p-6">
                
                {/* Live Mic Level Visualizer */}
                <div className="w-full max-w-md space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Microphone Level: {micLevel}%</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, isRecording ? Math.max(8, micLevel) : 0)}%` }}
                    />
                  </div>
                </div>

                <div aria-live="polite" className="text-sm font-medium text-slate-300">
                  {isSpeakingTTS ? 'Interviewer is speaking...' : isRecording ? 'Listening... Speak your answer (Pause ~3s or click "I\'m Done")' : isReviewStep ? 'Review your transcript below before scoring' : 'Microphone ready'}
                </div>
              </div>

              {/* Interviewer Prompt */}
              <div className="space-y-2 rounded-2xl border border-violet-300/20 bg-[#0B1020]/70 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-violet-200">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>INTERVIEWER PROMPT:</span>
                </div>
                <p className="text-base font-medium leading-relaxed text-white">
                  "{session.prompt}"
                </p>
              </div>

              {/* Candidate Workspace */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <label htmlFor="simulator-response" className="font-medium text-slate-300">
                    {isReviewStep ? 'Transcript Review Step (Confirm before scoring)' : 'Your Response'}
                  </label>
                  <span className="text-xs text-slate-400">
                    {isReviewStep ? 'Edit any misheard words, then confirm' : 'Speak into microphone or type answer'}
                  </span>
                </div>

                <textarea
                  id="simulator-response"
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Your spoken words will appear here. Alternatively, type your technical answer..."
                  rows={4}
                  className="w-full resize-y rounded-2xl border border-white/10 bg-[#0B1020]/70 p-4 text-sm leading-6 text-slate-200 placeholder:text-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/15"
                />

                {/* Interim Live Speech Bubble */}
                {interimSpeech && (
                  <div className="flex items-center gap-2 text-xs text-cyan-300/90 bg-cyan-950/30 border border-cyan-800/30 rounded-lg px-3 py-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>Live captions: <span className="italic text-white/90">{interimSpeech}</span></span>
                  </div>
                )}

                {/* Review Step Metadata & Warnings */}
                {isReviewStep && (
                  <div className="space-y-3 rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4 text-xs">
                    <div className="flex items-center justify-between font-semibold text-cyan-200">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>TRANSCRIPT REVIEW STEP</span>
                      </span>
                      <span>Confidence: {transcriptionMetadata.confidence ? Math.round(transcriptionMetadata.confidence * 100) : 90}%</span>
                    </div>

                    {transcriptionMetadata.detectedTerms && transcriptionMetadata.detectedTerms.length > 0 && (
                      <div className="text-slate-300">
                        <span className="text-slate-400">Recognized domain terms: </span>
                        {transcriptionMetadata.detectedTerms.map((t, idx) => (
                          <span key={idx} className="mr-1.5 inline-block rounded bg-cyan-500/20 px-1.5 py-0.5 text-[11px] font-mono text-cyan-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {transcriptionMetadata.warnings && transcriptionMetadata.warnings.length > 0 && (
                      <div className="text-amber-300 space-y-1">
                        {transcriptionMetadata.warnings.map((w, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Control Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  {!isReviewStep ? (
                    <div className="flex items-center gap-2">
                      {!pushToTalkEnabled ? (
                        <button
                          type="button"
                          onClick={isRecording ? stopRecordingAudio : startRecordingAudio}
                          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                            isRecording
                              ? 'animate-pulse border-rose-300/40 bg-rose-500/20 text-rose-100'
                              : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-violet-300/30 hover:bg-violet-300/[0.08]'
                          }`}
                        >
                          {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          <span>{isRecording ? "I'm Done Speaking" : "Start Speaking"}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onMouseDown={startRecordingAudio}
                          onMouseUp={stopRecordingAudio}
                          onTouchStart={startRecordingAudio}
                          onTouchEnd={stopRecordingAudio}
                          className={`inline-flex min-h-11 select-none items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                            isRecording
                              ? 'bg-rose-500/30 border-rose-400 text-rose-100'
                              : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
                          }`}
                        >
                          <Mic className="w-4 h-4" />
                          <span>{isRecording ? "Release to Finish" : "Hold to Speak (PTT)"}</span>
                        </button>
                      )}

                      {isRecording && (
                        <button
                          type="button"
                          onClick={stopRecordingAudio}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-300 hover:text-white"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Done</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReRecord}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Re-record</span>
                      </button>
                    </div>
                  )}

                  <div>
                    {!isReviewStep ? (
                      <button
                        type="button"
                        onClick={() => setIsReviewStep(true)}
                        disabled={!answerText.trim() || isRecording}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#080e1d] transition-[filter,transform] hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Review Transcript</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleConfirmAndEvaluate}
                        disabled={respondMutation.isPending || !answerText.trim()}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 px-6 py-2.5 text-sm font-bold text-[#080e1d] shadow-lg shadow-emerald-950/20 transition-[filter,transform] hover:brightness-110 active:scale-[0.99] disabled:opacity-40"
                      >
                        {respondMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>{respondMutation.isPending ? 'Calculating Code Marks…' : 'Confirm & Score Answer'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* LATEST QUESTION EVALUATION FEEDBACK */}
              {evaluationHistory.length > 0 && (
                <div className="mt-8 space-y-6 border-t border-white/10 pt-6">
                  
                  {/* Mark Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/20 bg-gradient-to-r from-[#171f3b] to-[#12192e] p-4">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-300">LATEST VERIFIED SCORE (OUT OF 10)</div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-extrabold text-white">
                          {evaluationHistory[evaluationHistory.length - 1].overallScore}
                        </span>
                        <span className="text-sm font-medium text-slate-400">/ 10.0</span>
                        <span className="ml-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-2.5 py-0.5 text-xs font-semibold text-violet-200">
                          {evaluationHistory[evaluationHistory.length - 1].markBand}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {evaluationHistory[evaluationHistory.length - 1].verdict}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setReevalIndex(evaluationHistory.length - 1)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-300 hover:border-violet-300/30 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Request Re-evaluation</span>
                    </button>
                  </div>

                  {/* Provisional Warning Notice */}
                  {evaluationHistory[evaluationHistory.length - 1].isProvisional && (
                    <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span><strong>Provisional marks:</strong> Dual-judge confidence was moderate. Please review the confirmed transcript or request secondary review.</span>
                    </div>
                  )}

                  {/* Dimensions Breakdown Grid (Out of 10) */}
                  {evaluationHistory[evaluationHistory.length - 1].dimensions && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      <div className="rounded-xl border border-white/10 bg-[#0B1020]/70 p-3">
                        <div className="text-slate-400 text-[10px]">CORRECTNESS</div>
                        <div className="font-bold text-white text-base mt-0.5">
                          {evaluationHistory[evaluationHistory.length - 1].dimensions.correctness} / 10
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0B1020]/70 p-3">
                        <div className="text-slate-400 text-[10px]">COMPLETENESS</div>
                        <div className="font-bold text-cyan-400 text-base mt-0.5">
                          {evaluationHistory[evaluationHistory.length - 1].dimensions.completeness} / 10
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0B1020]/70 p-3">
                        <div className="text-slate-400 text-[10px]">DEPTH & TRADEOFFS</div>
                        <div className="font-bold text-amber-400 text-base mt-0.5">
                          {evaluationHistory[evaluationHistory.length - 1].dimensions.depthAndTradeoffs} / 10
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-[#0B1020]/70 p-3">
                        <div className="text-slate-400 text-[10px]">EDGE CASES / INVARIANTS</div>
                        <div className="font-bold text-emerald-400 text-base mt-0.5">
                          {evaluationHistory[evaluationHistory.length - 1].dimensions.edgeCases} / 10
                        </div>
                      </div>
                    </div>
                  )}

                  {/* WHY THIS MARK: Rubric Evidence Points Breakdown */}
                  <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0B1020]/70 p-5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      <span>WHY THIS MARK — RUBRIC EVIDENCE POINTS:</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {evaluationHistory[evaluationHistory.length - 1].rubricResults?.map((r: any, idx: number) => (
                        <div 
                          key={idx} 
                          className={`rounded-xl border p-3 ${
                            r.status === 'covered' 
                              ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-100'
                              : r.status === 'partial'
                              ? 'border-amber-500/30 bg-amber-500/[0.06] text-amber-100'
                              : 'border-slate-800 bg-white/[0.02] text-slate-400'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 font-medium">
                              {r.status === 'covered' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : r.status === 'partial' ? (
                                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              ) : (
                                <X className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              )}
                              <span>{r.label}</span>
                            </div>
                            <span className="font-mono text-[10px] text-slate-400 flex-shrink-0">
                              Weight: {(r.weight * 100).toFixed(0)}%
                            </span>
                          </div>

                          {/* Quoted Evidence */}
                          {r.evidenceQuote && (
                            <div className="mt-2 rounded-lg bg-black/30 p-2 font-mono text-[11px] text-slate-200">
                              <span className="text-cyan-400">"</span>{r.evidenceQuote}<span className="text-cyan-400">"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Misconceptions caught */}
                    {evaluationHistory[evaluationHistory.length - 1].misconceptionsFound?.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-rose-500/20 pt-3">
                        <div className="text-xs font-bold text-rose-300">❌ CAUGHT FACTUAL MISCONCEPTIONS:</div>
                        {evaluationHistory[evaluationHistory.length - 1].misconceptionsFound.map((mc: any, i: number) => (
                          <div key={i} className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                            <div><strong>Said:</strong> "{mc.evidenceQuote || mc.claim}"</div>
                            <div className="mt-1 text-slate-300"><strong>Correct Fact:</strong> {mc.correction}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ADVISORY DELIVERY METRICS (Separated, Never reduces correctness mark) */}
                  {deliveryHistory.length > 0 && (
                    <div className="space-y-3 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0B1020] to-[#121B35] p-5 text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-cyan-300">
                          <Gauge className="w-4 h-4" />
                          <span>DELIVERY & SPEECH ANALYSIS (ADVISORY ONLY)</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Does NOT reduce correctness mark</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                          <div className="text-slate-400 text-[10px]">SPEAKING PACE</div>
                          <div className="font-bold text-white text-sm mt-0.5">{deliveryHistory[deliveryHistory.length - 1].wpm} WPM</div>
                          <div className="text-[10px] text-cyan-300">{deliveryHistory[deliveryHistory.length - 1].paceBand}</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                          <div className="text-slate-400 text-[10px]">FILLER WORDS</div>
                          <div className="font-bold text-white text-sm mt-0.5">{deliveryHistory[deliveryHistory.length - 1].totalFillers}</div>
                          <div className="text-[10px] text-amber-300">{deliveryHistory[deliveryHistory.length - 1].fillerRatePercent}% density</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                          <div className="text-slate-400 text-[10px]">CONCISENESS</div>
                          <div className="font-bold text-white text-sm mt-0.5 capitalize">{deliveryHistory[deliveryHistory.length - 1].ramblingStatus}</div>
                          <div className="text-[10px] text-slate-400">{deliveryHistory[deliveryHistory.length - 1].wordsPerPoint} words/pt</div>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
                          <div className="text-slate-400 text-[10px]">DURATION</div>
                          <div className="font-bold text-white text-sm mt-0.5">{deliveryHistory[deliveryHistory.length - 1].durationSeconds}s</div>
                          <div className="text-[10px] text-slate-400">Total Response</div>
                        </div>
                      </div>

                      {/* Coaching Tips */}
                      <div className="space-y-1 text-slate-300 pt-1">
                        {deliveryHistory[deliveryHistory.length - 1].advisoryTips?.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Model Gold-Standard Answer */}
                  {evaluationHistory[evaluationHistory.length - 1].modelAnswer && (
                    <details className="rounded-2xl border border-violet-300/20 bg-[#0B1020]/70 p-4 text-xs">
                      <summary className="cursor-pointer font-semibold text-violet-200 hover:text-white">
                        📖 View Model / Gold-Standard Architecture Answer
                      </summary>
                      <div className="mt-3 whitespace-pre-line border-t border-white/10 pt-3 leading-relaxed text-slate-300">
                        {evaluationHistory[evaluationHistory.length - 1].modelAnswer}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post-Interview Debrief Report */}
        {finalReport && (
          <div className="mx-auto w-full max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#151C35] via-[#10172D] to-[#101D30] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Session Comprehensive Debrief</div>
                <h2 className="mt-1 text-2xl font-bold text-white">Full-Round Interview Diagnostic</h2>
              </div>
              <div className="text-right">
                <div className="text-3xl font-extrabold text-violet-200">
                  {finalReport.overallInterviewScore} <span className="text-sm text-slate-400">/ 10.0</span>
                </div>
                <div className="text-xs font-semibold text-cyan-300 mt-0.5">{finalReport.markBand}</div>
                <div className="text-sm font-medium text-slate-400">{finalReport.verdict}</div>
              </div>
            </div>

            {/* Average Dimension Dials (Out of 10) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1 rounded-xl border border-white/10 bg-[#0B1020]/70 p-4">
                <div className="text-slate-500 text-[10px]">CORRECTNESS</div>
                <div className="text-xl font-bold text-white">{finalReport.dimensionAverages?.correctness} / 10</div>
              </div>
              <div className="space-y-1 rounded-xl border border-white/10 bg-[#0B1020]/70 p-4">
                <div className="text-slate-500 text-[10px]">COMPLETENESS</div>
                <div className="text-xl font-bold text-cyan-400">{finalReport.dimensionAverages?.completeness} / 10</div>
              </div>
              <div className="space-y-1 rounded-xl border border-white/10 bg-[#0B1020]/70 p-4">
                <div className="text-slate-500 text-[10px]">DEPTH & TRADEOFFS</div>
                <div className="text-xl font-bold text-amber-400">{finalReport.dimensionAverages?.depthAndTradeoffs} / 10</div>
              </div>
              <div className="space-y-1 rounded-xl border border-white/10 bg-[#0B1020]/70 p-4">
                <div className="text-slate-500 text-[10px]">AVERAGE WPM</div>
                <div className="text-xl font-bold text-emerald-400">{finalReport.deliverySummary?.avgWpm || 135} WPM</div>
              </div>
            </div>

            {/* Actionable Gaps & Recommended Drills */}
            <div className="space-y-4 text-sm">
              {finalReport.topConceptGaps && finalReport.topConceptGaps.length > 0 && (
                <div className="space-y-2 rounded-2xl border border-cyan-300/15 bg-[#0B1020]/70 p-4">
                  <div className="font-semibold text-cyan-200">Identified Gaps & Recommended Practice Drills</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                    {finalReport.topConceptGaps.map((gap: string, idx: number) => (
                      <li key={idx}>Targeted Practice: <strong>{gap}</strong> (Saved to Mistake Log & Daily Plan)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => { setFinalReport(null); setSession(null); }}
                className="min-h-11 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-2.5 text-sm font-bold text-[#080e1d] transition-[filter,transform] hover:brightness-110 active:scale-[0.99]"
              >
                Start New Practice Session
              </button>
            </div>
          </div>
        )}

        {/* Re-evaluation Modal Dialog */}
        {reevalIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg space-y-4 rounded-3xl border border-white/20 bg-[#151C35] p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-lg font-bold text-white">Request Re-evaluation</h3>
                <button
                  type="button"
                  onClick={() => setReevalIndex(null)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs leading-5 text-slate-300">
                If you believe a technical concept was misclassified or an accent error occurred during transcription, explain briefly. Your response will be flagged for secondary review.
              </p>

              <textarea
                value={reevalNote}
                onChange={(e) => setReevalNote(e.target.value)}
                placeholder="Explain the specific concept or correction..."
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-[#0B1020] p-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />

              {reevalStatus && (
                <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                  {reevalStatus}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReevalIndex(null)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => reevalMutation.mutate({ questionIndex: reevalIndex, note: reevalNote })}
                  disabled={reevalMutation.isPending}
                  className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-xs font-bold text-[#080e1d]"
                >
                  {reevalMutation.isPending ? 'Logging...' : 'Submit for Review'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
