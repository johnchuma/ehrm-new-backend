#!/bin/bash

echo "Creating MySQL databases for ExactEHRM microservices..."

MYSQL_CMD="mysql -u root"

if ! command -v mysql &> /dev/null; then
    echo "MySQL client not found. Please install MySQL first."
    exit 1
fi

SERVICES=(
    "ehrm-iam"
    "ehrm-company"
    "ehrm-employee"
    "ehrm-attendance"
    "ehrm-leave"
    "ehrm-payroll"
    "ehrm-performance"
    "ehrm-training"
    "ehrm-onboarding"
    "ehrm-offboarding"
    "ehrm-movement"
    "ehrm-contracts"
    "ehrm-assets"
    "ehrm-benefits"
    "ehrm-disciplinary"
    "ehrm-compliance"
    "ehrm-announcements"
    "ehrm-analytics"
    "ehrm-salary-intelligence"
    "ehrm-exactai"
    "ehrm-notifications"
    "ehrm-tasks"
    "ehrm-hr-query"
    "ehrm-documents"
    "ehrm-integrations"
)

for db in "${SERVICES[@]}"; do
    echo "Creating database: $db"
    $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS \`$db\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
done

echo ""
echo "All databases created successfully!"
echo "Total: ${#SERVICES[@]} databases"
