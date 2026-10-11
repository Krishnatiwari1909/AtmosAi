# ==============================================================================
# AtmosAI Backend Production Container
# Compatible with AWS App Runner, Amazon ECS Fargate & Docker
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (libgomp1 is required by LightGBM on Linux)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install backend Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy FastAPI backend application code
COPY backend/app ./app

# Copy ML intelligence engine, model weights, and ingestion scripts
COPY ml ./ml

# Configure environment variables
ENV PYTHONPATH="/app:/app/ml/ml:/app/ml:${PYTHONPATH}"
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

# Docker healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Launch production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
