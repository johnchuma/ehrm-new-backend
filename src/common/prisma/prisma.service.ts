import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getTenantContext } from '../tenant/tenant.context';

// Models that have a companyId column and must be scoped per tenant.
// Only include models where companyId physically exists in the schema —
// Prisma will reject an unknown field in WHERE at runtime.
const TENANT_MODELS = new Set([
  'user',            // companyId?
  'role',            // companyId?
  'auditLog',        // companyId?
  'branch',          // companyId
  'department',      // companyId
  'companySettings', // companyId
  'subscription',    // companyId
  'salaryGrade',
  'workingDayPattern',
  'workspaceLocation',
  'workspaceApprovalConfig',
  'attendance',
  'offboarding',
  'payslip',
  'salaryAdvance',
  'payrollRun',
  'payrollRunItem',
  'payrollAdjustment',
  'payrollComponent',
]);

// Operations where we inject companyId into the WHERE clause
const READ_OPS = new Set(['findMany', 'findFirst', 'findFirstOrThrow', 'count', 'aggregate', 'groupBy']);

// Operations where we stamp companyId onto the data being written
const WRITE_OPS = new Set(['create', 'createMany']);

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ log: ['error'] });
    this.$use(this.tenantMiddleware.bind(this));
  }

  async onModuleInit() {
    await this.$connect();
  }

  private async tenantMiddleware(params: any, next: (params: any) => Promise<any>) {
    const { companyId, bypassRls } = getTenantContext();

    // No tenant context or explicitly bypassed — run query as-is
    if (!companyId || bypassRls) return next(params);

    const model = params.model ? params.model.charAt(0).toLowerCase() + params.model.slice(1) : '';

    if (!TENANT_MODELS.has(model)) return next(params);

    if (READ_OPS.has(params.action)) {
      params.args = params.args ?? {};
      params.args.where = {
        ...params.args.where,
        companyId,
      };
    }

    if (WRITE_OPS.has(params.action)) {
      if (params.action === 'create') {
        params.args = params.args ?? {};
        params.args.data = { ...params.args.data, companyId };
      }
      if (params.action === 'createMany') {
        params.args = params.args ?? {};
        params.args.data = Array.isArray(params.args.data)
          ? params.args.data.map((row: any) => ({ ...row, companyId }))
          : { ...params.args.data, companyId };
      }
    }

    return next(params);
  }
}
