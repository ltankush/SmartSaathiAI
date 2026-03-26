# SmartSaathiAI — Architecture Document

## System Overview

SmartSaathiAI is a two-service system: a Python FastAPI backend and a React frontend, communicating via REST and Server-Sent Events (SSE). All AI inference is handled by Groq's API. All persistence is handled by GitHub Gist (private, free).

---

## Agent Architecture

```
User (Browser)
     │
     ▼
React Frontend (Vite + Three.js + Framer Motion)
     │  REST + SSE
     ▼
FastAPI Backend (Python + aiohttp)
     │
     ├─── Chat Agent ──────────────► Groq: llama-3.3-70b-versatile (SSE stream)
     │
     ├─── Score Agent ─────────────► indian_finance.py (pure Python math)
     │         └───────────────────► Groq: llama-4-scout (summary, fast)
     │
     ├─── Planner Agent ───────────► indian_finance.py (FIRE calculations)
     │         └───────────────────► Groq: llama-4-scout (narrative)
     │
     ├─── Tax Agent ───────────────► indian_finance.py (slab calculations)
     │         └───────────────────► Groq: llama-4-scout (advice)
     │
     ├─── Voice Agent ─────────────► Groq: whisper-large-v3 (STT)
     │
     └─── Session Agent ───────────► GitHub Gist API (private JSON store)
```

---

## Agent Roles

### 1. Chat Agent (`api/chat.py`)
- **Input**: conversation history, user financial context
- **Output**: SSE token stream
- **Model**: `llama-3.3-70b-versatile` — highest reasoning quality on free tier
- **System prompt**: Hinglish persona, India-specific financial knowledge, actionable advice
- **Error handling**: falls back to next token gracefully, sends error event on failure

### 2. Score Agent (`api/score.py` + `services/indian_finance.py`)
- **Input**: 12 financial profile fields
- **Output**: 6-dimension score (0–100 each), tier classification, AI summary, Govt schemes
- **Logic**: Weighted formula across Emergency, Insurance, Investments, Debt, Tax, Retirement
- **AI layer**: Llama 4 Scout generates a personalised 3-sentence Hinglish summary
- **Govt scheme matcher**: Rule-based age/eligibility filter for 7 major schemes

### 3. Planner Agent (`api/planner.py`)
- **Input**: age, income, expenses, savings, target FIRE age
- **Output**: FIRE corpus, monthly SIP, allocation breakdown, milestone timeline
- **Math**: Future value compounding, inflation-adjusted corpus (25× rule)
- **Allocation**: 60% Nifty 50 ETF / 20% PPF / 20% NPS (India-optimised)

### 4. Tax Agent (`api/tax.py`)
- **Input**: gross salary, 6 deduction fields
- **Output**: Old regime vs New regime comparison, missed deductions, recommendation
- **Math**: FY 2025-26 exact slabs (Old + New), 4% education cess, rebates u/s 87A
- **AI layer**: Specific 2-step action plan for next financial year

### 5. Voice Agent (`api/voice.py`)
- **Input**: audio file (webm/wav/mp3, max 25MB)
- **Output**: transcript text
- **Model**: `whisper-large-v3` — multilingual, Hindi + English

### 6. Session Agent (`api/session.py` + `services/gist_client.py`)
- **Input**: session UUID (stored in browser localStorage)
- **Output**: read/write JSON to private GitHub Gist
- **Auto-setup**: Creates Gist on first run, saves ID to `.env`
- **Privacy**: No PII stored — only financial profile numbers

---

## Data Flow: BMS Score Request

```
User submits 12-field form
         │
         ▼
POST /api/score  (FastAPI, async)
         │
         ├─ indian_finance.calc_bms_score()   [pure Python, <1ms]
         │      └── weighted score across 6 dimensions
         │
         ├─ indian_finance.match_govt_schemes()  [rule-based, <1ms]
         │
         └─ groq_client.chat_complete()   [Llama 4 Scout, ~800ms]
                  └── 3-sentence Hinglish summary
         │
         ▼
JSON response → ScoreCard component → animated ring + dimension bars
```

## Data Flow: AI Chat (SSE)

```
User types message → Enter key
         │
         ▼
POST /api/chat  (body: message history + context)
         │
         ▼
FastAPI StreamingResponse (text/event-stream)
         │
         ▼
aiohttp → Groq API (stream=True)
         │
         └── for each chunk: yield "data: {token}\n\n"
         │
         ▼
Browser EventSource → token appended to React state
         │
         ▼
ReactMarkdown renders incrementally (typing effect)
```

---

## Tool Integrations

| Integration | Method | Library |
|---|---|---|
| Groq LLM (chat) | HTTP POST + SSE | aiohttp |
| Groq LLM (complete) | HTTP POST | aiohttp |
| Groq Whisper | HTTP POST multipart | aiohttp |
| GitHub Gist (read) | HTTP GET | aiohttp |
| GitHub Gist (write) | HTTP PATCH | aiohttp |

All external HTTP calls use `aiohttp.ClientSession` with async/await — no blocking IO.

---

## Error Handling

| Layer | Strategy |
|---|---|
| Groq API 429 | Log + return error event in SSE stream |
| Groq API 5xx | Catch + return user-friendly error message |
| Gist write fail | Log warning, session data lost gracefully |
| Frontend SSE disconnect | EventSource auto-reconnects (built-in) |
| Voice upload fail | Error state displayed, user told to type instead |
| Missing env vars | `config.py` raises on import, server won't start |

---

## Security

- API keys stored only in `backend/.env` (never in frontend, never in Git)
- GitHub Gist is **private** — only visible to your account
- Session IDs are UUID4 — unguessable
- No user PII stored — only numeric financial data
- CORS restricted to frontend origin only
- `.gitignore` blocks `.env` from being committed

---

## Performance

| Metric | Value |
|---|---|
| First contentful paint | < 1.2s (Vite + Nginx gzip) |
| API response (score) | ~900ms (math + Groq summary) |
| Chat first token | ~600ms (Groq fast inference) |
| 3D orb (mobile) | 60fps on mid-range Android |
| Bundle size (gzipped) | ~180KB initial, Three.js lazy-loaded |

---

## Deployment Options

### Local (development)
```bash
python setup.py
```
Starts uvicorn + Vite dev server automatically.

### Docker (production)
```bash
python setup.py --build
```
Builds backend + frontend containers, nginx proxy included.

### Heroku + Vercel (cloud, free)
- Backend → Heroku (Procfile + runtime.txt ready)
- Frontend → Vercel or Netlify (static export)

---

## Impact Quantification

| Metric | Assumption | Value |
|---|---|---|
| Indians without financial plan | 95% of population | 133 crore |
| Advisor cost | Market rate | ₹25,000/year |
| Tax savings per user | Avg missed deduction | ₹8,000/year |
| Time saved vs advisor visit | 5 min vs 4 hours | 98% reduction |
| Infrastructure cost | Groq free + Gist free | ₹0 |
| Time to first insight | Onboarding flow | < 5 minutes |

---

*SmartSaathiAI — ET GenAI Hackathon 2026*
