#!/bin/bash
# Start all microservices and API gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVICES=(
    "iam-service:5001"
    "company-service:5002"
    "employee-service:5003"
    "attendance-service:5004"
    "leave-service:5005"
    "payroll-service:5006"
    "performance-service:5007"
    "training-service:5008"
    "onboarding-service:5009"
    "offboarding-service:5010"
    "movement-service:5011"
    "contracts-service:5012"
    "assets-service:5013"
    "benefits-service:5014"
    "disciplinary-service:5015"
    "compliance-service:5016"
    "announcements-service:5017"
    "analytics-service:5018"
    "salary-intelligence-service:5019"
    "exactai-service:5020"
    "notifications-service:5021"
    "tasks-service:5022"
    "hr-query-service:5023"
    "documents-service:5024"
    "integrations-service:5025"
)

mkdir -p logs

for entry in "${SERVICES[@]}"; do
    SERVICE="${entry%%:*}"
    PORT="${entry##*:}"
    echo "Starting $SERVICE on port $PORT..."
    cd "apps/$SERVICE"
    nohup npx ts-node src/main.ts > "../../logs/${SERVICE}.log" 2>&1 &
    echo "  PID: $!"
    cd ../..
    sleep 2
done

echo ""
echo "Starting API Gateway on port 3000..."
cd apps/api-gateway
nohup npx ts-node src/main.ts > ../../logs/api-gateway.log 2>&1 &
echo "  PID: $!"
cd ../..

echo ""
echo "All services started!"
echo "API Gateway: http://localhost:3000"
echo "Swagger UI:  http://localhost:3000/api"
echo ""
echo "Logs are in: $SCRIPT_DIR/logs/"
echo ""
echo "To stop all services: ./scripts/stop-all.sh"
