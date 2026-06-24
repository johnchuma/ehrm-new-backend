import * as bcrypt from 'bcryptjs';

async function seed() {
  const { PrismaClient } = require('@prisma/client');
  const iam = new PrismaClient({ datasources: { db: { url: 'mysql://root@localhost:3306/ehrm-iam' } } });
  const companyDb = new PrismaClient({ datasources: { db: { url: 'mysql://root@localhost:3306/ehrm-company' } } });

  const email = 'exactonlinesoftware@gmail.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 12);

  // Create system company
  let company = await companyDb.company.findUnique({ where: { slug: 'exactehrm-system' } });
  if (!company) {
    company = await companyDb.company.create({
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
    console.log('Created system company:', company.id);
  }

  // Check if user already exists
  const existing = await iam.user.findUnique({ where: { email } });
  if (existing) {
    console.log('System admin user already exists');
    await iam.$disconnect();
    await companyDb.$disconnect();
    return;
  }

  // Create system admin user
  const user = await iam.user.create({
    data: {
      email,
      password: hashed,
      firstName: 'System',
      lastName: 'Admin',
      fullName: 'System Admin',
      companyId: company.id,
      isActive: true,
    },
  });
  console.log('Created system admin user:', user.id);

  await iam.$disconnect();
  await companyDb.$disconnect();
  console.log('Seed complete');
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
