# ─────────────────────────────────────────────────
# Stage 1: Build React frontend
# ─────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --silent

COPY frontend/ ./
RUN npm run build


# ─────────────────────────────────────────────────
# Stage 2: Python backend + serve frontend as static
# ─────────────────────────────────────────────────
FROM python:3.12-slim AS final

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./

# Copy built frontend into a static folder the backend will serve
COPY --from=frontend-builder /app/frontend/dist ./static_frontend

# Expose default port (Heroku overrides this with $PORT at runtime)
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Keep runtime startup identical across Docker and Heroku Procfile.
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1
