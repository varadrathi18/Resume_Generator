# Dockerfile — Production container for the Flask backend + ML models
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cached layer)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the entrypoint script
COPY start.sh ./start.sh
RUN chmod +x ./start.sh

# Default port (Railway overrides this at runtime)
ENV PORT=8080

EXPOSE 8080

# Use the entrypoint script — guaranteed shell expansion
ENTRYPOINT ["./start.sh"]
