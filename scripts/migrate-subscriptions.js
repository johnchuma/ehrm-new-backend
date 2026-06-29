const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(sql, label) {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log(`✓ ${label}`);
  } catch (err) {
    if (err.message.includes('Duplicate column') || err.message.includes("already exists")) {
      console.log(`  (skip) ${label} — column/table already exists`);
    } else {
      throw err;
    }
  }
}

async function main() {
  console.log('Running subscription schema migration...\n');

  // Plan additions
  await run(`ALTER TABLE plans ADD COLUMN isHighlighted TINYINT(1) NOT NULL DEFAULT 0`, 'plans.isHighlighted');
  await run(`ALTER TABLE plans ADD COLUMN supportTier VARCHAR(50) NOT NULL DEFAULT 'Email'`, 'plans.supportTier');

  // Company additions
  await run(`ALTER TABLE companies ADD COLUMN enabledModules TEXT NULL`, 'companies.enabledModules');
  await run(`ALTER TABLE companies ADD COLUMN userLimit INT NULL`, 'companies.userLimit');

  // BillingAlert table
  await run(`
    CREATE TABLE IF NOT EXISTS billing_alerts (
      id         VARCHAR(191) NOT NULL,
      type       VARCHAR(100) NOT NULL,
      companyId  VARCHAR(191) NOT NULL,
      message    TEXT         NOT NULL,
      severity   VARCHAR(20)  NOT NULL DEFAULT 'Medium',
      resolved   TINYINT(1)   NOT NULL DEFAULT 0,
      resolvedAt DATETIME     NULL,
      resolvedBy VARCHAR(191) NULL,
      occurredAt DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      createdAt  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_companyId (companyId),
      INDEX idx_resolved  (resolved),
      INDEX idx_severity  (severity),
      CONSTRAINT fk_billing_alerts_company FOREIGN KEY (companyId)
        REFERENCES companies(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `, 'billing_alerts table');

  console.log('\nMigration complete.');
}

main().catch((err) => { console.error(err); process.exit(1); }).finally(() => prisma.$disconnect());
