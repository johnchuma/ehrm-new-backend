import { PHASE_1_PERMISSIONS } from '../../bootstrap/permissions.seed';

/**
 * The fixed permission vocabulary is `${resource}.${action}` where action is one
 * of read | write | delete | manage. Roles are dynamic per-company compositions
 * of these names; the frontend derives the management nav by grouping a user's
 * effective permissions by resource.
 */
export const RBAC_ACTIONS = ['read', 'write', 'delete', 'manage'] as const;

/**
 * Resources a Company Admin is granted in full (all four actions each).
 * Deliberately excludes `companies` and `super_admin` (platform scope). `iam`
 * is included so company admins can build and assign their own custom roles.
 * Everyone else sees only what they are explicitly granted.
 */
export const COMPANY_ADMIN_RESOURCES = [
  'employees',
  'attendance',
  'leave',
  'payroll',
  'performance',
  'training',
  'contracts',
  'benefits',
  'analytics',
  'settings',
  'compliance',
  'iam',
] as const;

/** The 48 permission names (12 resources × 4 actions) a Company Admin holds. */
export const COMPANY_ADMIN_PERMISSIONS: string[] = COMPANY_ADMIN_RESOURCES.flatMap(
  (resource) => RBAC_ACTIONS.map((action) => `${resource}.${action}`),
);

/** Every permission name in the seeded catalog (used for super-admin tokens). */
export const ALL_PERMISSION_NAMES: string[] = PHASE_1_PERMISSIONS.map((p) => p.name);

/**
 * Defensive company-admin role matching — tolerant of casing / separator drift,
 * mirroring AuthService.isSuperAdminRole so a stray role string can never
 * silently strip a company admin's management access.
 */
export function isCompanyAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().replace(/[\s_-]+/g, ' ').trim();
  return normalized === 'company admin' || normalized === 'company administrator';
}

/** Group a flat permission-name list into `{ resource: actions[] }` for the nav. */
export function groupPermissionsByResource(
  permissions: string[],
): Record<string, string[]> {
  const modules: Record<string, string[]> = {};
  for (const name of permissions) {
    const [resource, action] = name.split('.');
    if (!resource || !action) continue;
    (modules[resource] ??= []).push(action);
  }
  return modules;
}
