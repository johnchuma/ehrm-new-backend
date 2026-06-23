export declare class SettingsService {
    private readonly prisma;
    constructor(prisma: any);
    getSettings(companyId: string): Promise<{
        id: any;
        companyId: any;
        payrollCycle: any;
        leavePolicy: any;
        workHours: any;
        overtimeRate: any;
        taxSettings: any;
        notificationSettings: any;
        themeSettings: any;
        generalSettings: any;
    }>;
    updateSettings(companyId: string, data: any): Promise<{
        id: any;
        companyId: any;
        payrollCycle: any;
        leavePolicy: any;
        workHours: any;
        overtimeRate: any;
        taxSettings: any;
        notificationSettings: any;
        themeSettings: any;
        generalSettings: any;
    }>;
}
