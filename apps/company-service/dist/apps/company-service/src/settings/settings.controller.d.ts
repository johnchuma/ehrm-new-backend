import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly service;
    constructor(service: SettingsService);
    get(data: {
        companyId: string;
    }): Promise<{
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
    update(data: {
        companyId: string;
    } & any): Promise<{
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
