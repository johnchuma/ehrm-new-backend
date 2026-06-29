import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { PHASE_1_PERMISSIONS } from './permissions.seed';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.run();
  }

  async run() {
    this.logger.log('Bootstrap starting...');

    // Plans always run independently — never blocked by IAM errors
    try {
      await this.ensureDefaultPlans();
    } catch (err) {
      this.logger.error('Plan seeding failed', err);
    }

    try {
      const superAdminUser = await this.ensureSuperAdminUser();
      const permissions = await this.ensurePermissions(superAdminUser.id);
      const role = await this.ensureSuperAdminRole(superAdminUser.id);
      await this.grantAllPermissionsToRole(role.id, permissions, superAdminUser.id);
      await this.assignRoleToUser(superAdminUser.id, role.id);
      this.logger.log('Bootstrap complete.');
    } catch (err) {
      this.logger.error('Bootstrap IAM step failed (non-fatal)', err);
    }
  }

  private async ensureSuperAdminUser() {
    const email = (
      process.env.HRM_SUPER_ADMIN_EMAIL || 'admin@exactehrm.com'
    ).toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (existing.role !== 'System Administrator') {
        await this.prisma.user.update({
          where: { email },
          data: { role: 'System Administrator' },
        });
      }
      this.logger.log(`Super admin exists: ${email}`);
      return existing;
    }

    const hashed = await bcrypt.hash(
      process.env.HRM_SUPER_ADMIN_PASSWORD || 'Admin@2026!',
      12,
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        firstName: 'System',
        lastName: 'Administrator',
        fullName: 'System Administrator',
        role: 'System Administrator',
        isActive: true,
      },
    });
    this.logger.log(`Super admin created: ${email}`);
    return user;
  }

  private async ensurePermissions(createdBy: string) {
    const results = [];
    for (const p of PHASE_1_PERMISSIONS) {
      // Seed by the composite key first so legacy names do not violate (resource, action) uniqueness.
      const existingByPair = await this.prisma.permission.findUnique({
        where: { resource_action: { resource: p.module, action: p.action } },
      });

      let perm;
      if (existingByPair) {
        perm = await this.prisma.permission.update({
          where: { id: existingByPair.id },
          data: { description: p.description },
        });
      } else {
        const existingByName = await this.prisma.permission.findUnique({
          where: { name: p.name },
        });

        if (existingByName) {
          perm = await this.prisma.permission.update({
            where: { id: existingByName.id },
            data: {
              resource: p.module,
              action: p.action,
              description: p.description,
            },
          });
        } else {
          perm = await this.prisma.permission.create({
            data: {
              name: p.name,
              resource: p.module,
              action: p.action,
              description: p.description,
            },
          });
        }
      }
      results.push(perm);
    }
    this.logger.log(`Ensured ${results.length} permissions`);
    return results;
  }

  private async ensureSuperAdminRole(createdBy: string) {
    const existing = await this.prisma.role.findFirst({
      where: { name: 'System Administrator', scope: 'GLOBAL' },
    });
    if (existing) {
      this.logger.log('System Administrator role exists');
      return existing;
    }

    const role = await this.prisma.role.create({
      data: {
        name: 'System Administrator',
        slug: 'system-administrator',
        scope: 'GLOBAL',
        description: 'Full access to all system features across all companies',
        isSystem: true,
        isActive: true,
      },
    });
    this.logger.log('System Administrator role created');
    return role;
  }

  private async grantAllPermissionsToRole(
    roleId: string,
    permissions: Array<{ id: string }>,
    _createdBy: string,
  ) {
    const existing = await this.prisma.rolePermission.findMany({
      where: { roleId },
      select: { permissionId: true },
    });
    const existingIds = new Set(existing.map((e) => e.permissionId));
    const toAdd = permissions.filter((p) => !existingIds.has(p.id));

    if (toAdd.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: toAdd.map((p) => ({ roleId, permissionId: p.id })),
        skipDuplicates: true,
      });
      this.logger.log(`Granted ${toAdd.length} new permissions to System Administrator`);
    }
  }

  private async assignRoleToUser(userId: string, roleId: string) {
    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
    this.logger.log('System Administrator role assigned to super admin user');
  }

  private async ensureDefaultPlans() {
    const plans = [
      {
        name: 'HR Starter', slug: 'hr-starter', monthlyPrice: 2500, annualPrice: 25500, maxEmployees: 50,
        features: ['Employee Directory', 'Self-Service Portal', 'Leave Management', 'Attendance Tracking'],
        supportTier: 'Email', isHighlighted: false,
      },
      {
        name: 'HR Essentials', slug: 'hr-essentials', monthlyPrice: 4500, annualPrice: 45900, maxEmployees: 200,
        features: ['Employee Directory', 'Self-Service Portal', 'Leave Management', 'Attendance Tracking', 'Payroll Basic', 'ESS Mobile App'],
        supportTier: 'Email', isHighlighted: false,
      },
      {
        name: 'HR Professional', slug: 'hr-professional', monthlyPrice: 9000, annualPrice: 91800, maxEmployees: 1000,
        features: ['HR Essentials', 'Training & Development', 'Performance Reviews', 'Benefits & CTC', 'Analytics Dashboard'],
        supportTier: 'Priority', isHighlighted: true,
      },
      {
        name: 'Enterprise Suite', slug: 'enterprise-suite', monthlyPrice: 14000, annualPrice: 142800, maxEmployees: 5000,
        features: ['HR Professional', 'Compliance & Disciplinary', 'Tasks & Workflows', 'Exec Dashboards', 'API Access'],
        supportTier: 'Dedicated', isHighlighted: false,
      },
      {
        name: 'Intelligence Premium', slug: 'intelligence-premium', monthlyPrice: 18000, annualPrice: 183600, maxEmployees: -1,
        features: ['Enterprise Suite', 'ExactAI Copilot', 'Advanced Analytics', 'Salary Survey Data', 'Custom Integrations'],
        supportTier: 'Dedicated', isHighlighted: false,
      },
    ];

    for (const plan of plans) {
      const featuresJson = JSON.stringify(plan.features);
      await (this.prisma.plan as any).upsert({
        where: { slug: plan.slug },
        update: {
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          features: featuresJson,
          isHighlighted: plan.isHighlighted,
          supportTier: plan.supportTier,
          maxEmployees: plan.maxEmployees,
        },
        create: {
          name: plan.name,
          slug: plan.slug,
          monthlyPrice: plan.monthlyPrice,
          annualPrice: plan.annualPrice,
          maxEmployees: plan.maxEmployees,
          features: featuresJson,
          isHighlighted: plan.isHighlighted,
          supportTier: plan.supportTier,
          isActive: true,
        },
      });
    }
    this.logger.log('Default plans seeded');
  }
}
