import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class SettingsService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async getSettings(companyId: string) {
    let settings = await this.prisma.companySettings.findUnique({ where: { companyId } });
    if (!settings) {
      settings = await this.prisma.companySettings.create({ data: { companyId } });
    }
    return {
      id: settings.id,
      companyId: settings.companyId,
      payrollCycle: settings.payrollCycle,
      leavePolicy: settings.leavePolicy,
      workHours: settings.workHours,
      overtimeRate: settings.overtimeRate,
      taxSettings: settings.taxSettings,
      notificationSettings: settings.notificationSettings,
      themeSettings: settings.themeSettings,
      generalSettings: settings.generalSettings,
    };
  }

  async updateSettings(companyId: string, data: any) {
    const settings = await this.prisma.companySettings.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    });
    return {
      id: settings.id,
      companyId: settings.companyId,
      payrollCycle: settings.payrollCycle,
      leavePolicy: settings.leavePolicy,
      workHours: settings.workHours,
      overtimeRate: settings.overtimeRate,
      taxSettings: settings.taxSettings,
      notificationSettings: settings.notificationSettings,
      themeSettings: settings.themeSettings,
      generalSettings: settings.generalSettings,
    };
  }
}
