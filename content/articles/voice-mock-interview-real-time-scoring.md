---
title: "Inside InterviewX Voice Mock Interview: Real-Time Scoring"
slug: "voice-mock-interview-real-time-scoring"
summary: "How our audio pipeline captures speech, transcribes via Groq Whisper with technical vocab hints, and grades answers on structured rubrics."
category: "Platform Updates"
tags: ["Platform", "Voice AI", "Mock Interview", "Whisper", "Telemetry"]
author: "InterviewX Editorial Team"
coverImage: "/assets/articles/covers/voice-mock-interview-real-time-scoring.svg"
coverAlt: "InterviewX real-time voice mock interview architecture"
publishedAt: "2026-10-31"
updatedAt: "2026-10-31"
reviewedAt: "2026-10-31"
status: "published"
sources:
  - title: "InterviewX Voice Simulator Architectural Whitepaper"
    url: "https://github.com/it-interview-practice/docs"
    accessedDate: "2026-10-30"
  - title: "Groq API Whisper Large v3 Audio Documentation"
    url: "https://console.groq.com/docs/speech-text"
    accessedDate: "2026-10-30"
relatedModules:
  - title: "Launch Voice Mock Interview Simulator"
    url: "/simulator"
    type: "simulator"
  - title: "Interview Question Telemetry Bank"
    url: "/practice"
    type: "practice"
---

# Inside InterviewX Voice Mock Interview: Real-Time Scoring

Practicing technical and behavioral interview questions by typing answers into a text box does not prepare students for the physical pressure of a live interview. In real interviews, candidates must articulate complex algorithmic invariants out loud, control filler words, pace their speech, and structure answers under strict time constraints.

To solve this challenge, InterviewX built a production-grade **Voice Mock Interview Simulator** that replicates live conversational interview dynamics with deterministic, evidence-based rubric scoring.

> **Key takeaways:**
> - In-browser audio recording transmits speech to Groq Whisper with a specialized technical vocabulary hint list, preventing transcription errors on terms like `B-Tree`, `Dijkstra`, or `Kafka`.
> - Answers are never graded by an arbitrary LLM opinion; an automated judge matches extracted claims against a structured rubric with verbatim quotes, and marks are computed in code.
> - Delivery metrics (words per minute, filler words, pause duration) are tracked separately and never reduce technical correctness marks.

## 1. The Speech Capture and Transcription Architecture

Legacy speech-to-text systems frequently butcher technical computer science terminology (e.g., mishearing "Kubernetes" as "copper net is" or "monikers" for "monotonic"). InterviewX solves this through a multi-stage pipeline:

1. **High-Fidelity Audio Capture**: The browser records raw microphone audio using the MediaStream API with real-time audio level metering. A 3-second pause timeout, push-to-talk mode, and a visible "I'm done" button ensure students are never prematurely cut off.
2. **Server-Side Groq Whisper Transcription**: The audio buffer is dispatched to Groq's high-throughput Whisper engine with an injected vocabulary prompt containing over 200 technical computer science terms across Data Structures, DBMS, Operating Systems, Computer Networks, and Cloud Architecture.
3. **Transcript Confirmation Modal**: Before scoring occurs, the student can review their transcript, edit misheard words, or re-record, guaranteeing that scoring reflects their actual intended answer.

## 2. Deterministic, Evidence-Based Rubric Scoring

A major flaw of generic AI evaluators is score drift—the same answer might receive 7/10 in one run and 4/10 in another. InterviewX eliminates this with a four-step scoring engine:

- **Claim Extraction**: The model extracts discrete technical claims from the confirmed transcript.
- **Rubric Matching**: Each claim is matched against pre-validated key points stored in our database. The system returns strictly `covered`, `partial`, `missing`, or `contradicted`.
- **Verbatim Evidence Requirement**: For any key point marked covered, the system MUST return a direct verbatim quote from the student's transcript as proof. No quote means zero credit.
- **Code-Calculated Marks**: The numerical mark is calculated deterministically in backend code:
  $$\text{Mark} = \sum (\text{Weight}_i \times \text{Credit}_i) - \text{Penalty}$$
  Normalized to a calibrated 10-point scale.

## 3. Independent Delivery Analytics

How you say an answer matters, but it should not distort what you know. InterviewX analyzes delivery on a completely separate channel:
- **Pace Tracking**: Evaluates words per minute (optimal: 120 to 150 WPM).
- **Filler Word Detection**: Highlights occurrences of *"um"*, *"uh"*, *"like"*, and *"you know"*.
- **Pause Telemetry**: Highlights extended silences.

Experience the future of interview preparation today:
- [Launch the Voice Mock Simulator](/simulator)
- [Practice Curated Question Banks](/practice)
