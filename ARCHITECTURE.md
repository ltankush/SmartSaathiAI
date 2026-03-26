# SmartSaathiAI — Architecture Document

> **ET GenAI Hackathon 2026** | Agentic Multi-Tool AI Financial Mentor for India

## System Overview

SmartSaathiAI is a **two-service agentic AI system**: a Python FastAPI backend with tool-calling capabilities and a React frontend with 3D visuals, communicating via REST and Server-Sent Events (SSE). All AI inference is handled by Groq's API with function calling. All persistence is handled by GitHub Gist (private, free).

---

## Agentic Architecture

```
User (Browser)
     │
     ▼
React Frontend (Vite + Three.js + Framer Motion + Chart.js)
     │  REST + SSE
     ▼
FastAPI Backend (Python + aiohttp + async)
     │
     ├─── AGENTIC CHAT ──────────────► Groq: llama-3.3-70b (function calling)
     │         │                          │
     │         ├── Tool: compare_tax() ◄──┘ (loops back with results)
     │         ├── Tool: fire_planner()
     │         ├── Tool: calc_sip()
     │         ├── Tool: calc_bms_score()
     │         └── Tool: match_schemes()
     │
     ├─── Score Agent ─────────────► indian_finance.py + Groq (summary)
     ├─── Planner Agent ───────────► indian_finance.py + Groq (narrative)
     ├─── Tax Agent ───────────────► indian_finance.py + Groq (advice)
     ├─── Goal Agent ──────────────► calc_sip() + Groq (strategy)
     ├─── Spending Agent ──────────► 50/30/20 analysis + Groq (audit)
     ├─── Report Agent ────────────► ReportLab → PDF (watermark + disclaimer)
     ├─── Voice Agent ─────────────► Groq: whisper-large-v3 (STT)
     └─── Session Agent ───────────► GitHub Gist API (private JSON)
```

---

## Agentic Tool-Use Flow (Key Innovation)

```
User: "Meri salary 12 lakh hai, kaunsa regime better?"
                    │
                    ▼
          ┌─────────────────┐
          │  System Prompt   │
          │  (Hinglish +     │
          │   tool defs)     │
          └────────┬────────┘
                   │
                   ▼
     ┌──────────────────────────┐
     │   Groq LLM (Llama 3.3)  │
     │   Decides: use tool      │
     │   compare_tax_regimes()  │
     └───────────┬──────────────┘
                 │ tool_call
                 ▼
     ┌──────────────────────────┐
     │   Backend executes       │
     │   indian_finance.py      │
     │   Real Python math!      │
     └───────────┬──────────────┘
                 │ tool_result (JSON)
                 ▼
     ┌──────────────────────────┐
     │   Groq LLM (Round 2)    │
     │   Generates Hinglish     │
     │   response with REAL     │
     │   calculated numbers     │
     └───────────┬──────────────┘
                 │ SSE stream
                 ▼
          Browser (token-by-token)
```

**5 registered tools:**

| Tool | Function | Description |
|---|---|---|
| `compare_tax_regimes` | Exact FY 2025-26 tax slabs | Old vs New with deductions |
| `fire_planner` | FIRE corpus + SIP calculation | 25× rule, inflation-adjusted |
| `calculate_sip` | SIP maturity projection | Monthly compound interest |
| `calculate_bms_score` | 6-dimension financial health | Weighted scoring |
| `match_govt_schemes` | Age/eligibility based filter | 7 major govt schemes |

---

## Agent Roles (9 Agents)

### 1. Agentic Chat Agent (`api/chat.py`)
- **Input**: conversation history + user context + 5 tool definitions
- **Output**: SSE token stream with real calculated data
- **Model**: `llama-3.3-70b-versatile` with function calling
- **Fallback**: Regular streaming if tool calling fails

### 2. Score Agent (`api/score.py`)
- **Input**: 12 financial profile fields
- **Output**: 6-dimension score (0–100), tier, AI summary, govt schemes
- **Logic**: Weighted formula across Emergency/Insurance/Investments/Debt/Tax/Retirement

### 3. Planner Agent (`api/planner.py`)
- **Input**: age, income, expenses, savings, target FIRE age
- **Output**: FIRE corpus, monthly SIP, allocation breakdown, milestones

### 4. Tax Agent (`api/tax.py`)
- **Input**: gross salary + 6 deduction fields
- **Output**: Old vs New comparison, missed deductions, AI recommendation

### 5. Goal Agent (`api/goals.py`)
- **Input**: list of financial goals with targets and timelines
- **Output**: Per-goal SIP needed, projection, AI strategy

### 6. Spending Agent (`api/spending.py`)
- **Input**: monthly income + 10-category spending breakdown
- **Output**: 50/30/20 analysis, over-budget alerts, AI audit

### 7. Report Agent (`api/report.py`)
- **Input**: BMS score data
- **Output**: PDF with watermark, disclaimer, score ring, dimension bars, recommendations

### 8. Voice Agent (`api/voice.py`)
- **Input**: audio file (webm/wav/mp3)
- **Output**: transcript via Whisper

### 9. Session Agent (`api/session.py`)
- **Input**: session UUID
- **Output**: CRUD on private GitHub Gist

---

## Data Flow: Agentic Chat Request

```
User types: "10000 ka SIP 20 saal mein kitna banega?"
         │
         ▼
POST /api/chat  (messages + context)
         │
         ├─ groq.chat_with_tools()     [Llama 3.3, ~400ms]
         │      └── LLM returns tool_call: calculate_sip(10000, 20, 12.0)
         │
         ├─ _execute_tool()            [Python, <1ms]
         │      └── calc_sip(10000, 20, 12.0) → maturity: ₹99,91,479
         │
         └─ groq.chat_stream()         [Llama 3.3, ~600ms]
                  └── "Bhai, ₹10,000 ka SIP 20 saal mein ₹99.9L ban jaayega!"
         │
         ▼
SSE stream → Browser → ReactMarkdown (typing effect)
```

---

## Tool Integrations

| Integration | Method | Library |
|---|---|---|
| Groq LLM (function calling) | HTTP POST | aiohttp |
| Groq LLM (streaming) | HTTP POST + SSE | aiohttp |
| Groq Whisper | HTTP POST multipart | aiohttp |
| GitHub Gist (CRUD) | HTTP GET/PATCH | aiohttp |
| PDF Generation | ReportLab Canvas | reportlab |

---

## Error Handling

| Layer | Strategy |
|---|---|
| Tool call fails | Falls back to regular streaming (no tools) |
| Groq API 429 | Log + return error event in SSE stream |
| Groq API 5xx | Catch + user-friendly error message |
| Tool execution error | Returns error JSON to LLM, LLM explains gracefully |
| PDF generation fails | HTTP 500 with detail message |
| Gist write fail | Log warning, session data lost gracefully |
| Voice upload fail | Error state, user told to type instead |
| Missing env vars | `config.py` raises on import, server won't start |
| Frontend SSE disconnect | EventSource auto-reconnects |

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
| Agentic chat (with tool) | ~1.2s (tool call + stream) |
| Chat first token | ~600ms (Groq fast inference) |
| PDF generation | ~200ms (ReportLab) |
| 3D orb (mobile) | 60fps on mid-range Android |
| Bundle size (gzipped) | ~180KB initial, Three.js lazy-loaded |

---

## Frontend Architecture

```
React 18 + Vite
├── Three.js + @react-three/fiber  → 3D animated hero orb
├── Framer Motion                  → page transitions + micro-animations
├── Chart.js                       → Line, Bar, Doughnut charts
├── Zustand                        → global state + localStorage persistence
├── React Router v6                → SPA routing (7 pages)
├── ReactMarkdown                  → AI response rendering
├── i18n.js                        → 4-language support (EN/HI/TA/BN)
├── Canvas API                     → Confetti animation
└── PWA Install API                → beforeinstallprompt
```

---

*SmartSaathiAI v2.0 — ET GenAI Hackathon 2026*
