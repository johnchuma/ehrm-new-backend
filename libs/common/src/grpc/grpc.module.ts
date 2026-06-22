import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

export const GRPC_SERVICES = {
  IAM: 'IAM_SERVICE',
  COMPANY: 'COMPANY_SERVICE',
  EMPLOYEE: 'EMPLOYEE_SERVICE',
  ATTENDANCE: 'ATTENDANCE_SERVICE',
  LEAVE: 'LEAVE_SERVICE',
  PAYROLL: 'PAYROLL_SERVICE',
  PERFORMANCE: 'PERFORMANCE_SERVICE',
  TRAINING: 'TRAINING_SERVICE',
  ONBOARDING: 'ONBOARDING_SERVICE',
  OFFBOARDING: 'OFFBOARDING_SERVICE',
  MOVEMENT: 'MOVEMENT_SERVICE',
  CONTRACTS: 'CONTRACTS_SERVICE',
  ASSETS: 'ASSETS_SERVICE',
  BENEFITS: 'BENEFITS_SERVICE',
  DISCIPLINARY: 'DISCIPLINARY_SERVICE',
  COMPLIANCE: 'COMPLIANCE_SERVICE',
  ANNOUNCEMENTS: 'ANNOUNCEMENTS_SERVICE',
  ANALYTICS: 'ANALYTICS_SERVICE',
  SALARY_INTELLIGENCE: 'SALARY_INTELLIGENCE_SERVICE',
  EXACTAI: 'EXACTAI_SERVICE',
  NOTIFICATIONS: 'NOTIFICATIONS_SERVICE',
  TASKS: 'TASKS_SERVICE',
  HR_QUERY: 'HR_QUERY_SERVICE',
  DOCUMENTS: 'DOCUMENTS_SERVICE',
  INTEGRATIONS: 'INTEGRATIONS_SERVICE',
};

export const SERVICE_PORTS = {
  IAM: 5001,
  COMPANY: 5002,
  EMPLOYEE: 5003,
  ATTENDANCE: 5004,
  LEAVE: 5005,
  PAYROLL: 5006,
  PERFORMANCE: 5007,
  TRAINING: 5008,
  ONBOARDING: 5009,
  OFFBOARDING: 5010,
  MOVEMENT: 5011,
  CONTRACTS: 5012,
  ASSETS: 5013,
  BENEFITS: 5014,
  DISCIPLINARY: 5015,
  COMPLIANCE: 5016,
  ANNOUNCEMENTS: 5017,
  ANALYTICS: 5018,
  SALARY_INTELLIGENCE: 5019,
  EXACTAI: 5020,
  NOTIFICATIONS: 5021,
  TASKS: 5022,
  HR_QUERY: 5023,
  DOCUMENTS: 5024,
  INTEGRATIONS: 5025,
};

export const SERVICE_NAMES = {
  IAM: 'iam',
  COMPANY: 'company',
  EMPLOYEE: 'employee',
  ATTENDANCE: 'attendance',
  LEAVE: 'leave',
  PAYROLL: 'payroll',
  PERFORMANCE: 'performance',
  TRAINING: 'training',
  ONBOARDING: 'onboarding',
  OFFBOARDING: 'offboarding',
  MOVEMENT: 'movement',
  CONTRACTS: 'contracts',
  ASSETS: 'assets',
  BENEFITS: 'benefits',
  DISCIPLINARY: 'disciplinary',
  COMPLIANCE: 'compliance',
  ANNOUNCEMENTS: 'announcements',
  ANALYTICS: 'analytics',
  SALARY_INTELLIGENCE: 'salary-intelligence',
  EXACTAI: 'exactai',
  NOTIFICATIONS: 'notifications',
  TASKS: 'tasks',
  HR_QUERY: 'hr-query',
  DOCUMENTS: 'documents',
  INTEGRATIONS: 'integrations',
};

export const PROTO_PATH = join(process.cwd(), 'proto');

export function getServiceConfig(name: string, host: string = 'localhost', port?: number) {
  const upperName = name.toUpperCase().replace('-', '_');
  const servicePort = port || SERVICE_PORTS[upperName];
  const protoPackage = `ehrm.${name}`;
  return {
    name: GRPC_SERVICES[upperName] || `${upperName}_SERVICE`,
    transport: Transport.GRPC,
    options: {
      package: protoPackage,
      protoPath: getProtoPath(name),
      url: `${host}:${servicePort}`,
    },
  };
}

export function getProtoPath(serviceName: string): string {
  return join(PROTO_PATH, `${serviceName}.proto`);
}

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: GRPC_SERVICES.IAM,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.iam',
          protoPath: getProtoPath('iam'),
          url: `localhost:${SERVICE_PORTS.IAM}`,
        },
      },
      {
        name: GRPC_SERVICES.COMPANY,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.company',
          protoPath: getProtoPath('company'),
          url: `localhost:${SERVICE_PORTS.COMPANY}`,
        },
      },
      {
        name: GRPC_SERVICES.EMPLOYEE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.employee',
          protoPath: getProtoPath('employee'),
          url: `localhost:${SERVICE_PORTS.EMPLOYEE}`,
        },
      },
      {
        name: GRPC_SERVICES.ATTENDANCE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.attendance',
          protoPath: getProtoPath('attendance'),
          url: `localhost:${SERVICE_PORTS.ATTENDANCE}`,
        },
      },
      {
        name: GRPC_SERVICES.LEAVE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.leave',
          protoPath: getProtoPath('leave'),
          url: `localhost:${SERVICE_PORTS.LEAVE}`,
        },
      },
      {
        name: GRPC_SERVICES.PAYROLL,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.payroll',
          protoPath: getProtoPath('payroll'),
          url: `localhost:${SERVICE_PORTS.PAYROLL}`,
        },
      },
      {
        name: GRPC_SERVICES.PERFORMANCE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.performance',
          protoPath: getProtoPath('performance'),
          url: `localhost:${SERVICE_PORTS.PERFORMANCE}`,
        },
      },
      {
        name: GRPC_SERVICES.TRAINING,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.training',
          protoPath: getProtoPath('training'),
          url: `localhost:${SERVICE_PORTS.TRAINING}`,
        },
      },
      {
        name: GRPC_SERVICES.ONBOARDING,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.onboarding',
          protoPath: getProtoPath('onboarding'),
          url: `localhost:${SERVICE_PORTS.ONBOARDING}`,
        },
      },
      {
        name: GRPC_SERVICES.OFFBOARDING,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.offboarding',
          protoPath: getProtoPath('offboarding'),
          url: `localhost:${SERVICE_PORTS.OFFBOARDING}`,
        },
      },
      {
        name: GRPC_SERVICES.MOVEMENT,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.movement',
          protoPath: getProtoPath('movement'),
          url: `localhost:${SERVICE_PORTS.MOVEMENT}`,
        },
      },
      {
        name: GRPC_SERVICES.CONTRACTS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.contracts',
          protoPath: getProtoPath('contracts'),
          url: `localhost:${SERVICE_PORTS.CONTRACTS}`,
        },
      },
      {
        name: GRPC_SERVICES.ASSETS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.assets',
          protoPath: getProtoPath('assets'),
          url: `localhost:${SERVICE_PORTS.ASSETS}`,
        },
      },
      {
        name: GRPC_SERVICES.BENEFITS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.benefits',
          protoPath: getProtoPath('benefits'),
          url: `localhost:${SERVICE_PORTS.BENEFITS}`,
        },
      },
      {
        name: GRPC_SERVICES.DISCIPLINARY,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.disciplinary',
          protoPath: getProtoPath('disciplinary'),
          url: `localhost:${SERVICE_PORTS.DISCIPLINARY}`,
        },
      },
      {
        name: GRPC_SERVICES.COMPLIANCE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.compliance',
          protoPath: getProtoPath('compliance'),
          url: `localhost:${SERVICE_PORTS.COMPLIANCE}`,
        },
      },
      {
        name: GRPC_SERVICES.ANNOUNCEMENTS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.announcements',
          protoPath: getProtoPath('announcements'),
          url: `localhost:${SERVICE_PORTS.ANNOUNCEMENTS}`,
        },
      },
      {
        name: GRPC_SERVICES.ANALYTICS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.analytics',
          protoPath: getProtoPath('analytics'),
          url: `localhost:${SERVICE_PORTS.ANALYTICS}`,
        },
      },
      {
        name: GRPC_SERVICES.SALARY_INTELLIGENCE,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.salaryintelligence',
          protoPath: getProtoPath('salary_intelligence'),
          url: `localhost:${SERVICE_PORTS.SALARY_INTELLIGENCE}`,
        },
      },
      {
        name: GRPC_SERVICES.EXACTAI,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.exactai',
          protoPath: getProtoPath('exactai'),
          url: `localhost:${SERVICE_PORTS.EXACTAI}`,
        },
      },
      {
        name: GRPC_SERVICES.NOTIFICATIONS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.notifications',
          protoPath: getProtoPath('notifications'),
          url: `localhost:${SERVICE_PORTS.NOTIFICATIONS}`,
        },
      },
      {
        name: GRPC_SERVICES.TASKS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.tasks',
          protoPath: getProtoPath('tasks'),
          url: `localhost:${SERVICE_PORTS.TASKS}`,
        },
      },
      {
        name: GRPC_SERVICES.HR_QUERY,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.hrquery',
          protoPath: getProtoPath('hrquery'),
          url: `localhost:${SERVICE_PORTS.HR_QUERY}`,
        },
      },
      {
        name: GRPC_SERVICES.DOCUMENTS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.documents',
          protoPath: getProtoPath('documents'),
          url: `localhost:${SERVICE_PORTS.DOCUMENTS}`,
        },
      },
      {
        name: GRPC_SERVICES.INTEGRATIONS,
        transport: Transport.GRPC,
        options: {
          package: 'ehrm.integrations',
          protoPath: getProtoPath('integrations'),
          url: `localhost:${SERVICE_PORTS.INTEGRATIONS}`,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class GrpcModule {}
