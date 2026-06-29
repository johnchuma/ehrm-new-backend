require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(sql, label) {
  await prisma.$executeRawUnsafe(sql)
    .then(() => console.log(`✓ ${label}`))
    .catch((e) => console.log(`  skip ${label}: ${e.meta?.message ?? e.message}`));
}

async function main() {
  console.log('Running security migration...');

  await run(`ALTER TABLE refresh_tokens ADD COLUMN ipAddress VARCHAR(45) NULL`, 'refresh_tokens.ipAddress');
  await run(`ALTER TABLE refresh_tokens ADD COLUMN userAgent VARCHAR(500) NULL`, 'refresh_tokens.userAgent');

  await run(`
    CREATE TABLE IF NOT EXISTS security_alerts (
      id         VARCHAR(191) NOT NULL,
      type       VARCHAR(191) NOT NULL,
      entity     VARCHAR(191) NOT NULL,
      detail     LONGTEXT NOT NULL,
      severity   VARCHAR(191) NOT NULL DEFAULT 'Medium',
      resolved   TINYINT(1) NOT NULL DEFAULT 0,
      resolvedAt DATETIME(3) NULL,
      resolvedBy VARCHAR(191) NULL,
      occurredAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      createdAt  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      PRIMARY KEY (id),
      KEY security_alerts_resolved_idx (resolved),
      KEY security_alerts_severity_idx (severity),
      KEY security_alerts_occurredAt_idx (occurredAt)
    )
  `, 'security_alerts table');

  console.log('Security migration complete.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
