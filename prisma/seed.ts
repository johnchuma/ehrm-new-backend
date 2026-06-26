import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'exactonlinesoftware@gmail.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 12);

  // Create system company if not exists
  let company = await prisma.company.findUnique({ where: { slug: 'exactehrm-system' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'ExactEHRM System',
        slug: 'exactehrm-system',
        email: 'system@exactehrm.com',
        phone: '+255712000000',
        country: 'Tanzania',
        currency: 'TZS',
        subscriptionPlan: 'Enterprise Suite',
        status: 'ACTIVE',
      },
    });
    console.log('Company created:', company.id);
  }

  // Create default settings if not exists
  const existingSettings = await prisma.companySettings.findUnique({ where: { companyId: company.id } });
  if (!existingSettings) {
    await prisma.companySettings.create({
      data: {
        companyId: company.id,
        generalSettings: JSON.stringify({
          companyUnits: [],
          businessUnits: [],
          sections: [],
          contractTypes: [
            { id: 'permanent', name: 'Permanent', desc: 'Full-time indefinite contract', probation: 6 },
            { id: 'fixed-term', name: 'Fixed Term', desc: 'Contract with specified end date', probation: 3 },
          ],
          levels: [
            { id: 'level-1', name: 'Level 1', rank: 1, desc: 'Entry-level' },
            { id: 'level-2', name: 'Level 2', rank: 2, desc: 'Junior' },
            { id: 'level-3', name: 'Level 3', rank: 3, desc: 'Mid-level' },
          ],
          salaryGrades: [],
          jobTitles: [],
          positions: [],
          benefits: [],
          workingDays: [
            { day: 'Monday', working: true, start: '08:00', end: '17:00' },
            { day: 'Tuesday', working: true, start: '08:00', end: '17:00' },
            { day: 'Wednesday', working: true, start: '08:00', end: '17:00' },
            { day: 'Thursday', working: true, start: '08:00', end: '17:00' },
            { day: 'Friday', working: true, start: '08:00', end: '17:00' },
            { day: 'Saturday', working: false },
            { day: 'Sunday', working: false },
          ],
          holidays: [],
          locations: [],
          approvalConfigs: [],
        }),
      },
    });
    console.log('Default settings created');
  }

  // Seed system roles
  const systemRoles = [
    { name: 'System Administrator', scope: 'GLOBAL', description: 'Full access to all system features across all companies' },
    { name: 'Company Admin',        scope: 'TENANT', description: 'Full access to all features within their company' },
    { name: 'Employee',             scope: 'TENANT', description: 'Basic self-service access — view own profile, submit leave, view payslips' },
  ];
  for (const { name, scope, description } of systemRoles) {
    const exists = await prisma.role.findFirst({ where: { name, isSystem: true } });
    if (!exists) {
      await prisma.role.create({
        data: {
          name,
          scope: scope as any,
          description,
          isSystem: true,
        },
      });
      console.log('Role created:', name);
    }
  }

  // Create or update system admin users
  const adminEmails = [
    { email: 'exactonlinesoftware@gmail.com', firstName: 'System', lastName: 'Admin', fullName: 'System Admin' },
    { email: 'kaaya.nd@gmail.com', firstName: 'Kaaya', lastName: 'Nd', fullName: 'Kaaya Nd' },
  ];
  for (const ae of adminEmails) {
    let au = await prisma.user.findUnique({ where: { email: ae.email } });
    if (!au) {
      au = await prisma.user.create({
        data: {
          email: ae.email,
          password: hashed,
          firstName: ae.firstName,
          lastName: ae.lastName,
          fullName: ae.fullName,
          companyId: company.id,
          role: 'System Administrator',
          isActive: true,
        },
      });
      console.log('System admin created:', ae.email);
    } else {
      await prisma.user.update({ where: { id: au.id }, data: { role: 'System Administrator' } });
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
