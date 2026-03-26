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
from api import chat, score, planner, tax, voice, session

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
    print("  All systems ready.")
    print("=" * 55)
    yield
    print("SmartSaathiAI shutting down.")


app = FastAPI(
    title="SmartSaathiAI API",
    description="India's AI-powered personal finance mentor",
    version="1.0.0",
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
app.include_router(chat.router,    prefix="/api", tags=["Chat"])
app.include_router(score.router,   prefix="/api", tags=["BMS Score"])
app.include_router(planner.router, prefix="/api", tags=["FIRE Planner"])
app.include_router(tax.router,     prefix="/api", tags=["Tax Optimizer"])
app.include_router(voice.router,   prefix="/api", tags=["Voice"])
app.include_router(session.router, prefix="/api", tags=["Session"])


@app.get("/api/health", tags=["Health"])
async def health():
    return {
        "status": "ok",
        "app": "SmartSaathiAI",
        "version": "1.0.0",
        "env": settings.app_env,
        "frontend_bundled": STATIC_DIR.exists(),
    }


# ── Static frontend (only present in Docker production build) ─────────────────
# The Dockerfile copies the Vite build output into static_frontend/.
# Structure:  static_frontend/index.html
#             static_frontend/assets/  (JS, CSS, fonts)
#             static_frontend/manifest.json  etc.
#
# Mount order matters in FastAPI:
#   1. /api  routes registered above — handled first, never fall through
#   2. /assets  static mount — serves hashed JS/CSS bundles efficiently
#   3. catch-all  — serves index.html for ALL other paths (React Router SPA)

if STATIC_DIR.exists():
    # Serve Vite's hashed asset bundle (JS, CSS, fonts, images)
    app.mount(
        "/assets",
        StaticFiles(directory=str(STATIC_DIR / "assets")),
        name="vite-assets",
    )

    # Serve any other static file at the root (manifest.json, favicon, etc.)
    # If the file exists on disk, send it directly. Otherwise fall through to SPA.
    @app.get("/{file_path:path}", include_in_schema=False)
    async def serve_spa(file_path: str):
        # Try to serve a real file first (manifest.json, favicon.ico, etc.)
        candidate = STATIC_DIR / file_path
        if candidate.exists() and candidate.is_file():
            return FileResponse(str(candidate))
        # Everything else → index.html  (React Router handles the routing)
        return FileResponse(str(STATIC_DIR / "index.html"))
