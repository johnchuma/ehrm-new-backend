import * as path from 'path';
import * as fs from 'fs';

export const DATABASE_URLS = {
  iam: process.env.IAM_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-iam',
  company: process.env.COMPANY_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-company',
  employee: process.env.EMPLOYEE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-employee',
  attendance: process.env.ATTENDANCE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-attendance',
  leave: process.env.LEAVE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-leave',
  payroll: process.env.PAYROLL_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-payroll',
  performance: process.env.PERFORMANCE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-performance',
  training: process.env.TRAINING_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-training',
  onboarding: process.env.ONBOARDING_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-onboarding',
  offboarding: process.env.OFFBOARDING_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-offboarding',
  movement: process.env.MOVEMENT_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-movement',
  contracts: process.env.CONTRACTS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-contracts',
  assets: process.env.ASSETS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-assets',
  benefits: process.env.BENEFITS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-benefits',
  disciplinary: process.env.DISCIPLINARY_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-disciplinary',
  compliance: process.env.COMPLIANCE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-compliance',
  announcements: process.env.ANNOUNCEMENTS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-announcements',
  analytics: process.env.ANALYTICS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-analytics',
  'salary-intelligence': process.env.SALARY_INTELLIGENCE_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-salary-intelligence',
  exactai: process.env.EXACTAI_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-exactai',
  notifications: process.env.NOTIFICATIONS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-notifications',
  tasks: process.env.TASKS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-tasks',
  'hr-query': process.env.HR_QUERY_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-hr-query',
  documents: process.env.DOCUMENTS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-documents',
  integrations: process.env.INTEGRATIONS_DATABASE_URL || 'mysql://root@localhost:3306/ehrm-integrations',
};

export function createPrismaClient(serviceName: string): any {
  const url = DATABASE_URLS[serviceName];
  if (!url) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const name = serviceName.replace(/[^a-z]/g, '');
  const { PrismaClient } = require(`${process.cwd()}/node_modules/.prisma/client-${name}`);
  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}
