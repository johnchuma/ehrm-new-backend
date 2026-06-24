import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../libs/common/src/decorators/index';

@ApiTags('System')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'API root' })
  root() {
    return {
      name: 'ExactEHRM API',
      version: '1.0.0',
      description: 'Monolithic HRM backend',
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
  @ApiOperation({ summary: 'List all service modules' })
  services() {
    return {
      total: 25,
      services: this.getServicesInfo(),
    };
  }

  private getServicesInfo() {
    return [
      { name: 'IAM', path: '/iam', description: 'Identity & Access Management' },
      { name: 'Company', path: '/company', description: 'Companies, branches, departments' },
      { name: 'Employee', path: '/employee', description: 'Employee management' },
      { name: 'Attendance', path: '/attendance', description: 'Attendance, shifts, overtime' },
      { name: 'Leave', path: '/leave', description: 'Leave management' },
      { name: 'Payroll', path: '/payroll', description: 'Payroll processing' },
      { name: 'Performance', path: '/performance', description: 'Performance reviews' },
      { name: 'Training', path: '/training', description: 'Training programs' },
      { name: 'Onboarding', path: '/onboarding', description: 'Employee onboarding' },
      { name: 'Offboarding', path: '/offboarding', description: 'Employee offboarding' },
      { name: 'Movement', path: '/movement', description: 'Transfers & promotions' },
      { name: 'Contracts', path: '/contracts', description: 'Contract management' },
      { name: 'Assets', path: '/assets', description: 'Asset management' },
      { name: 'Benefits', path: '/benefits', description: 'Employee benefits' },
      { name: 'Disciplinary', path: '/disciplinary', description: 'Disciplinary cases' },
      { name: 'Compliance', path: '/compliance', description: 'Compliance & statutory' },
      { name: 'Announcements', path: '/announcements', description: 'Company announcements' },
      { name: 'Analytics', path: '/analytics', description: 'Analytics & dashboards' },
      { name: 'Salary Intelligence', path: '/salary-intelligence', description: 'Salary benchmarking' },
      { name: 'ExactAI', path: '/ai', description: 'AI assistant' },
      { name: 'Notifications', path: '/notifications', description: 'Notifications' },
      { name: 'Tasks', path: '/tasks', description: 'Task management' },
      { name: 'HR Query', path: '/hr-query', description: 'HR Q&A and tickets' },
      { name: 'Documents', path: '/documents', description: 'Document management' },
      { name: 'Integrations', path: '/integrations', description: 'Third-party integrations' },
    ];
  }
}
