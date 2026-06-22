import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';

@Injectable()
export class AIService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async chat(data: { companyId: string; userId: string; message: string; context?: string }) {
    const response = this.generateResponse(data.message);
    await this.prisma.aIChat.create({
      data: {
        companyId: data.companyId,
        userId: data.userId,
        message: data.message,
        response,
        context: data.context,
      },
    });
    return {
      response,
      suggestions: this.getSuggestions(data.message),
      confidence: 'high',
    };
  }

  async summarizeEmployee(employeeId: string) {
    return {
      summary: 'Employee shows consistent performance with strong attendance. Recent performance review rated 4.2/5.',
      highlights: [
        'Top performer in Q1 2026',
        'No disciplinary issues on record',
        'Completed 3 training programs this year',
      ],
      concerns: [
        'Late arrivals increased by 15% in last quarter',
      ],
      recommendations: [
        'Consider for senior role promotion',
        'Schedule one-on-one for career development',
        'Assign as mentor for new joiners',
      ],
    };
  }

  async getInsights(companyId: string, type: string) {
    return {
      type,
      insights: [
        { title: 'High Attrition Risk', description: '3 employees in Operations show signs of potential departure', severity: 'High', category: 'Retention' },
        { title: 'Training Gap', description: 'IT department has outdated certifications', severity: 'Moderate', category: 'Compliance' },
        { title: 'Overtime Spike', description: 'Logistics overtime increased 22% this month', severity: 'Moderate', category: 'Operations' },
      ],
      summary: 'Overall company health is good with 3 areas requiring attention.',
    };
  }

  async predictAttrition(companyId: string, departmentId?: string) {
    return {
      riskScore: 12.5,
      employees: [
        { employeeId: 'EMP1007', employeeName: 'Joseph Mwanga', riskScore: 78, department: 'Logistics' },
        { employeeId: 'EMP1009', employeeName: 'Peter Mosha', riskScore: 65, department: 'IT' },
        { employeeId: 'EMP1010', employeeName: 'Mary Kitua', riskScore: 58, department: 'Marketing' },
      ],
      factors: [
        'Below market compensation',
        'Limited career growth',
        'High workload',
        'Long tenure without promotion',
      ],
    };
  }

  async recommendActions(companyId: string, type: string) {
    return {
      recommendations: [
        { title: 'Implement retention bonus', description: 'Provide retention bonus for high-risk employees', priority: 'High', category: 'Retention', impact: 'Reduce attrition by 30%' },
        { title: 'Launch training program', description: 'Implement skills upgrade program', priority: 'Medium', category: 'Development', impact: 'Improve productivity by 15%' },
      ],
    };
  }

  private generateResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('leave') || lower.includes('vacation')) {
      return 'I can help you with leave management. You can view your balance, apply for leave, or check the status of pending requests. What would you like to do?';
    }
    if (lower.includes('payroll') || lower.includes('salary')) {
      return 'I can help you with payroll inquiries. You can view your payslips, check salary history, or simulate salary changes.';
    }
    if (lower.includes('attendance')) {
      return 'I can help you check your attendance records, apply for corrections, or view your attendance history.';
    }
    if (lower.includes('employee') || lower.includes('staff')) {
      return 'I can help you manage employees, view employee profiles, or search the employee directory.';
    }
    return 'I am ExactAI, your HR assistant. I can help you with leave, payroll, attendance, performance, training, and other HR queries. How can I assist you today?';
  }

  private getSuggestions(message: string): string[] {
    return [
      'Show my leave balance',
      'View recent payslip',
      'Check attendance history',
      'Apply for leave',
    ];
  }
}
