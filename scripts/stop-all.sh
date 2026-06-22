#!/bin/bash
# Stop all running microservices and API gateway

echo "Stopping all services..."

pkill -f "ts-node src/main.ts" 2>/dev/null || true

sleep 2

if pgrep -f "ts-node src/main.ts" > /dev/null; then
    echo "Force killing remaining processes..."
    pkill -9 -f "ts-node src/main.ts" 2>/dev/null || true
fi

echo "All services stopped."
