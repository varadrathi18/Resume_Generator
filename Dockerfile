# Dockerfile — Production container for the Flask backend + ML models
# Used by Railway for a guaranteed, error-free deployment.

FROM python:3.11-slim

# Install system dependencies needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy only backend requirements first (Docker layer caching optimization)
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory
COPY backend/ ./backend/

# Default port — Railway will override this with its own PORT variable
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Start gunicorn (shell form ensures $PORT is expanded properly)
CMD gunicorn --chdir backend app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120
