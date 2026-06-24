const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function seed() {
  const email = 'exactonlinesoftware@gmail.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 12);
  const sqlFile = path.join(__dirname, '_seed.sql');

  const sql = [
    "SET @companyId = (SELECT id FROM `ehrm-company`.companies WHERE slug = 'exactehrm-system');",
    "SET @companyId = IFNULL(@companyId, (SELECT UUID()));",
    "",
    "INSERT IGNORE INTO `ehrm-company`.companies (id, name, slug, email, phone, country, currency, subscriptionPlan, status, createdAt, updatedAt)",
    "VALUES (@companyId, 'ExactEHRM System', 'exactehrm-system', 'system@exactehrm.com', '+255712000000', 'Tanzania', 'TZS', 'Enterprise Suite', 'ACTIVE', NOW(3), NOW(3));",
    "",
    `SET @uid = (SELECT id FROM \`ehrm-iam\`.users WHERE email = '${email}');`,
    "",
    "INSERT IGNORE INTO `ehrm-iam`.users (id, email, password, firstName, lastName, fullName, companyId, isActive, createdAt, updatedAt)",
    `VALUES (IFNULL(@uid, UUID()), '${email}', '${hashed}', 'System', 'Admin', 'System Admin', @companyId, 1, NOW(3), NOW(3));`,
    "",
    "SELECT IF(@uid IS NULL, 'User created', 'User already exists') AS result;",
  ].join('\n');

  fs.writeFileSync(sqlFile, sql, 'utf8');
  execSync(`mysql -u root < "${sqlFile}"`, { stdio: 'inherit' });
  fs.unlinkSync(sqlFile);

  console.log('Email:', email);
  console.log('Password:', password);
}

seed().catch((e) => {
  console.error('Seed failed:', e.message);
  process.exit(1);
});
