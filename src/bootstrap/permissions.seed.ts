export interface PermissionSeed {
  name: string;
  module: string;
  action: string;
  description: string;
}

const modules = [
  { key: 'employees',   label: 'Employees' },
  { key: 'attendance',  label: 'Attendance' },
  { key: 'leave',       label: 'Leave' },
  { key: 'payroll',     label: 'Payroll' },
  { key: 'performance', label: 'Performance' },
  { key: 'training',    label: 'Training' },
  { key: 'contracts',   label: 'Contracts' },
  { key: 'benefits',    label: 'Benefits' },
  { key: 'compliance',  label: 'Compliance' },
  { key: 'iam',         label: 'Identity & Access' },
  { key: 'analytics',   label: 'Analytics' },
  { key: 'settings',    label: 'Settings' },
  { key: 'companies',   label: 'Companies' },
];

const baseActions = [
  { action: 'read',   description: 'View records' },
  { action: 'write',  description: 'Create and update records' },
  { action: 'delete', description: 'Delete records' },
  { action: 'manage', description: 'Full control including configuration' },
];

export const PHASE_1_PERMISSIONS: PermissionSeed[] = [
  ...modules.flatMap(({ key, label }) =>
    baseActions.map(({ action, description }) => ({
      name: `${key}.${action}`,
      module: key,
      action,
      description: `${label}: ${description}`,
    })),
  ),
  {
    name: 'super_admin.manage',
    module: 'super_admin',
    action: 'manage',
    description: 'Full platform-level super admin access',
  },
];
