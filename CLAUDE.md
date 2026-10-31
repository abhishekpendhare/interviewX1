# CLAUDE.md — InterviewX Project Memory
> **For Claude Code / Antigravity / any AI assistant**
> Read this file FIRST before touching any code. It is the single source of truth for this project.

---

## 1. WHAT IS THIS PROJECT?

**InterviewX OS 2.0** — an AI-powered Student Study, Algorithm Arena, Voice Mock Interview, and Performance Telemetry platform for 3rd/4th year engineering students preparing for Tier-1 placements (Amazon, Google, Microsoft, Meta, etc.).

- **Brand Aesthetic**: Cyber-Obsidian (`#040711`) with Electric Cyan (`#00F0FF`), Neon Emerald (`#10F3A5`), and Prism Violet (`#8B5CF6`).
- **Core Modules**:
  1. **LeetCode-Style Code Arena (`/code`)**: Monaco Editor supporting JavaScript, Python, C++, and Java with sandboxed test runner.
  2. **Voice-Interactive Mock Interview (`/mock-interview`)**: Web Speech API (SpeechRecognition mic input + SpeechSynthesis voice audio).
  3. **Continuous AI Coach Telemetry (`/api/agent/briefing`)**: Proactive briefing analyzing coding submissions and test drops.
  4. **Timed Assessment Engine (`/test`)**: Calibrated placement tests with question palette & solution explanations.
  5. **Expanded Knowledge Hub (`/subjects`, `/technical`, `/aptitude`, `/hr`)**: System Design, Cloud/DevOps, Git, OS, DBMS, and STAR framework.

---

## 2. TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS v4 + Monaco Editor + Web Speech API + Framer Motion + Recharts + TanStack Query (`client/`) |
| Backend | Node.js + Express 5 (port 3000) serving REST APIs + React SPA dist |
| Database | Flat JSON file (`server/db/store.json`) — stores students, questions, tests, codingProblems, codeSubmissions, interviews |
| AI/LLM | Dual-mode: Live Gemini / OpenAI / Groq (if `.env` keys exist) OR Autonomous Cognitive Simulation Engine |
| Auth | localStorage-based (`it_practice_user` stores `{name, email, role}`) |
| Styling | Tailwind CSS v4 with custom Cyber-Obsidian & Electric Cyan tokens |
| Server start | `npm start` → runs `node server/index.js` |

---

## 3. PROJECT STRUCTURE

```
IT-Interview-Practice/
│
├── CLAUDE.md                  ← YOU ARE HERE (read first)
├── package.json               ← "start": "node server/index.js"
├── .env.example               ← API key template
│
├── ── FRONTEND PAGES ──
├── index.html                 ← Landing/home page
├── login.html                 ← Auth: sign in / sign up / forgot password
├── dashboard.html             ← Main student dashboard (post-login)
├── test.html                  ← Interactive test/assessment engine
├── ai-tutor.html              ← AI Chat Coach + Code Doubt Debugger
├── mock-interview.html        ← Mock interview room (multi-round)
├── subjects.html              ← Subject overview grid
├── technical.html             ← Technical Q&A (54K, show/hide answers)
├── aptitude.html              ← Aptitude questions
├── hr.html                    ← HR interview questions
│
├── ── FRONTEND ASSETS ──
├── style.css                  ← MAIN site styles, CSS variables, nav, cards
├── theme.css                  ← OVERLAY: dark mode, glassmorphism, glow, radar, waveform, command palette
├── ui-core.js                 ← UI engine: ThemeManager, SoundEngine, ConfettiEngine, CommandPalette, FloatingAIDock, RadarChartHelper
├── script.js                  ← toggleAnswer(), syncNavAuthState()
├── dashboard.css              ← Dashboard-specific styles
├── dashboard.js               ← Dashboard data contract, render engine, backend sync, POTD timer
│
└── server/
    ├── index.js               ← Express 5 app entry point (port 3000)
    ├── routes/
    │   └── api.js             ← ALL REST API endpoints
    ├── db/
    │   └── database.js        ← JSON file DB (store.json auto-created from seed)
    ├── agent/
    │   ├── tools.js           ← 10 controlled AI tools (getStudentProfile, etc.)
    │   ├── llmProvider.js     ← Dual-mode LLM: Gemini/OpenAI OR simulation
    │   ├── doubtSolver.js     ← Multi-level explanations + Socratic code debugger
    │   └── mockInterviewer.js ← Multi-round adaptive interviewer
    └── services/
        ├── analyticsEngine.js    ← Deterministic performance analytics
        └── studyPlanGenerator.js ← 7-day adaptive study plan generator
```

---

## 4. CSS DESIGN TOKENS (DO NOT CHANGE THESE)

Defined in `style.css` and `dashboard.css`:

```css
--primary-navy: #173b63
--primary-navy-dark: #0e2946
--accent-gold: #ffd166
--accent-blue: #246da8
--accent-blue-light: #eaf2f8
--success-green: #10b981
--warning-amber: #f59e0b
--danger-red: #ef4444
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
```

Dark theme variables live in `theme.css` under `body.dark-theme {}`:
```css
--bg-page: #090d16
--bg-card: rgba(15,23,42,0.85)
--border-hover: #38bdf8
```

---

## 5. ALL API ENDPOINTS

Base URL: `http://localhost:3000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Server health check |
| GET | `/api/student/profile` | Full student profile + analytics |
| GET | `/api/student/comparison` | Performance delta vs last test |
| GET | `/api/tests` | List all available tests |
| GET | `/api/tests/:id` | Get test (answers hidden before submit) |
| POST | `/api/tests/:id/submit` | Submit answers → get evaluation |
| POST | `/api/agent/chat` | AI Student Agent chat |
| POST | `/api/agent/doubt/explain` | Explain a concept (multi-level) |
| POST | `/api/agent/doubt/code` | Socratic code debugger |
| POST | `/api/agent/interview/start` | Start a mock interview session |
| POST | `/api/agent/interview/answer` | Submit interview answer → evaluation |
| GET | `/api/analytics/topics` | Topic-wise performance breakdown |
| GET | `/api/study-plan` | Current 7-day study plan |

---

## 6. DATABASE SCHEMA (store.json)

```json
{
  "students": [{
    "id": "student-101",
    "name": "Alex Morgan",
    "email": "alex@interviewx.dev",
    "target": "SDE-1",
    "targetCompanies": ["Amazon", "Google", "Microsoft"],
    "streak": 7,
    "readinessScore": 65
  }],
  "questions": [/* 11 questions with subject/topic/subtopic/difficulty metadata */],
  "tests": [/* 3 test objects */],
  "attempts": [/* student test attempt records */],
  "studyPlans": [],
  "aiInteractions": [],
  "interviewSessions": []
}
```

Each question has full metadata:
```json
{
  "id": "q1",
  "subject": "DSA",
  "topic": "Arrays",
  "subtopic": "Sliding Window",
  "difficulty": "Medium",
  "type": "MCQ"
}
```

---

## 7. AUTHENTICATION SYSTEM

- **No backend auth** — all auth is localStorage-based
- Login page (`login.html`) stores on success:
  ```js
  localStorage.setItem('it_practice_user', JSON.stringify({ name, email, role }))
  ```
- All pages check this on load via `syncNavAuthState()` in `script.js`
- Backend uses header: `req.headers['x-student-id'] || "student-101"` (hardcoded default)
- Student ID is always `"student-101"` (Alex Morgan) — no real session tokens yet

---

## 8. UI/UX SYSTEM (theme.css + ui-core.js)

Both files are **injected into ALL 10 HTML pages** (in `<head>` and before `</body>`).

### theme.css provides:
- CSS custom properties for light/dark theme
- `.glass-card` — glassmorphism cards (`backdrop-filter: blur(14px)`)
- `.waveform-box` + `.waveform-bar` — animated audio waveform
- `.command-palette-overlay` — Ctrl+K palette styles
- `.floating-ai-dock` — FAB + mini chat panel
- Glow effects on hover: `box-shadow: var(--shadow-glow)`

### ui-core.js provides (auto-init on DOMContentLoaded):

| Class | What it does |
|-------|-------------|
| `ThemeManager` | Dark/light toggle, persists to localStorage, respects `prefers-color-scheme` |
| `SoundEngine` | Web Audio API sounds: `SoundEngine.play('click'/'success'/'celebrate'/'hint')` |
| `ConfettiEngine` | Canvas confetti: `ConfettiEngine.trigger()` |
| `CommandPalette` | Ctrl+K overlay with 10 commands (navigate pages, toggle theme, start interview, etc.) |
| `FloatingAIDock` | Bottom-right FAB 🤖, mini chat panel, calls `/api/agent/chat` |
| `RadarChartHelper` | SVG radar chart: `RadarChartHelper.render('container-id', topics[])` |

---

## 9. AI AGENT ARCHITECTURE

```
Student
  ↓
Website (Frontend)
  ↓
Backend API (/api/agent/*)
  ↓
Agent Orchestrator (server/agent/)
  ↓
LLM Provider (Gemini / OpenAI / Simulation)
  ↓
Controlled Tools (server/agent/tools.js)
  ↓
Database (server/db/database.js)
```

### The 10 Controlled Tools:
```
getStudentProfile()       getTestHistory()
getTestResult()           getTopicPerformance()
getWeakTopics()           getStrongTopics()
getQuestionHistory()      getCurrentStudyPlan()
createStudyPlan()         getRecommendedQuestions()
```

AI **never** directly accesses the DB — only through these tools.

---

## 10. ANALYTICS ENGINE

File: `server/services/analyticsEngine.js`

Performance classification thresholds:
```
STRONG        → accuracy ≥ 75%
GOOD          → accuracy ≥ 60%
AVERAGE       → accuracy ≥ 45%
NEEDS PRACTICE → accuracy < 45%
```

Readiness Score formula:
```
ReadinessScore = (accuracy × 0.4) + (recentPerf × 0.3) + (consistency × 0.2) + (difficulty × 0.1)
```

Tracked per student:
- Total tests, questions, correct, incorrect, skipped
- Accuracy, avg response time
- Subject/topic/subtopic/difficulty breakdown
- Historical trend (improvement delta)

---

## 11. EXPRESS 5 COMPATIBILITY NOTE ⚠️

Express 5 does **NOT** support `app.get('*', handler)` — throws PathError.

**Fix** (already applied in `server/index.js`):
```js
// ❌ WRONG — breaks Express 5
app.get('*', (req, res) => res.sendFile(...))

// ✅ CORRECT
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../index.html'))
  } else next()
})
```

---

## 12. HOW TO RUN

```bash
# Install dependencies (first time only)
npm install

# Start server
npm start
# OR
node server/index.js
```

Server runs at: **http://localhost:3000**

To use real AI (Gemini/OpenAI), copy `.env.example` to `.env` and add your key:
```
GEMINI_API_KEY=your_key_here
# OR
OPENAI_API_KEY=your_key_here
```

Without keys → runs on **Local Cognitive Simulation Engine** (grounded in real DB data, still functional).

---

## 13. DEFAULT STUDENT DATA

- **ID**: `student-101`
- **Name**: Alex Morgan
- **Target**: SDE-1
- **Companies**: Amazon, Google, Microsoft
- **Streak**: 7 days
- **Accuracy**: ~64%
- **Readiness**: 65%
- **Weak topics**: Sliding Window, Hash Maps, Joins (SQL), Deadlocks

---

## 14. NAVIGATION STRUCTURE (on all pages)

```
Home | Dashboard | Take Test | AI Tutor | Mock Interview | Subjects | Technical | Login
```

Nav auth state is synced on every page via `syncNavAuthState()` in `script.js`.

---

## 15. SOUND & CONFETTI WIRING

| Event | Sound | Confetti |
|-------|-------|----------|
| Any button/option click | `SoundEngine.play('click')` | — |
| Test submitted | `SoundEngine.play('success')` | If score = 100% |
| Mock interview complete ≥75% | `SoundEngine.play('celebrate')` | ✅ |
| AI hint given | `SoundEngine.play('hint')` | — |

---

## 16. KNOWN ISSUES / TODO

- [ ] Real backend authentication (JWT tokens) — currently localStorage only
- [ ] Real student ID from session — currently hardcoded `"student-101"`
- [ ] Connect `.env` API key to live Gemini 2.5 Flash
- [ ] Persist new questions added by admin
- [ ] Mobile responsiveness polish on `mock-interview.html`
- [ ] Company-wise question bank data population
- [ ] Add more seed questions (currently only 11)
- [ ] Leaderboard feature (referenced in dashboard but not built)

---

## 17. WHAT NOT TO DO

- ❌ Do NOT install React/Vue/Angular — this is intentionally vanilla JS
- ❌ Do NOT change the CSS color tokens without updating both `style.css` AND `theme.css`
- ❌ Do NOT use `app.get('*', ...)` in Express 5 (PathError)
- ❌ Do NOT let AI tools query the database directly — always go through `server/agent/tools.js`
- ❌ Do NOT add a new CSS framework — use existing variables
- ❌ Do NOT rename `store.json` — the database path is hardcoded in `database.js`

---

*Last updated: October 2026 | Platform: InterviewX v1.0*
