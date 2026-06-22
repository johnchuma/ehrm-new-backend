#!/bin/bash
# Run Prisma migrations for all services

set -e

echo "Running Prisma migrations for all services..."

SERVICES=(
    "iam-service:IAM_DATABASE_URL"
    "company-service:COMPANY_DATABASE_URL"
    "employee-service:EMPLOYEE_DATABASE_URL"
    "attendance-service:ATTENDANCE_DATABASE_URL"
    "leave-service:LEAVE_DATABASE_URL"
    "payroll-service:PAYROLL_DATABASE_URL"
    "performance-service:PERFORMANCE_DATABASE_URL"
    "training-service:TRAINING_DATABASE_URL"
    "onboarding-service:ONBOARDING_DATABASE_URL"
    "offboarding-service:OFFBOARDING_DATABASE_URL"
    "movement-service:MOVEMENT_DATABASE_URL"
    "contracts-service:CONTRACTS_DATABASE_URL"
    "assets-service:ASSETS_DATABASE_URL"
    "benefits-service:BENEFITS_DATABASE_URL"
    "disciplinary-service:DISCIPLINARY_DATABASE_URL"
    "compliance-service:COMPLIANCE_DATABASE_URL"
    "announcements-service:ANNOUNCEMENTS_DATABASE_URL"
    "analytics-service:ANALYTICS_DATABASE_URL"
    "salary-intelligence-service:SALARY_INTELLIGENCE_DATABASE_URL"
    "exactai-service:EXACTAI_DATABASE_URL"
    "notifications-service:NOTIFICATIONS_DATABASE_URL"
    "tasks-service:TASKS_DATABASE_URL"
    "hr-query-service:HR_QUERY_DATABASE_URL"
    "documents-service:DOCUMENTS_DATABASE_URL"
    "integrations-service:INTEGRATIONS_DATABASE_URL"
)

for entry in "${SERVICES[@]}"; do
    SERVICE="${entry%%:*}"
    ENV_VAR="${entry##*:}"
    echo "=== Migrating $SERVICE ==="
    cd "apps/$SERVICE"
    DATABASE_URL=$(printenv "$ENV_VAR") npx prisma generate
    DATABASE_URL=$(printenv "$ENV_VAR") npx prisma db push --accept-data-loss
    cd ../..
done

echo ""
echo "All migrations complete!"
