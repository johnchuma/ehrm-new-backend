import { IntegrationService } from '../../../integrations-service/src/integrations/integrations.service';
import { WebhookService } from '../../../integrations-service/src/webhooks/webhooks.service';
export declare class IntegrationsController {
    private readonly integrationService;
    private readonly webhookService;
    constructor(integrationService: IntegrationService, webhookService: WebhookService);
    create(body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    list(query: any): Promise<{
        integrations: any;
    }>;
    update(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    toggle(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        name: any;
        type: any;
        provider: any;
        config: any;
        status: any;
        enabled: any;
        lastSyncAt: any;
        createdAt: any;
    }>;
    createWh(body: any): Promise<{
        id: any;
        companyId: any;
        url: any;
        events: any;
        secret: any;
        status: any;
        createdAt: any;
    }>;
    listWh(query: any): Promise<{
        webhooks: any;
    }>;
    removeWh(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
