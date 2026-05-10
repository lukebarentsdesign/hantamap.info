# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Prepare backend
FROM python:3.12-slim
WORKDIR /app

# Install build dependencies for python packages
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Setup data volume directory
RUN mkdir -p /app/data

# Install Python deps
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend logic
COPY backend/ .

# Copy built Frontend assets into the python static serving directory
RUN mkdir -p /app/static
COPY --from=frontend-builder /app/frontend/dist /app/static

EXPOSE 8080
ENV PORT=8080

# Start the single process
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
