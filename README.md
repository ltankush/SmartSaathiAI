# SmartSaathiAI 🇮🇳

> **India's Agentic AI Personal Finance Mentor** — Built for the ET GenAI Hackathon 2026

> **Live Demo:** https://smartsaathi-ai.ltankush.me/

> **Demo Video in HD:** https://transfer.it/t/t6411ioVwRpS (357MB Please Check it Out.)

SmartSaathiAI is a full-stack agentic AI web application that gives every Indian access to a personalised financial advisor — completely free. Unlike traditional chatbots, it uses **real-time function calling** to execute actual financial calculations and return exact numbers, explained in friendly Hinglish.

---

## 🏆 What Makes It Different: Agentic AI

```
User: "Meri salary 12 lakh hai, kaunsa tax regime better?"

SmartSaathi THINKS → calls compare_tax_regimes(gross=1200000)
                   → gets REAL calculated numbers
                   → responds: "New regime mein ₹14,400 bachega. Here's why..."
```

The AI doesn't guess — it **calls real Python functions**, gets exact results, and explains them in simple Hinglish.

---

## ✨ Features (6 Tools + AI Chat)

| Feature | Description |
|---|---|
| **Bharat Money Score (BMS)** | 12 questions → score across 6 dimensions. AI summary + Govt scheme matcher. PDF report with watermark & disclaimer. |
| **FIRE Path Planner** | Age + income → roadmap with SIP amounts, PPF/NPS/ELSS allocation, and corpus milestones. Interactive Chart.js timeline. |
| **Tax Regime Optimizer** | Old vs New regime compared with exact numbers. Identifies every missed deduction. FY 2025-26. |
| **Goal-Based Planner** | Plan for house, car, education with preset goals. Exact monthly SIP per goal. Combined timeline chart. |
| **Spending Analyzer** | 10-category spending breakdown. 50/30/20 rule check. AI-powered spending audit. |
| **AI Money Mentor (Chat)** | SSE-streamed agentic chat. 5 real calculation tools. Voice input via Groq Whisper. Speaks Hinglish. |

### Additional Features
- 📄 **PDF Report Generation** — with SmartSaathiAI watermark and legal disclaimer
- 🎊 **Animated Score Reveal** — confetti for high scores, shake for low
- 🌐 **4 Languages** — English, Hindi, Tamil, Bengali
- 📱 **PWA Ready** — installable, works offline after first load
- 📲 **WhatsApp Share** — share BMS score with friends
- 💡 **Financial Tips Carousel** — season-aware tips on home page
- 📈 **MF/ETF Recommendations** — curated Indian fund data
- 🎨 **3D Three.js Orb** — animated hero with particle ring

---

## 🛠️ Tech Stack

### Backend
- **FastAPI** — async Python web framework
- **aiohttp** — all external HTTP calls (no requests, no httpx)
- **Groq API** — LLM function calling (Llama 3.3 70B) + Whisper STT
- **ReportLab** — server-side PDF generation with watermark
- **GitHub Gist** — free, private, forever JSON database
- **SSE (Server-Sent Events)** — real-time streaming AI responses

### Frontend
- **React 18** + **Vite** — lightning-fast dev + build
- **Three.js** + **@react-three/fiber** — 3D animated hero orb
- **Framer Motion** — page transitions, micro-animations, confetti
- **Tailwind CSS** — utility-first styling
- **Chart.js** — Line, Bar, Doughnut charts
- **Zustand** — global state with localStorage persistence
- **React Router v6** — SPA routing (7 pages)
- **4-language i18n** — EN/HI/TA/BN

### Infrastructure
- **Docker + Docker Compose** — one-command deployment
- **Nginx** — frontend serving + API proxy
- **Heroku + Vercel ready** — free cloud hosting

---

## 🚀 Quick Start

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
- Installs all Python packages (including ReportLab)
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

## 📐 Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full agent architecture document with diagrams.

Key highlights:
- **9 specialized agents** (Chat, Score, Planner, Tax, Goals, Spending, Report, Voice, Session)
- **Agentic tool-use** — LLM calls 5 real Python financial functions
- **Fallback chain** — tool call → regular streaming → error message
- **Zero PII** — only numeric financial data stored

---

## 📊 Impact Model

See [IMPACT_MODEL.md](IMPACT_MODEL.md) for the full quantified impact analysis.

| Impact | Year 1 (1L users) |
|---|---|
| Advisor cost saved | ₹250 Crore |
| Tax savings found | ₹96 Crore |
| Time saved vs advisor | 97.5% |
| Infrastructure cost | ₹0 |

---

## 🎥 3-Minute Demo Script

1. **Hero page** — 3D orb + "India ka apna AI Money Mentor" (2s)
2. **BMS Score** — Fill sample data → animated score reveal → confetti (20s)
3. **Download PDF** — Click → instant PDF with watermark & disclaimer (5s)
4. **Agentic Chat** — Voice: "Meri salary 10 lakh, kaunsa regime better?" → AI calls tax tool → real numbers (25s)
5. **FIRE Planner** — Interactive chart with milestone timeline (15s)
6. **Goal Planner** — Add house + education → combined SIP calculation (15s)
7. **Spending Analyzer** — Doughnut chart + 50/30/20 rule check (15s)
8. **Language Switch** — Switch to Hindi → UI updates (5s)
9. **Impact slide** — "133 crore Indians need this. It costs ₹0." (10s)
10. **Architecture** — Show agentic tool-use diagram (10s)

---

## 🔌 API Reference

All endpoints at `/api/...`. Interactive docs: `http://localhost:8000/api/docs`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Agentic SSE streaming AI chat (5 tools) |
| `POST` | `/api/score` | Calculate Bharat Money Score |
| `POST` | `/api/planner` | Generate FIRE plan |
| `POST` | `/api/tax` | Compare tax regimes |
| `POST` | `/api/goals` | Goal-based planner |
| `POST` | `/api/spending` | Spending analyzer |
| `POST` | `/api/report/bms` | Generate PDF report |
| `POST` | `/api/voice/stt` | Whisper speech-to-text |
| `POST` | `/api/session/create` | Create session |
| `GET` | `/api/session/{id}` | Get session |
| `GET` | `/api/health` | Health check |

---

## 🇮🇳 Indian Finance Features

- **Tax slabs** — FY 2025-26 Old and New regime (exact)
- **Instruments** — PPF (7.1%), NPS, ELSS, EPF, HRA, LTA
- **Deductions** — 80C, 80D, 80CCD(1B), 24(b), standard deduction
- **FIRE math** — corpus = 25× annual expenses (4% rule for India)
- **Inflation** — default 6% (India CPI historical avg)
- **Govt schemes** — APY, PMJSBY, PMJJBY, Mudra, SSY, PM Kisan, SCSS
- **MF recommendations** — top index funds, ELSS, NPS fund managers
- **SIP calculator** — monthly compounding with exact formula

---

## Groq Models Used

| Model | Use Case | Free Limit |
|---|---|---|
| `llama-3.3-70b-versatile` | Agentic chat (function calling + stream) | 1K RPD |
| `llama-4-scout-17b-16e` | Score/Planner/Tax/Goals/Spending summaries | 1K RPD |
| `whisper-large-v3` | Voice to text (Hindi + English) | 2K RPD |

---

## Submission Checklist

- [x] **GitHub Repository** — Public repo with full source code
- [x] **README** — Clear setup instructions + architecture summary
- [x] **Commit History** — Shows build process
- [x] **Architecture Document** — Agent roles, tool integrations, error handling
- [x] **Impact Model** — Quantified estimates with assumptions
- [x] **Demo Script** — [3-minute pitch video guide](https://transfer.it/t/t6411ioVwRpS) (357MB Please Check it Out.)

---

## License

MIT — Free to use, modify, and distribute.

---

*SmartSaathiAI v2.0 — ET GenAI Hackathon 2026 · Powered by Groq + Llama + FastAPI*

*Investments mein risk hota hai. Past returns guarantee nahi dete. Always consult a SEBI-registered advisor for large financial decisions.*

---
### Note

**This is just a demo Project for ET GenAI Hackathon 2026 If you wanna contribute to this project you can fork this repository and make your changes and then submit a pull request. I will review it and if it is good I will merge it and Change your Variables or API Keys, Database or anything.**

**Thank you for checking out my project. I hope you liked it.**

**If you have any questions or suggestions, feel free to open an issue or submit a pull request.**

**Happy Coding!**

---
