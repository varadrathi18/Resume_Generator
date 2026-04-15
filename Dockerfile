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

# Expose the port Railway will assign
EXPOSE ${PORT:-8080}

# Start gunicorn pointing into the backend folder
CMD ["sh", "-c", "gunicorn --chdir backend app:app --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 120"]
