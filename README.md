# SmartSaathiAI 🇮🇳

> **India's AI-powered personal finance mentor** — Built for the ET GenAI Hackathon 2026

SmartSaathiAI is a full-stack web application that gives every Indian access to a personalised financial advisor — completely free. It covers the Bharat Money Score, FIRE Path Planning, Tax Regime Optimization, and an AI chat mentor that speaks Hinglish.

---

## What It Does

| Feature | Description |
|---|---|
| **Bharat Money Score (BMS)** | 12 questions → score across 6 dimensions (Emergency, Insurance, Investments, Debt, Tax, Retirement). AI-generated personalised summary + Govt scheme matcher. |
| **FIRE Path Planner** | Age + income → month-by-month roadmap with SIP amounts, PPF/NPS/ELSS allocation, and corpus milestones. Interactive Chart.js timeline. |
| **Tax Regime Optimizer** | Old vs New regime compared with exact numbers. Identifies every missed deduction. AI recommends action items. FY 2025-26. |
| **AI Money Mentor (Chat)** | SSE-streamed AI chat. Speaks Hinglish. Voice input via Groq Whisper. Contextual — knows your BMS score. |

---

## Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **aiohttp** — all external HTTP calls (no requests, no httpx)
- **Groq API** — LLM (Llama 3.3 70B + Llama 4 Scout) + Whisper STT
- **GitHub Gist** — free, private, forever JSON database
- **SSE (Server-Sent Events)** — real-time streaming AI responses
- **Pydantic v2** — data validation

### Frontend
- **React 18** + **Vite** — lightning-fast dev + build
- **Three.js** + **@react-three/fiber** — 3D animated hero orb
- **Framer Motion** — page transitions and animations
- **Tailwind CSS** — utility-first styling
- **Chart.js** + **react-chartjs-2** — financial charts
- **Zustand** — global state with localStorage persistence
- **React Router v6** — SPA routing

### Infrastructure
- **Docker + Docker Compose** — one-command deployment
- **Nginx** — frontend serving + API proxy
- **Heroku ready** — Procfile + runtime.txt included

---

## Quick Start (Recommended)

### Prerequisites
- Python 3.10+
- Node.js 18+
- Git

### 1. Clone and Configure

```bash
git clone https://github.com/YOUR_USERNAME/SmartSaathiAI.git
cd SmartSaathiAI
```

Edit `backend/.env` with your keys:

```env
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_token_here
```

Get your keys:
- Groq: https://console.groq.com/keys
- GitHub Token: Settings → Developer Settings → Personal Access Tokens → Fine-grained → Gists: Read + Write

### 2. One-Command Launch

```bash
python setup.py
```

This automatically:
- Creates Python virtual environment
- Installs all Python packages
- Installs all Node packages
- Creates your private GitHub Gist database
- Starts the backend on `localhost:8000`
- Starts the frontend on `localhost:5173`
- Opens your browser

### Other launch modes

```bash
python setup.py --run     # Skip install, just start servers
python setup.py --build   # Docker build + run (requires Docker)
```

---

## Docker Deployment

```bash
# Make sure backend/.env is configured, then:
python setup.py --build

# Or manually:
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

---

## Heroku Deployment

[![Deploy To Heroku](https://www.herokucdn.com/deploy/button.svg)](https://dashboard.heroku.com/new?template=https://github.com/ltankush/SmartSaathiAI)

### Backend

```bash
cd backend
heroku create smartsaathi-api
heroku config:set GROQ_API_KEY=your_key
heroku config:set GITHUB_TOKEN=your_token
heroku config:set GITHUB_GIST_ID=your_gist_id
heroku config:set APP_ENV=production
heroku config:set CORS_ORIGINS=https://your-frontend-url.com
git subtree push --prefix backend heroku main
```

### Frontend (Vercel — free)

```bash
cd frontend
npm run build
# Deploy /frontend to Vercel or Netlify
# Set VITE_API_URL to your Heroku backend URL
```

---

## Project Structure

```
SmartSaathiAI/
│
├── setup.py                    ← One-command setup & launch
├── docker-compose.yml          ← Docker orchestration
├── .gitignore
├── README.md
│
├── backend/
│   ├── main.py                 ← FastAPI app entry point
│   ├── config.py               ← Settings from .env
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── Procfile                ← Heroku
│   ├── runtime.txt             ← Python 3.12
│   ├── .env                    ← Your secrets (never commit!)
│   ├── .env.example            ← Template
│   │
│   ├── services/
│   │   ├── groq_client.py      ← aiohttp Groq API client
│   │   ├── gist_client.py      ← aiohttp GitHub Gist client
│   │   └── indian_finance.py   ← All Indian finance math
│   │
│   └── api/
│       ├── chat.py             ← SSE streaming chat
│       ├── score.py            ← Bharat Money Score
│       ├── planner.py          ← FIRE planner
│       ├── tax.py              ← Tax optimizer
│       ├── voice.py            ← Whisper STT
│       └── session.py          ← Gist session management
│
└── frontend/
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    ├── Dockerfile
    ├── nginx.conf
    ├── index.html
    │
    ├── public/
    │   └── manifest.json       ← PWA manifest
    │
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        │
        ├── store/
        │   └── index.js        ← Zustand store
        │
        ├── utils/
        │   └── api.js          ← Axios + SSE client
        │
        ├── hooks/
        │   └── useVoiceRecorder.js
        │
        ├── components/
        │   ├── Navbar.jsx
        │   ├── HeroOrb.jsx     ← Three.js 3D sphere
        │   ├── ScoreCard.jsx   ← Animated BMS score
        │   ├── PageWrapper.jsx
        │   ├── FormComponents.jsx
        │   └── UI.jsx
        │
        └── pages/
            ├── Home.jsx
            ├── Score.jsx
            ├── Planner.jsx
            ├── Tax.jsx
            └── Chat.jsx
```

---

## API Reference

All endpoints are at `/api/...`. Interactive docs at `http://localhost:8000/api/docs`.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | SSE streaming AI chat |
| `POST` | `/api/score` | Calculate Bharat Money Score |
| `POST` | `/api/planner` | Generate FIRE plan |
| `POST` | `/api/tax` | Compare tax regimes |
| `POST` | `/api/voice/stt` | Whisper speech-to-text |
| `POST` | `/api/session/create` | Create session |
| `GET` | `/api/session/{id}` | Get session |
| `PUT` | `/api/session/{id}` | Update session |
| `GET` | `/api/health` | Health check |

---

## Groq Models Used

| Model | Use case | Free limit |
|---|---|---|
| `llama-3.3-70b-versatile` | Main AI mentor (chat) | 1K RPD, 100K TPD |
| `meta-llama/llama-4-scout-17b-16e-instruct` | Score/Planner/Tax summaries | 1K RPD, 500K TPD |
| `whisper-large-v3` | Voice to text | 2K RPD |
| `moonshotai/kimi-k2-instruct` | Fallback | 1K RPD, 300K TPD |

---

## Indian Finance Features

- **Tax slabs** — FY 2025-26 Old and New regime (exact)
- **Instruments** — PPF (7.1%), NPS, ELSS, EPF, HRA, LTA
- **Deductions** — 80C, 80D, 80CCD(1B), 24(b), standard deduction
- **FIRE math** — corpus = 25× annual expenses (4% rule adapted for India)
- **Inflation** — default 6% (India CPI historical avg)
- **Govt schemes** — APY, PMJSBY, PMJJBY, Mudra, SSY, PM Kisan, SCSS
- **SIP calculator** — monthly compounding with exact formula

---

## What Makes It Unique

1. **Voice in Hinglish** — Speak your salary in Hindi, Whisper transcribes it
2. **Zero login** — Session UUID in browser localStorage, data in private Gist
3. **India-first math** — Every calculation uses real Indian tax law, not generic finance
4. **Sarkari Yojana matcher** — Auto-detects which govt schemes you qualify for
5. **Streaming AI** — Groq's fast inference, token-by-token, feels instant on mobile
6. **3D visual** — Three.js animated orb that runs smooth on mid-range Android phones
7. **PWA ready** — Installable, works on 2G after first load

---

## Impact Model (Submission Requirement)

- **TAM**: 95% of 140 crore Indians = ~133 crore people without a financial plan
- **Advisor cost saved**: ₹25,000/year per user × 1 lakh users = ₹250 Cr/year saved
- **Tax savings found**: avg ₹8,000/user who optimizes regime × 1 lakh users = ₹80 Cr
- **Time saved**: 5 minutes vs 3–4 hours with a human advisor = 99.7% reduction
- **Infrastructure cost**: ₹0 (Groq free tier + GitHub Gist)

---

## Submission Details

- **GitHub**: All source code with commit history
- **Architecture**: FastAPI (async Python) ↔ Groq API + GitHub Gist ↔ React + Three.js
- **Demo**: `python setup.py` → live in 2 minutes

---

## License

MIT — Free to use, modify, and distribute.

---

*SmartSaathiAI — ET GenAI Hackathon 2026 · Powered by Groq + Llama + FastAPI*

*Investments mein risk hota hai. Past returns guarantee nahi dete. Always consult a SEBI-registered advisor for large financial decisions.*
