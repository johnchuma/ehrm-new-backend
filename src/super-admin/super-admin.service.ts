import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../modules/notifications/email.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateCompanyDto, UpdateCompanyStatusDto } from './dto/update-company.dto';
import * as bcrypt from 'bcryptjs';

const DEFAULT_USER_PASSWORD =
  process.env.DEFAULT_USER_PASSWORD || 'ChangeMe@2026!';

/**
 * The single protected root super-admin account. It can NEVER be deleted or
 * deactivated by anyone — including itself and other super admins — as a hard
 * guard against locking every admin out of the platform. Matched
 * case-insensitively; overridable via the PROTECTED_ROOT_ADMIN_EMAIL env var.
 */
const PROTECTED_ROOT_ADMIN_EMAIL = (
  process.env.PROTECTED_ROOT_ADMIN_EMAIL || 'exactonlinesoftware@gmail.com'
).toLowerCase();

const TANZANIA_LEAVE_DEFAULTS = [
  { name: 'Annual Leave',    code: 'AL', daysPerYear: 28,  isPaid: true,  gender: null, minServiceDays: 0 },
  { name: 'Sick Leave',      code: 'SL', daysPerYear: 126, isPaid: true,  gender: null, minServiceDays: 0 },
  { name: 'Maternity Leave', code: 'ML', daysPerYear: 84,  isPaid: true,  gender: 'FEMALE', minServiceDays: 0 },
  { name: 'Paternity Leave', code: 'PL', daysPerYear: 3,   isPaid: true,  gender: 'MALE',   minServiceDays: 0 },
  { name: 'Compassionate',   code: 'CL', daysPerYear: 3,   isPaid: true,  gender: null, minServiceDays: 0 },
];

@Injectable()
export class SuperAdminService {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  /**
   * Defensive role matching, mirroring AuthService: a "System Administrator"
   * must be recognised regardless of stray casing or separator drift.
   */
  private isSuperAdminRole(role?: string | null): boolean {
    if (!role) return false;
    const normalized = role.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
    return normalized === 'system administrator' || normalized === 'system admin';
  }

  /** True when the email is the protected root admin (case-insensitive). */
  private isProtectedRootEmail(email?: string | null): boolean {
    return !!email && email.toLowerCase() === PROTECTED_ROOT_ADMIN_EMAIL;
  }

  /**
   * Resolve a free-form role *name* to a Role record and link it to the user
   * via UserRole. Super-admins resolve to the GLOBAL System Administrator role;
   * everything else prefers a company-scoped role, falling back to a system role.
   * Returns the linked Role, or null when no matching role exists.
   * Accepts a Prisma client or a transaction client.
   */
  private async resolveAndAssignRole(
    tx: any,
    userId: string,
    roleName: string,
    companyId?: string | null,
  ) {
    let roleRecord: { id: string; name: string } | null;

    if (this.isSuperAdminRole(roleName)) {
      roleRecord = await tx.role.findFirst({
        where: { name: 'System Administrator', scope: 'GLOBAL' },
        select: { id: true, name: true },
      });
    } else {
      roleRecord = await tx.role.findFirst({
        where: companyId
          ? { name: roleName, OR: [{ companyId }, { isSystem: true }] }
          : { name: roleName, isSystem: true },
        // Prefer a company-specific role over a system role of the same name.
        orderBy: { companyId: 'desc' },
        select: { id: true, name: true },
      });
    }

    if (roleRecord) {
      await tx.userRole.upsert({
        where: { userId_roleId: { userId, roleId: roleRecord.id } },
        update: {},
        create: { userId, roleId: roleRecord.id },
      });
    }

    return roleRecord;
  }

  /** Best-effort welcome email with credentials + email-confirmation link. */
  private sendWelcomeEmail(to: string, firstName: string, password: string, userId: string) {
    const confirmToken = this.jwt.sign(
      { sub: userId, type: 'email_confirm' },
      { expiresIn: '48h' },
    );
    const confirmUrl = `${process.env.FRONTEND_URL || 'https://demo.exactehrm.co.tz'}/confirm-email?token=${confirmToken}`;
    const bc = this.email.brandColor;
    this.email
      .send(
        to,
        'Welcome to ExactEHRM — Your Account is Ready',
        this.email.buildHtml(`
          <h2 style="color:${bc};margin:0 0 16px">Welcome to ExactEHRM!</h2>
          <p>Hi ${firstName}, an account has been created for you.</p>
          <p style="margin:16px 0;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee">
            <strong>Login credentials:</strong><br/>
            Email: <strong>${to}</strong><br/>
            Password: <strong>${password}</strong>
          </p>
          <p>Please confirm your email by clicking the button below:</p>
          <p style="text-align:center;margin:24px 0">
            <a href="${confirmUrl}" style="display:inline-block;background:${bc};color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px">Confirm my account</a>
          </p>
          <p style="color:#888;font-size:13px">This link expires in 48 hours.</p>
        `),
      )
      .catch(() => {});
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      newCompaniesThisMonth,
      totalUsers,
      activeUsers,
      totalPlans,
      recentCompanies,
      recentAuditLogs,
    ] = await Promise.all([
      this.prisma.company.count({ where: { deletedAt: null } }),
      this.prisma.company.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.company.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
      this.prisma.company.count({
        where: { createdAt: { gte: thirtyDaysAgo }, deletedAt: null },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.plan.count({ where: { isActive: true } }),
      this.prisma.company.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          email: true,
          status: true,
          industry: true,
          subscriptionPlan: true,
          createdAt: true,
        },
      }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          userId: true,
          action: true,
          resource: true,
          companyId: true,
          createdAt: true,
        },
      }),
    ]);

    const companyGrowth = await this.prisma.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT
        DATE_FORMAT(createdAt, '%Y-%m') AS month,
        COUNT(*) AS count
      FROM companies
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND deletedAt IS NULL
      GROUP BY month
      ORDER BY month ASC
    `;

    return {
      stats: {
        totalCompanies,
        activeCompanies,
        suspendedCompanies,
        newCompaniesThisMonth,
        totalUsers,
        activeUsers,
        availablePlans: totalPlans,
      },
      charts: {
        companyGrowth: companyGrowth.map((r) => ({
          month: r.month,
          count: Number(r.count),
        })),
      },
      recentCompanies,
      recentActivity: recentAuditLogs,
    };
  }

  // ─── COMPANIES ───────────────────────────────────────────────────────────────

  async getAllCompanies(
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
      if (status !== 'DELETED') where.deletedAt = null;
    } else {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { tin: { contains: search } },
      ];
    }

    const [total, companies] = await Promise.all([
      this.prisma.company.count({ where }),
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          settings: {
            select: { id: true, payrollCycle: true },
          },
          _count: {
            select: { branches: true, departments: true },
          },
        },
      }),
    ]);

    const enriched = await Promise.all(
      companies.map(async (company) => {
        const userCount = await this.prisma.user.count({
          where: { companyId: company.id },
        });
        return { ...company, userCount };
      }),
    );

    return {
      data: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  async getCompanyById(id: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        branches: { where: { isActive: true }, select: { id: true, name: true, city: true } },
        departments: { where: { isActive: true }, select: { id: true, name: true } },
        _count: { select: { branches: true, departments: true, employees: true } },
      },
    });

    if (!company) throw new NotFoundException('Company not found');

    const [userCount, adminRole, recentActivity] = await Promise.all([
      this.prisma.user.count({ where: { companyId: id } }),
      this.prisma.role.findFirst({
        where: { name: 'Company Admin', isSystem: true },
        select: { id: true, name: true },
      }),
      this.prisma.auditLog.findMany({
        where: { companyId: id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, action: true, resource: true, userId: true, createdAt: true },
      }),
    ]);

    return {
      ...company,
      userCount,
      employeeCount: company._count?.employees ?? 0,
      adminRole,
      recentActivity,
    };
  }

  async createCompany(dto: CreateCompanyDto, createdBy: string) {
    if (!dto.companyAdminEmail) {
      throw new BadRequestException('companyAdminEmail is required');
    }

    if (dto.tin) {
      const tinExists = await this.prisma.company.findFirst({ where: { tin: dto.tin } });
      if (tinExists) throw new ConflictException('A company with this TIN already exists');
    }

    const emailExists = await this.prisma.company.findFirst({ where: { email: dto.email } });
    if (emailExists) throw new ConflictException('A company with this email already exists');

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now();

    const result = await this.prisma.$transaction(
      async (tx) => {
        // 1. Create company
        const company = await tx.company.create({
          data: {
            name: dto.name,
            slug,
            email: dto.email,
            phone: dto.phone ?? '',
            tin: dto.tin,
            city: dto.city,
            country: dto.country ?? 'Tanzania',
            industry: dto.industry,
            size: dto.size,
            website: dto.website,
            workspaceType: dto.workspaceType ?? 'SaaS',
            status: 'ACTIVE',
          },
        });

        // 2. Company settings with Tanzania defaults
        await tx.companySettings.create({
          data: {
            companyId: company.id,
            payrollCycle: 'MONTHLY',
            workHours: '8',
            overtimeRate: '1.5',
            generalSettings: JSON.stringify({
              timezone: 'Africa/Dar_es_Salaam',
              currency: 'TZS',
              dateFormat: 'dd/MM/yyyy',
              locale: 'sw-TZ',
              fiscalYearStart: '01-01',
            }),
            taxSettings: JSON.stringify({
              paye: true,
              nssf: true,
              psssf: false,
              sdl: true,
              wcf: true,
            }),
          },
        });

        // 3. Find the system Company Admin role
        const companyAdminRole = await tx.role.findFirst({
          where: { name: 'Company Admin', isSystem: true },
        });
        if (!companyAdminRole) throw new Error('Company Admin system role not found. Run bootstrap first.');

        // 4. Create or find admin user
        let adminUser = await tx.user.findUnique({
          where: { email: dto.companyAdminEmail },
        });
        let isNewAdminUser = false;
        // Raw temp password is needed for the welcome email so the admin can
        // actually log in; only set when we create a brand-new user.
        let adminRawPassword: string | null = null;

        if (!adminUser) {
          isNewAdminUser = true;
          adminRawPassword =
            process.env.DEFAULT_COMPANY_ADMIN_PASSWORD || 'ChangeMe@2026!';
          const tempPassword = await bcrypt.hash(adminRawPassword, 12);
          adminUser = await tx.user.create({
            data: {
              email: dto.companyAdminEmail,
              password: tempPassword,
              firstName: dto.adminFirstName ?? 'Company',
              lastName: dto.adminLastName ?? 'Admin',
              fullName: `${dto.adminFirstName ?? 'Company'} ${dto.adminLastName ?? 'Admin'}`,
              companyId: company.id,
              // Mirror public registration: the user stays inactive until they
              // confirm via the verification email sent after this transaction.
              isActive: false,
            },
          });
        } else {
          // Update existing user's companyId if they don't have one
          if (!adminUser.companyId) {
            adminUser = await tx.user.update({
              where: { id: adminUser.id },
              data: { companyId: company.id },
            });
          }
        }

        // 5. Assign Company Admin role to admin user
        await tx.userRole.upsert({
          where: { userId_roleId: { userId: adminUser.id, roleId: companyAdminRole.id } },
          update: {},
          create: { userId: adminUser.id, roleId: companyAdminRole.id },
        });

        // 6. Link subscription if plan provided
        let subscription = null;
        if (dto.planSlug) {
          const plan = await tx.plan.findUnique({ where: { slug: dto.planSlug } });
          if (plan) {
            const now = new Date();
            const periodEnd = new Date(now);
            periodEnd.setMonth(periodEnd.getMonth() + 1);

            subscription = await tx.subscription.create({
              data: {
                companyId: company.id,
                planId: plan.id,
                status: 'ACTIVE',
                billingInterval: dto.billingInterval ?? 'MONTHLY',
                currentPeriodStart: now,
                currentPeriodEnd: periodEnd,
              },
            });
          }
        }

        return { company, adminUser, companyAdminRole, subscription, isNewAdminUser, adminRawPassword };
      },
      { timeout: 15000 },
    );

    this.logger.log(`Company created: ${result.company.name} (${result.company.id})`);

    // Mirror the public registration flow: a freshly-provisioned admin must be
    // able to activate AND log in, so send the welcome email (credentials +
    // email_confirm link) — the same helper createUser uses. Skipped for an
    // existing user, who already has an account. Fire-and-forget internally.
    if (result.isNewAdminUser && result.adminRawPassword) {
      this.sendWelcomeEmail(
        result.adminUser.email,
        result.adminUser.firstName,
        result.adminRawPassword,
        result.adminUser.id,
      );
    }

    return {
      company: result.company,
      adminUser: {
        id: result.adminUser.id,
        email: result.adminUser.email,
        firstName: result.adminUser.firstName,
        lastName: result.adminUser.lastName,
      },
      role: result.companyAdminRole,
      subscription: result.subscription,
      message: result.isNewAdminUser
        ? 'Company created successfully. A verification email has been sent to the admin.'
        : 'Company created successfully. Admin user has been provisioned.',
    };
  }

  async updateCompany(id: string, dto: UpdateCompanyDto, _updatedBy: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, deletedAt: null },
    });
    if (!company) throw new NotFoundException('Company not found');

    if (dto.tin && dto.tin !== company.tin) {
      const tinExists = await this.prisma.company.findFirst({
        where: { tin: dto.tin, id: { not: id } },
      });
      if (tinExists) throw new ConflictException('TIN already belongs to another company');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        tin: dto.tin,
        city: dto.city,
        country: dto.country,
        industry: dto.industry,
        size: dto.size,
        website: dto.website,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
      },
    });
  }

  async updateCompanyStatus(companyId: string, dto: UpdateCompanyStatusDto, actor: any) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
    });
    if (!company) throw new NotFoundException('Company not found');
    if (company.status === dto.status) {
      return { message: `Company is already ${dto.status}`, company };
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { status: dto.status },
    });

    this.logger.log(
      `Company ${companyId} status changed to ${dto.status} by ${actor.sub}`,
    );
    return { message: `Company ${dto.status.toLowerCase()} successfully`, company: updated };
  }

  async deleteCompany(companyId: string, actor: any) {
    const company = await this.prisma.company.findFirst({
      where: { id: companyId, deletedAt: null },
    });
    if (!company) throw new NotFoundException('Company not found');
    if (company.status === 'DELETED') {
      throw new ConflictException('Company is already deleted');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    this.logger.log(`Company ${companyId} soft-deleted by ${actor.sub}`);
    return { message: 'Company deleted successfully', company: updated };
  }

  // ─── IMPERSONATION ────────────────────────────────────────────────────────────

  async exchangeImpersonationToken(
    targetCompanyId: string,
    superAdmin: any,
    ip?: string,
  ) {
    const company = await this.prisma.company.findFirst({
      where: { id: targetCompanyId, status: 'ACTIVE', deletedAt: null },
    });
    if (!company) {
      throw new NotFoundException('Company not found or not active');
    }

    const companyAdminRole = await this.prisma.role.findFirst({
      where: { name: 'Company Admin', isSystem: true },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    if (!companyAdminRole) {
      throw new NotFoundException(
        'Company Admin role not found. Run bootstrap first.',
      );
    }

    // Strip super-admin level permissions from the scoped token
    const permissions = companyAdminRole.permissions
      .map((rp) => rp.permission.name)
      .filter(
        (p) => !p.startsWith('super_admin') && !p.startsWith('companies'),
      );

    const tokenPayload = {
      sub: superAdmin.sub,
      email: superAdmin.email,
      roles: [
        {
          roleId: companyAdminRole.id,
          roleName: 'Company Admin',
          scope: 'TENANT',
          companyId: targetCompanyId,
        },
      ],
      permissions,
      selectedCompanyId: targetCompanyId,
      isSuperAdmin: false,
      isImpersonating: true,
      originalAdminId: superAdmin.sub,
    };

    const impersonationToken = this.jwt.sign(tokenPayload, { expiresIn: '1h' });

    await this.prisma.impersonationAudit.create({
      data: {
        superAdminId: superAdmin.sub,
        targetCompanyId,
        expiresAt: new Date(Date.now() + 3_600_000),
        ipAddress: ip ?? null,
      },
    });

    this.logger.log(
      `Impersonation token issued: admin=${superAdmin.sub} → company=${targetCompanyId}`,
    );

    return {
      impersonationToken,
      expiresIn: 3600,
      company: { id: company.id, name: company.name, status: company.status },
    };
  }

  // ─── USERS ───────────────────────────────────────────────────────────────────

  async getAllUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          fullName: true,
          companyId: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: { id: true, name: true, scope: true, companyId: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  /**
   * Create ANY type of user (employee, company admin, super admin, or any custom
   * role) in a single endpoint. Follows the same provisioning rules as the rest
   * of the system: unique email/phone, hashed password, role resolved to a Role
   * record and linked via UserRole, company validated for tenant users.
   */
  async createUser(dto: CreateUserDto, createdBy: string) {
    const email = dto.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');

    if (dto.phone) {
      const phoneTaken = await this.prisma.user.findFirst({ where: { phone: dto.phone } });
      if (phoneTaken) throw new ConflictException('Phone number already in use');
    }

    const roleName = dto.role?.trim() || 'Employee';
    const isSuper = this.isSuperAdminRole(roleName);

    // Super admins are global (no company); everyone else must belong to one.
    let companyId: string | null = dto.companyId ?? null;
    if (isSuper) {
      companyId = null;
    } else {
      if (!companyId) {
        throw new BadRequestException('companyId is required for non super-admin users');
      }
      const company = await this.prisma.company.findFirst({
        where: { id: companyId, deletedAt: null },
      });
      if (!company) throw new NotFoundException('Company not found');
    }

    const password = dto.password || DEFAULT_USER_PASSWORD;
    const hashed = await bcrypt.hash(password, 12);

    const { user, roleRecord } = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email,
          phone: dto.phone || null,
          password: hashed,
          firstName: dto.firstName,
          lastName: dto.lastName,
          fullName: `${dto.firstName} ${dto.lastName}`.trim(),
          role: isSuper ? 'System Administrator' : roleName,
          companyId,
          isActive: dto.isActive ?? true,
          emailVerified: dto.emailVerified ?? false,
        },
      });
      const linked = await this.resolveAndAssignRole(tx, created.id, roleName, companyId);
      return { user: created, roleRecord: linked };
    });

    if (dto.sendWelcomeEmail !== false) {
      this.sendWelcomeEmail(user.email!, user.firstName, password, user.id);
    }

    this.logger.log(`User created: ${email} (role=${user.role}) by ${createdBy}`);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId,
      isActive: user.isActive,
      roleAssigned: roleRecord?.name ?? null,
      message: dto.password
        ? 'User created successfully.'
        : `User created. Default password: ${DEFAULT_USER_PASSWORD} (must be changed on first login)`,
    };
  }

  async createSuperAdmin(dto: { email: string; firstName: string; lastName: string; password?: string }, createdBy: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw new ConflictException('Email already exists');

    const superAdminRole = await this.prisma.role.findFirst({
      where: { name: 'System Administrator', scope: 'GLOBAL' },
    });
    if (!superAdminRole) {
      throw new NotFoundException('System Administrator role not found. Run bootstrap first.');
    }

    const hashed = await bcrypt.hash(dto.password ?? 'ChangeMe@2026!', 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashed,
        firstName: dto.firstName,
        lastName: dto.lastName,
        fullName: `${dto.firstName} ${dto.lastName}`,
        role: 'System Administrator',
        isActive: true,
      },
    });

    await this.prisma.userRole.create({
      data: { userId: user.id, roleId: superAdminRole.id },
    });

    this.logger.log(`Super admin created: ${dto.email} by ${createdBy}`);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      message: dto.password
        ? 'Super admin created successfully.'
        : 'Super admin created. Default password: ChangeMe@2026! (must be changed on first login)',
    };
  }

  async deleteUser(userId: string, actorId: string) {
    // Guard A — an admin can never delete their own account.
    if (userId === actorId) {
      throw new ForbiddenException('You cannot delete your own account.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Guard B — the protected root admin can never be deleted by anyone.
    if (this.isProtectedRootEmail(user.email)) {
      throw new ForbiddenException('This account is protected and cannot be deleted.');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted+${userId}@deleted.local`,
        isActive: false,
        firstName: 'Deleted',
        lastName: 'User',
        fullName: 'Deleted User',
      },
    });

    return { message: 'User deleted successfully' };
  }

  async updateUser(userId: string, dto: UpdateUserDto, actorId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Editing your own name / email / password is allowed. Deactivating an
    // account is where the guards apply.
    const isDeactivating = dto.isActive === false;

    // Guard A — an admin can never deactivate their own account.
    if (isDeactivating && userId === actorId) {
      throw new ForbiddenException('You cannot deactivate your own account.');
    }

    // Guard B — the protected root admin can never be deactivated by anyone.
    if (isDeactivating && this.isProtectedRootEmail(user.email)) {
      throw new ForbiddenException('This account is protected and cannot be deactivated.');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const taken = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (taken) throw new ConflictException('Email already in use');
    }
    if (dto.phone && dto.phone !== user.phone) {
      const taken = await this.prisma.user.findFirst({ where: { phone: dto.phone, id: { not: userId } } });
      if (taken) throw new ConflictException('Phone number already in use');
    }

    const data: any = {};
    if (dto.firstName !== undefined) data.firstName = dto.firstName;
    if (dto.lastName !== undefined) data.lastName = dto.lastName;
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      data.fullName = `${dto.firstName ?? user.firstName} ${dto.lastName ?? user.lastName}`.trim();
    }
    if (dto.email !== undefined) data.email = dto.email.toLowerCase();
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.password) data.password = await bcrypt.hash(dto.password, 12);
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    // Optional company move — validate the target company exists.
    if (dto.companyId !== undefined) {
      if (dto.companyId) {
        const company = await this.prisma.company.findFirst({
          where: { id: dto.companyId, deletedAt: null },
        });
        if (!company) throw new NotFoundException('Company not found');
      }
      data.companyId = dto.companyId || null;
    }

    // Role change — update the string field and re-sync UserRole links.
    const roleName = dto.role?.trim();
    if (roleName) {
      data.role = this.isSuperAdminRole(roleName) ? 'System Administrator' : roleName;
    }
    // The company a role is resolved against: the new one if moving, else current.
    const effectiveCompanyId =
      dto.companyId !== undefined ? dto.companyId || null : user.companyId;

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({ where: { id: userId }, data });
      if (roleName) {
        // Replace existing assignments so the user's type is exactly the new role.
        await tx.userRole.deleteMany({ where: { userId } });
        await this.resolveAndAssignRole(
          tx,
          userId,
          roleName,
          this.isSuperAdminRole(roleName) ? null : effectiveCompanyId,
        );
      }
      return u;
    });

    this.logger.log(`User ${userId} updated by ${actorId}`);
    return {
      message: 'User updated successfully',
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        fullName: updated.fullName,
        role: updated.role,
        companyId: updated.companyId,
        isActive: updated.isActive,
      },
    };
  }

  // ─── AUDIT LOGS ──────────────────────────────────────────────────────────────

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    companyId?: string;
    actorId?: string;
    action?: string;
    resource?: string;
    from?: string;
    to?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, companyId, actorId, action, resource, from, to, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (companyId) where.companyId = companyId;
    if (actorId) where.actorId = actorId;
    if (action) where.action = { contains: action };
    if (resource) where.resource = resource;
    if (search) {
      where.OR = [
        { action: { contains: search } },
        { resource: { contains: search } },
        { actorId: { contains: search } },
      ];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [total, logs] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  // ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

  async getSubscriptionOverview() {
    const [plans, subscriptions, totalCompanies] = await Promise.all([
      this.prisma.plan.findMany({ where: { isActive: true } }),
      this.prisma.subscription.findMany({
        include: { plan: true },
        where: { status: 'ACTIVE' },
      }),
      this.prisma.company.count({ where: { deletedAt: null } }),
    ]);

    const mrr = subscriptions.reduce(
      (sum, s) => sum + Number(s.plan.monthlyPrice),
      0,
    );

    const planDistribution = plans.map((plan) => ({
      plan: plan.name,
      count: subscriptions.filter((s) => s.planId === plan.id).length,
    }));

    return {
      mrr,
      arr: mrr * 12,
      activeSubscriptions: subscriptions.length,
      totalCompanies,
      planDistribution,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        monthlyPrice: Number(p.monthlyPrice),
        maxEmployees: p.maxEmployees,
        features: p.features,
        isActive: p.isActive,
      })),
    };
  }

  async getCompanyBilling(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [total, subscriptions] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { name: true, slug: true, monthlyPrice: true } },
        },
      }),
    ]);

    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const company = await this.prisma.company.findFirst({
          where: { id: sub.companyId },
          select: { id: true, name: true, email: true, status: true },
        });
        return { ...sub, company };
      }),
    );

    return {
      data: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
      },
    };
  }

  async changePlan(companyId: string, planSlug: string, billingInterval: string, actorId: string) {
    const [company, plan] = await Promise.all([
      this.prisma.company.findFirst({ where: { id: companyId, deletedAt: null } }),
      this.prisma.plan.findUnique({ where: { slug: planSlug } }),
    ]);

    if (!company) throw new NotFoundException('Company not found');
    if (!plan) throw new NotFoundException('Plan not found');

    const existing = await this.prisma.subscription.findFirst({ where: { companyId } });
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (existing) {
      const updated = await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId: plan.id,
          billingInterval,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          status: 'ACTIVE',
        },
        include: { plan: true },
      });
      return { message: 'Plan changed successfully', subscription: updated };
    }

    const created = await this.prisma.subscription.create({
      data: {
        companyId,
        planId: plan.id,
        status: 'ACTIVE',
        billingInterval,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
      include: { plan: true },
    });

    return { message: 'Subscription created successfully', subscription: created };
  }
}
