import * as bcrypt from 'bcryptjs';

const SYSTEM_EMAIL = 'exactonlinesoftware@gmail.com';
const SYSTEM_PASSWORD = 'admin123';

async function seed() {
  const { PrismaClient: IamClient } = require('../../node_modules/.prisma/client-iam');
  const { PrismaClient: CompanyClient } = require('../../node_modules/.prisma/client-company');

  const iam = new IamClient({ datasources: { db: { url: 'mysql://root@localhost:3306/ehrm-iam' } } });
  const companyDb = new CompanyClient({ datasources: { db: { url: 'mysql://root@localhost:3306/ehrm-company' } } });

  const hashed = await bcrypt.hash(SYSTEM_PASSWORD, 12);

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
  } else {
    console.log('System company already exists:', company.id);
  }

  // Create system admin user
  const existing = await iam.user.findUnique({ where: { email: SYSTEM_EMAIL } });
  if (existing) {
    console.log('System admin user already exists');
    await iam.$disconnect();
    await companyDb.$disconnect();
    return;
  }

  const user = await iam.user.create({
    data: {
      email: SYSTEM_EMAIL,
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
  console.log('Email:', SYSTEM_EMAIL);
  console.log('Password:', SYSTEM_PASSWORD);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
