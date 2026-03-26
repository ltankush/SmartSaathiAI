#!/usr/bin/env python3
"""
SmartSaathiAI — One-command launcher.

  python setup.py          →  Docker build + run  (recommended, nothing else needed)
  python setup.py --local  →  Run locally with Python + Node (dev mode)
  python setup.py --stop   →  Stop the running container

Docker mode needs only: Docker Desktop (https://www.docker.com/products/docker-desktop)
Local mode needs: Python 3.10+ and Node.js 18+
"""

import os, sys, time, shutil, subprocess, platform, json, re, argparse
from pathlib import Path

ROOT     = Path(__file__).parent
BACKEND  = ROOT / "backend"
FRONTEND = ROOT / "frontend"
ENV      = BACKEND / ".env"

G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"
B = "\033[94m"; C = "\033[96m"; W = "\033[1m"; X = "\033[0m"

def ok(m):   print(f"{G}  ✓  {m}{X}")
def info(m): print(f"{B}  →  {m}{X}")
def warn(m): print(f"{Y}  ⚠  {m}{X}")
def hr():    print(f"{C}{'─'*52}{X}")

def err(m):
    print(f"{R}  ✗  {m}{X}")
    sys.exit(1)

def run(cmd, cwd=None, capture=False):
    return subprocess.run(
        cmd, shell=True, cwd=cwd or ROOT,
        capture_output=capture, text=True
    )

def banner():
    print(f"""
{W}{C}  ╔══════════════════════════════════════════════╗
  ║         SmartSaathiAI  •  v1.0              ║
  ║     India's AI Money Mentor — ET 2026       ║
  ╚══════════════════════════════════════════════╝{X}
""")


# ── .env helpers ──────────────────────────────────────────────────────────────

def ensure_env():
    hr()
    info("Checking backend/.env …")
    example = BACKEND / ".env.example"

    if not ENV.exists():
        if example.exists():
            shutil.copy(example, ENV)
            warn(".env created from template.")
        else:
            err("backend/.env not found.")

    txt = ENV.read_text()
    bad = []
    for line in txt.splitlines():
        if line.startswith("GROQ_API_KEY="):
            v = line.split("=", 1)[1].strip()
            if not v or "your_groq" in v:
                bad.append("GROQ_API_KEY")
        if line.startswith("GITHUB_TOKEN="):
            v = line.split("=", 1)[1].strip()
            if not v or "your_github" in v:
                bad.append("GITHUB_TOKEN")

    if bad:
        print(f"""
{R}  Missing values in backend/.env:{X}  {', '.join(bad)}

  {W}Get your keys:{X}
    Groq API key  →  https://console.groq.com/keys
    GitHub token  →  github.com/settings/tokens
                     (Fine-grained → Gists: read + write)

  Then edit  backend/.env  and run:  python setup.py
""")
        sys.exit(1)

    ok(".env is configured")


def create_gist_if_needed():
    txt = ENV.read_text()
    gist_id = ""
    token = ""

    for line in txt.splitlines():
        if line.startswith("GITHUB_GIST_ID="):
            gist_id = line.split("=", 1)[1].strip()
        if line.startswith("GITHUB_TOKEN="):
            token = line.split("=", 1)[1].strip()

    if gist_id:
        ok(f"Gist DB already configured: {gist_id[:8]}…")
        return

    hr()
    info("Creating your private GitHub Gist database …")
    try:
        import urllib.request
        payload = json.dumps({
            "description": "SmartSaathiAI Session Store",
            "public": False,
            "files": {
                "smartsaathi_sessions.json": {
                    "content": json.dumps({"sessions": {}}, indent=2)
                }
            }
        }).encode()

        req = urllib.request.Request(
            "https://api.github.com/gists",
            data=payload,
            headers={
                "Authorization": f"token {token}",
                "Content-Type": "application/json",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            method="POST"
        )
        with urllib.request.urlopen(req) as resp:
            gist_id = json.loads(resp.read())["id"]

        new = re.sub(r"GITHUB_GIST_ID=.*", f"GITHUB_GIST_ID={gist_id}", txt)
        if "GITHUB_GIST_ID=" not in new:
            new += f"\nGITHUB_GIST_ID={gist_id}\n"
        ENV.write_text(new)
        ok(f"Gist created and saved to .env: {gist_id[:8]}…")

    except Exception as e:
        warn(f"Gist auto-create failed ({e}). Will retry on first server start.")


# ── Docker path ───────────────────────────────────────────────────────────────

def check_docker():
    hr()
    info("Checking Docker …")
    r = run("docker info", capture=True)
    if r.returncode != 0:
        err(
            "Docker is not running or not installed.\n\n"
            "  Install Docker Desktop:\n"
            "    https://www.docker.com/products/docker-desktop\n\n"
            "  Start it, then run:  python setup.py"
        )
    ok("Docker is running")


def docker_run():
    check_docker()
    ensure_env()
    create_gist_if_needed()

    hr()
    info("Building SmartSaathiAI (first time takes ~3-4 minutes) …")
    print(f"  {Y}Please wait — building frontend + backend into one container{X}\n")

    r = run("docker compose up --build -d")
    if r.returncode != 0:
        err("docker compose failed. Check output above.")

    info("Waiting for the server to be healthy …")
    for i in range(40):
        time.sleep(3)
        r = run(
            'docker inspect --format "{{.State.Health.Status}}" smartsaathi',
            capture=True
        )
        status = r.stdout.strip().strip('"')
        if status == "healthy":
            break
        print(f"    … starting ({i * 3}s elapsed)", end="\r")
    print()

    url = "http://localhost:8000"
    print(f"""
{W}{G}  ╔══════════════════════════════════════════════╗
  ║       SmartSaathiAI is LIVE!               ║
  ║                                             ║
  ║   Open your browser →  {url:<20} ║
  ║   API Docs          →  {url+"/api/docs":<20} ║
  ║                                             ║
  ║   To stop:   python setup.py --stop         ║
  ╚══════════════════════════════════════════════╝{X}
""")
    _open_browser(url)


def docker_stop():
    hr()
    info("Stopping SmartSaathiAI …")
    run("docker compose down")
    ok("Container stopped.")


# ── Local dev path ────────────────────────────────────────────────────────────

def check_python_version():
    v = sys.version_info
    if v.major < 3 or (v.major == 3 and v.minor < 10):
        err(f"Python 3.10+ required. You have {v.major}.{v.minor}.")
    ok(f"Python {v.major}.{v.minor}.{v.micro}")


def check_node():
    r = run("node --version", capture=True)
    if r.returncode != 0:
        err("Node.js not found. Install v18+ from https://nodejs.org")
    ok(f"Node.js {r.stdout.strip()}")


def install_python_deps():
    hr()
    info("Setting up Python virtual environment …")
    venv = BACKEND / ".venv"
    win  = platform.system() == "Windows"
    pip  = str(venv / ("Scripts/pip" if win else "bin/pip"))
    uvi  = str(venv / ("Scripts/uvicorn" if win else "bin/uvicorn"))

    if not venv.exists():
        run(f'"{sys.executable}" -m venv .venv', cwd=BACKEND)

    r = run(f'"{pip}" install -r requirements.txt -q', cwd=BACKEND)
    if r.returncode != 0:
        err("pip install failed. Check your internet connection.")

    ok("Python packages installed")
    return uvi


def install_node_deps():
    hr()
    info("Installing Node.js packages …")
    if not (FRONTEND / "node_modules").exists():
        r = run("npm install --silent", cwd=FRONTEND)
        if r.returncode != 0:
            err("npm install failed.")
    ok("Node packages installed")


def local_run(uvi):
    hr()
    url = "http://localhost:5173"
    print(f"""
{W}{G}  ╔══════════════════════════════════════════════╗
  ║       SmartSaathiAI (local dev mode)        ║
  ║                                             ║
  ║   Frontend  →  {url:<27}║
  ║   Backend   →  http://localhost:8000        ║
  ║   API Docs  →  http://localhost:8000/api/docs ║
  ║                                             ║
  ║   Press Ctrl+C to stop both servers         ║
  ╚══════════════════════════════════════════════╝{X}
""")
    win = platform.system() == "Windows"

    backend_proc = subprocess.Popen(
        [uvi, "main:app", "--reload", "--port", "8000", "--host", "0.0.0.0"],
        cwd=BACKEND
    )
    time.sleep(2)

    frontend_proc = subprocess.Popen(
        ["npm.cmd" if win else "npm", "run", "dev"],
        cwd=FRONTEND,
        shell=win
    )
    time.sleep(2)
    _open_browser(url)

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        warn("\nShutting down …")
        frontend_proc.terminate()
        backend_proc.terminate()
        ok("All servers stopped. Goodbye!")


def _open_browser(url):
    try:
        if platform.system() == "Windows":
            run(f"start {url}")
        elif sys.platform == "darwin":
            run(f"open {url}")
        else:
            run(f"xdg-open {url}")
    except Exception:
        pass


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    banner()
    ap = argparse.ArgumentParser(
        description="SmartSaathiAI — one-command launcher"
    )
    ap.add_argument(
        "--local",
        action="store_true",
        help="Run locally with Python + Node.js (dev mode, no Docker needed)"
    )
    ap.add_argument(
        "--stop",
        action="store_true",
        help="Stop the running Docker container"
    )
    args = ap.parse_args()

    if args.stop:
        docker_stop()
        return

    if args.local:
        hr()
        info("Local dev mode")
        check_python_version()
        check_node()
        ensure_env()
        create_gist_if_needed()
        uvi = install_python_deps()
        install_node_deps()
        local_run(uvi)
    else:
        # Default path — Docker only, nothing else needed on the machine
        docker_run()


if __name__ == "__main__":
    main()
