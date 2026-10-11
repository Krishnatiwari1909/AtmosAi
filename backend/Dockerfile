# ==============================================================================
# AtmosAI Backend Container (build context: repository root or backend)
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (libgomp1 required for LightGBM OpenMP support)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# Set pythonpath
ENV PYTHONPATH="/app:/app/ml/ml:/app/ml:${PYTHONPATH}"
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]