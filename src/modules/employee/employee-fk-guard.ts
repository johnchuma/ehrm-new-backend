import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Existence-check every FK column on the `data` object before an
 * `employee.update` / `employee.create`. If a referenced row doesn't exist
 * (stale/legacy id, deleted record, or a relation NAME like "Permanent"
 * instead of a cuid), drop the key so the whole save doesn't fail with
 * "Foreign key constraint violated". Empty strings are normalised to null
 * so the FK is explicitly cleared.
 */
export async function dropInvalidEmployeeFks(
  prisma: PrismaService,
  data: Record<string, any>,
): Promise<void> {
  const map: Array<{ key: string; finder: (id: string) => Promise<{ id: string } | null> }> = [
    { key: 'branchId', finder: (id) => prisma.branch.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'departmentId', finder: (id) => prisma.department.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'sectionId', finder: (id) => prisma.section.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'jobTitleId', finder: (id) => prisma.jobTitle.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'gradeId', finder: (id) => prisma.grade.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'businessUnitId', finder: (id) => prisma.businessUnit.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'contractTypeId', finder: (id) => prisma.contractType.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
    { key: 'managerId', finder: (id) => prisma.employee.findUnique({ where: { id }, select: { id: true } }).catch(() => null) },
  ];

  const checks: Array<{ key: string; promise: Promise<{ id: string } | null> }> = [];
  for (const { key, finder } of map) {
    const v = data[key];
    if (v === undefined) continue;
    if (v === '' || v === null) {
      data[key] = null;
      continue;
    }
    if (typeof v !== 'string' || v.length < 3) {
      console.warn(`[employee FK guard] dropping non-id ${key}=${JSON.stringify(v)}`);
      delete data[key];
      continue;
    }
    checks.push({ key, promise: finder(v) });
  }

  if (checks.length === 0) return;

  const results = await Promise.all(checks.map((c) => c.promise));
  checks.forEach(({ key }, i) => {
    if (!results[i]) {
      console.warn(`[employee FK guard] dropping invalid ${key}=${data[key]} (no matching row)`);
      delete data[key];
    }
  });
}
