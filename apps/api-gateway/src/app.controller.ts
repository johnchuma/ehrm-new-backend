import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../libs/common/src/decorators/index';
import { SERVICE_PORTS, GRPC_SERVICES } from '../../../libs/common/src/grpc/grpc.module';

@ApiTags('System')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API Gateway root' })
  root() {
    return {
      name: 'ExactEHRM API Gateway',
      version: '1.0.0',
      description: 'Microservices-based HRM backend with gRPC inter-service communication',
      services: this.getServicesInfo(),
      endpoints: {
        health: '/health',
        services: '/services',
        docs: '/api/docs',
        swagger: '/api',
      },
    };
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Public()
  @Get('services')
  @ApiOperation({ summary: 'List all microservices' })
  services() {
    return {
      total: Object.keys(SERVICE_PORTS).length,
      services: this.getServicesInfo(),
    };
  }

  private getServicesInfo() {
    return [
      { name: 'IAM', port: 5001, path: '/iam', description: 'Identity & Access Management' },
      { name: 'Company', port: 5002, path: '/company', description: 'Companies, branches, departments' },
      { name: 'Employee', port: 5003, path: '/employee', description: 'Employee management' },
      { name: 'Attendance', port: 5004, path: '/attendance', description: 'Attendance, shifts, overtime' },
      { name: 'Leave', port: 5005, path: '/leave', description: 'Leave management' },
      { name: 'Payroll', port: 5006, path: '/payroll', description: 'Payroll processing' },
      { name: 'Performance', port: 5007, path: '/performance', description: 'Performance reviews' },
      { name: 'Training', port: 5008, path: '/training', description: 'Training programs' },
      { name: 'Onboarding', port: 5009, path: '/onboarding', description: 'Employee onboarding' },
      { name: 'Offboarding', port: 5010, path: '/offboarding', description: 'Employee offboarding' },
      { name: 'Movement', port: 5011, path: '/movement', description: 'Transfers & promotions' },
      { name: 'Contracts', port: 5012, path: '/contracts', description: 'Contract management' },
      { name: 'Assets', port: 5013, path: '/assets', description: 'Asset management' },
      { name: 'Benefits', port: 5014, path: '/benefits', description: 'Employee benefits' },
      { name: 'Disciplinary', port: 5015, path: '/disciplinary', description: 'Disciplinary cases' },
      { name: 'Compliance', port: 5016, path: '/compliance', description: 'Compliance & statutory' },
      { name: 'Announcements', port: 5017, path: '/announcements', description: 'Company announcements' },
      { name: 'Analytics', port: 5018, path: '/analytics', description: 'Analytics & dashboards' },
      { name: 'Salary Intelligence', port: 5019, path: '/salary-intelligence', description: 'Salary benchmarking' },
      { name: 'ExactAI', port: 5020, path: '/ai', description: 'AI assistant' },
      { name: 'Notifications', port: 5021, path: '/notifications', description: 'Notifications' },
      { name: 'Tasks', port: 5022, path: '/tasks', description: 'Task management' },
      { name: 'HR Query', port: 5023, path: '/hr-query', description: 'HR Q&A and tickets' },
      { name: 'Documents', port: 5024, path: '/documents', description: 'Document management' },
      { name: 'Integrations', port: 5025, path: '/integrations', description: 'Third-party integrations' },
    ];
  }
}
