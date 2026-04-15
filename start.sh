#!/bin/sh
# start.sh — Entrypoint script for Railway deployment
# Ensures PORT is always a valid number
PORT="${PORT:-8080}"
echo "Starting gunicorn on port $PORT..."
exec gunicorn --chdir backend app:app --bind "0.0.0.0:$PORT" --workers 2 --timeout 120
