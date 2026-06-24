import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlans() {
    return [
      { id: 'starter', name: 'HR Starter', price: 2500, features: ['Employee Directory', 'Basic Leave', 'Self-Service Portal'], maxUsers: 50, support: 'Email', highlighted: false },
      { id: 'essentials', name: 'HR Essentials', price: 4500, features: ['HR Starter', 'Attendance Tracking', 'Leave Management', 'ESS Mobile App'], maxUsers: 200, support: 'Email', highlighted: false },
      { id: 'professional', name: 'HR Professional', price: 9000, features: ['HR Essentials', 'Training & Development', 'Performance Reviews', 'Benefits & CTC'], maxUsers: 1000, support: 'Priority', highlighted: true },
      { id: 'enterprise', name: 'Enterprise Suite', price: 14000, features: ['HR Professional', 'Compliance & Disciplinary', 'Tasks & Workflows', 'Exec Dashboards'], maxUsers: 5000, support: 'Dedicated', highlighted: false },
      { id: 'intelligence', name: 'Intelligence Premium', price: 18000, features: ['Enterprise Suite', 'ExactAI Copilot', 'Advanced Analytics', 'Salary Survey Data'], maxUsers: null, support: 'Dedicated', highlighted: false },
    ];
  }

  async getCompanies() {
    const users = await this.prisma.user.findMany();
    const companies = new Map<string, { name: string; users: number }>();
    for (const u of users) {
      if (u.companyId) {
        const c = companies.get(u.companyId) || { name: u.companyId, users: 0 };
        c.users++;
        companies.set(u.companyId, c);
      }
    }
    return Array.from(companies.entries()).map(([id, c]) => ({
      id,
      company: c.name,
      plan: 'HR Professional',
      status: 'Active',
      users: c.users,
      nextBilling: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    }));
  }

  async getInvoices() {
    return [
      { id: 'INV-001', company: 'Demo Company', amount: 5000000, period: 'Jun 2026', status: 'Pending', issuedDate: '2026-06-01', dueDate: '2026-07-01', paidDate: null },
      { id: 'INV-002', company: 'Demo Company', amount: 5000000, period: 'May 2026', status: 'Paid', issuedDate: '2026-05-01', dueDate: '2026-06-01', paidDate: '2026-05-28' },
    ];
  }

  async getUsageMetrics() {
    const userCount = await this.prisma.user.count();
    return {
      totalCompanies: 0,
      totalMRR: 0,
      moduleAdoption: [
        { module: 'Attendance', pct: 0 },
        { module: 'Leave', pct: 0 },
        { module: 'Payroll', pct: 0 },
        { module: 'Training', pct: 0 },
        { module: 'Performance', pct: 0 },
        { module: 'Compliance', pct: 0 },
      ],
      apiCalls: 0,
      storage: 0,
      activeUsers: userCount,
    };
  }

  async getAlerts() {
    return [];
  }
}
