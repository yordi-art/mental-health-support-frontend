#!/bin/bash
# Start the Python AI microservice
# Usage: ./start_ai.sh
cd "$(dirname "$0")"
echo "[AI] Starting Mental Health AI microservice on port 8000..."
python3 app.py
