# Multi-Stage Production Dockerfile for Authentix Backend & Deep Learning Model
FROM python:3.10-slim AS builder

WORKDIR /app

# Install system build dependencies for OpenCV and C extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY webapp/backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Production Image Stage
FROM python:3.10-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY . /app

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV TF_CPP_MIN_LOG_LEVEL=2

CMD ["uvicorn", "webapp.backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
