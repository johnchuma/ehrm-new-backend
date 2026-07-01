/**
 * Backfill User.employeeId from the already-populated Employee.userId.
 *
 * Root cause: employee creation set Employee.userId but never the reverse
 * User.employeeId, while every /me resolver reads User.employeeId — so every
 * employee self-service endpoint 404'd ("Employee profile not linked").
 *
 * This is idempotent and safe to re-run: it only fills users whose employeeId
 * is still NULL, and skips any employee whose user is already linked elsewhere
 * (User.employeeId is @unique).
 *
 * Run:  npx ts-node scripts/backfill-user-employee-link.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    where: { userId: { not: null } },
    select: { id: true, userId: true },
  });

  let linked = 0;
  let alreadyOk = 0;
  let skippedConflict = 0;

  for (const emp of employees) {
    const user = await prisma.user.findUnique({
      where: { id: emp.userId as string },
      select: { id: true, employeeId: true },
    });
    if (!user) continue;

    if (user.employeeId === emp.id) {
      alreadyOk++;
      continue;
    }
    if (user.employeeId && user.employeeId !== emp.id) {
      // User already linked to a different employee — don't break the unique link.
      skippedConflict++;
      console.warn(`SKIP user ${user.id}: already linked to employee ${user.employeeId}, not ${emp.id}`);
      continue;
    }

    await prisma.user.update({ where: { id: user.id }, data: { employeeId: emp.id } });
    linked++;
  }

  console.log(`\nBackfill complete: ${linked} newly linked, ${alreadyOk} already correct, ${skippedConflict} skipped (conflict).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
