"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrpcModule = exports.PROTO_PATH = exports.SERVICE_NAMES = exports.SERVICE_PORTS = exports.GRPC_SERVICES = void 0;
exports.getServiceConfig = getServiceConfig;
exports.getProtoPath = getProtoPath;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
exports.GRPC_SERVICES = {
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
exports.SERVICE_PORTS = {
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
exports.SERVICE_NAMES = {
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
exports.PROTO_PATH = (0, path_1.join)(process.cwd(), 'proto');
function getServiceConfig(name, host = 'localhost', port) {
    const upperName = name.toUpperCase().replace('-', '_');
    const servicePort = port || exports.SERVICE_PORTS[upperName];
    const protoPackage = `ehrm.${name}`;
    return {
        name: exports.GRPC_SERVICES[upperName] || `${upperName}_SERVICE`,
        transport: microservices_1.Transport.GRPC,
        options: {
            package: protoPackage,
            protoPath: getProtoPath(name),
            url: `${host}:${servicePort}`,
        },
    };
}
function getProtoPath(serviceName) {
    return (0, path_1.join)(exports.PROTO_PATH, `${serviceName}.proto`);
}
let GrpcModule = class GrpcModule {
};
exports.GrpcModule = GrpcModule;
exports.GrpcModule = GrpcModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: exports.GRPC_SERVICES.IAM,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.iam',
                        protoPath: getProtoPath('iam'),
                        url: `localhost:${exports.SERVICE_PORTS.IAM}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.COMPANY,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.company',
                        protoPath: getProtoPath('company'),
                        url: `localhost:${exports.SERVICE_PORTS.COMPANY}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.EMPLOYEE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.employee',
                        protoPath: getProtoPath('employee'),
                        url: `localhost:${exports.SERVICE_PORTS.EMPLOYEE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.ATTENDANCE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.attendance',
                        protoPath: getProtoPath('attendance'),
                        url: `localhost:${exports.SERVICE_PORTS.ATTENDANCE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.LEAVE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.leave',
                        protoPath: getProtoPath('leave'),
                        url: `localhost:${exports.SERVICE_PORTS.LEAVE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.PAYROLL,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.payroll',
                        protoPath: getProtoPath('payroll'),
                        url: `localhost:${exports.SERVICE_PORTS.PAYROLL}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.PERFORMANCE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.performance',
                        protoPath: getProtoPath('performance'),
                        url: `localhost:${exports.SERVICE_PORTS.PERFORMANCE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.TRAINING,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.training',
                        protoPath: getProtoPath('training'),
                        url: `localhost:${exports.SERVICE_PORTS.TRAINING}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.ONBOARDING,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.onboarding',
                        protoPath: getProtoPath('onboarding'),
                        url: `localhost:${exports.SERVICE_PORTS.ONBOARDING}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.OFFBOARDING,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.offboarding',
                        protoPath: getProtoPath('offboarding'),
                        url: `localhost:${exports.SERVICE_PORTS.OFFBOARDING}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.MOVEMENT,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.movement',
                        protoPath: getProtoPath('movement'),
                        url: `localhost:${exports.SERVICE_PORTS.MOVEMENT}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.CONTRACTS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.contracts',
                        protoPath: getProtoPath('contracts'),
                        url: `localhost:${exports.SERVICE_PORTS.CONTRACTS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.ASSETS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.assets',
                        protoPath: getProtoPath('assets'),
                        url: `localhost:${exports.SERVICE_PORTS.ASSETS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.BENEFITS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.benefits',
                        protoPath: getProtoPath('benefits'),
                        url: `localhost:${exports.SERVICE_PORTS.BENEFITS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.DISCIPLINARY,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.disciplinary',
                        protoPath: getProtoPath('disciplinary'),
                        url: `localhost:${exports.SERVICE_PORTS.DISCIPLINARY}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.COMPLIANCE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.compliance',
                        protoPath: getProtoPath('compliance'),
                        url: `localhost:${exports.SERVICE_PORTS.COMPLIANCE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.ANNOUNCEMENTS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.announcements',
                        protoPath: getProtoPath('announcements'),
                        url: `localhost:${exports.SERVICE_PORTS.ANNOUNCEMENTS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.ANALYTICS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.analytics',
                        protoPath: getProtoPath('analytics'),
                        url: `localhost:${exports.SERVICE_PORTS.ANALYTICS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.SALARY_INTELLIGENCE,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.salaryintelligence',
                        protoPath: getProtoPath('salary_intelligence'),
                        url: `localhost:${exports.SERVICE_PORTS.SALARY_INTELLIGENCE}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.EXACTAI,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.exactai',
                        protoPath: getProtoPath('exactai'),
                        url: `localhost:${exports.SERVICE_PORTS.EXACTAI}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.NOTIFICATIONS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.notifications',
                        protoPath: getProtoPath('notifications'),
                        url: `localhost:${exports.SERVICE_PORTS.NOTIFICATIONS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.TASKS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.tasks',
                        protoPath: getProtoPath('tasks'),
                        url: `localhost:${exports.SERVICE_PORTS.TASKS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.HR_QUERY,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.hrquery',
                        protoPath: getProtoPath('hrquery'),
                        url: `localhost:${exports.SERVICE_PORTS.HR_QUERY}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.DOCUMENTS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.documents',
                        protoPath: getProtoPath('documents'),
                        url: `localhost:${exports.SERVICE_PORTS.DOCUMENTS}`,
                    },
                },
                {
                    name: exports.GRPC_SERVICES.INTEGRATIONS,
                    transport: microservices_1.Transport.GRPC,
                    options: {
                        package: 'ehrm.integrations',
                        protoPath: getProtoPath('integrations'),
                        url: `localhost:${exports.SERVICE_PORTS.INTEGRATIONS}`,
                    },
                },
            ]),
        ],
        exports: [microservices_1.ClientsModule],
    })
], GrpcModule);
//# sourceMappingURL=grpc.module.js.map