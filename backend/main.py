from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from config import settings
from api import chat, score, planner, tax, voice, session, report, goals, spending

# Built React frontend lives here inside the Docker image
STATIC_DIR = Path(__file__).parent / "static_frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 55)
    print("  SmartSaathiAI starting up...")
    from services.gist_client import gist_client
    try:
        gist_id = await gist_client._ensure_gist()
        print(f"  Gist DB connected: {gist_id[:8]}...")
    except Exception as e:
        print(f"  WARNING: Gist connection failed: {e}")
    print("  Agentic tool-use enabled (5 financial tools)")
    print("  PDF report generation enabled (ReportLab)")
    print("  All systems ready.")
    print("=" * 55)
    yield
    print("SmartSaathiAI shutting down.")


app = FastAPI(
    title="SmartSaathiAI API",
    description="India's AI-powered personal finance mentor — with agentic tool-use, PDF reports, goal planner, and spending analyzer.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS — only needed for local dev where frontend runs on a different port.
# In Docker production everything is on the same origin so this is a no-op.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # safe: API routes are /api/* only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API routes (always registered, prefix /api) ───────────────────────────────
app.include_router(chat.router,     prefix="/api", tags=["Chat (Agentic)"])
app.include_router(score.router,    prefix="/api", tags=["BMS Score"])
app.include_router(planner.router,  prefix="/api", tags=["FIRE Planner"])
app.include_router(tax.router,      prefix="/api", tags=["Tax Optimizer"])
app.include_router(goals.router,    prefix="/api", tags=["Goal Planner"])
app.include_router(spending.router, prefix="/api", tags=["Spending Analyzer"])
app.include_router(report.router,   prefix="/api", tags=["PDF Reports"])
app.include_router(voice.router,    prefix="/api", tags=["Voice"])
app.include_router(session.router,  prefix="/api", tags=["Session"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": "SmartSaathiAI",
        "version": "2.0.0",
        "env": settings.app_env,
        "frontend_bundled": STATIC_DIR.exists(),
        "features": [
            "agentic_tool_use",
            "pdf_report_generation",
            "goal_based_planner",
            "spending_analyzer",
            "sse_streaming_chat",
            "voice_input_whisper",
            "bms_score",
            "fire_planner",
            "tax_optimizer",
        ],
    }


# ── Static frontend (only present in Docker production build) ─────────────────
if STATIC_DIR.exists():
    app.mount(
        "/assets",
        StaticFiles(directory=str(STATIC_DIR / "assets")),
        name="vite-assets",
    )

    @app.get("/{file_path:path}", include_in_schema=False)
    async def serve_spa(file_path: str):
        candidate = STATIC_DIR / file_path
        if candidate.exists() and candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(STATIC_DIR / "index.html"))
else:
    @app.get("/", include_in_schema=False)
    async def backend_only_root():
        return {
            "status": "ok",
            "message": "Backend is running. Frontend bundle is not present in this deployment.",
            "health": "/api/health",
            "docs": "/api/docs",
        }
