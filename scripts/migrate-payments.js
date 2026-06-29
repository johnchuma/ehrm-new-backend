require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running targeted migration...');

  await prisma.$executeRawUnsafe(
    `ALTER TABLE subscriptions ADD COLUMN gatewayRef VARCHAR(191) NULL`
  ).then(() => console.log('✓ subscriptions.gatewayRef added'))
   .catch((e) => console.log('subscriptions.gatewayRef skip (likely already exists):', e.meta?.message ?? e.message));

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS payments (
      id              VARCHAR(191) NOT NULL,
      companyId       VARCHAR(191) NOT NULL,
      planId          VARCHAR(191) NOT NULL,
      subscriptionId  VARCHAR(191) NULL,
      amount          DECIMAL(15,2) NOT NULL,
      currency        VARCHAR(191) NOT NULL DEFAULT 'TZS',
      billingInterval VARCHAR(191) NOT NULL DEFAULT 'MONTHLY',
      status          VARCHAR(191) NOT NULL DEFAULT 'PENDING',
      gateway         VARCHAR(191) NOT NULL DEFAULT 'snipepay',
      gatewayRef      VARCHAR(191) NULL,
      gatewayResponse LONGTEXT NULL,
      callbackUrl     LONGTEXT NULL,
      paidAt          DATETIME(3) NULL,
      failedAt        DATETIME(3) NULL,
      failureReason   VARCHAR(191) NULL,
      createdAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updatedAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      UNIQUE KEY payments_gatewayRef_key (gatewayRef),
      KEY payments_companyId_idx (companyId),
      KEY payments_status_idx (status),
      KEY payments_gatewayRef_idx (gatewayRef),
      CONSTRAINT payments_companyId_fkey FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
      CONSTRAINT payments_planId_fkey FOREIGN KEY (planId) REFERENCES plans(id),
      CONSTRAINT payments_subscriptionId_fkey FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
    )
  `).then(() => console.log('✓ payments table created'))
   .catch((e) => console.log('payments table skip:', e.message));

  console.log('Migration complete.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
