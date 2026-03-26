#!/usr/bin/env sh
set -eu

PORT="${PORT:-8000}"

# Single-process uvicorn keeps memory lower on small dynos.
exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
