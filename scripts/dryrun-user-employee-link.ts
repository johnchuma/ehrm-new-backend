/** Read-only dry run for the User.employeeId backfill. Changes nothing. */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const employees = await prisma.employee.findMany({
    where: { userId: { not: null } },
    select: { id: true, userId: true },
  });

  let wouldLink = 0;
  let alreadyOk = 0;
  let conflict = 0;
  let missingUser = 0;

  for (const emp of employees) {
    const user = await prisma.user.findUnique({
      where: { id: emp.userId as string },
      select: { id: true, employeeId: true },
    });
    if (!user) { missingUser++; continue; }
    if (user.employeeId === emp.id) { alreadyOk++; continue; }
    if (user.employeeId && user.employeeId !== emp.id) { conflict++; continue; }
    wouldLink++;
  }

  const totalEmployees = await prisma.employee.count();
  const employeesWithUser = employees.length;
  const usersWithEmployeeId = await prisma.user.count({ where: { employeeId: { not: null } } });

  console.log('--- DRY RUN (no writes) ---');
  console.log(`Total employees:                 ${totalEmployees}`);
  console.log(`Employees with userId set:       ${employeesWithUser}`);
  console.log(`Users already have employeeId:   ${usersWithEmployeeId}`);
  console.log('');
  console.log(`WOULD link (user.employeeId null):  ${wouldLink}`);
  console.log(`Already correct:                    ${alreadyOk}`);
  console.log(`Conflicts (user linked elsewhere):  ${conflict}`);
  console.log(`Employee.userId points to no user:  ${missingUser}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
