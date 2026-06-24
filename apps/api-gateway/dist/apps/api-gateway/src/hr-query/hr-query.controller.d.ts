import { HRQueryService } from '../../../hr-query-service/src/hr-query/hr-query.service';
import { TicketService } from '../../../hr-query-service/src/tickets/tickets.service';
export declare class HRQueryController {
    private readonly queryService;
    private readonly ticketService;
    constructor(queryService: HRQueryService, ticketService: TicketService);
    ask(body: any): Promise<{
        answer: any;
        confidence: string;
        relatedQuestions: any;
        relatedFAQs: any;
    }>;
    faqs(query: any): Promise<{
        faqs: any;
    }>;
    createFaq(body: any): Promise<{
        id: any;
        question: any;
        answer: any;
        category: any;
        views: any;
        helpfulness: any;
        createdAt: any;
    }>;
    listTickets(query: any): Promise<{
        tickets: any;
    }>;
    createTicket(body: any): Promise<{
        id: any;
        companyId: any;
        userId: any;
        userName: any;
        subject: any;
        description: any;
        category: any;
        priority: any;
        status: any;
        replies: any;
        createdAt: any;
        closedAt: any;
    }>;
    reply(id: string, body: any): Promise<{
        id: any;
        companyId: any;
        userId: any;
        userName: any;
        subject: any;
        description: any;
        category: any;
        priority: any;
        status: any;
        replies: any;
        createdAt: any;
        closedAt: any;
    }>;
}
