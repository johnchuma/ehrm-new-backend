"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HRQueryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const hr_query_service_1 = require("../../../hr-query-service/src/hr-query/hr-query.service");
const tickets_service_1 = require("../../../hr-query-service/src/tickets/tickets.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let HRQueryController = class HRQueryController {
    queryService;
    ticketService;
    constructor(queryService, ticketService) {
        this.queryService = queryService;
        this.ticketService = ticketService;
    }
    ask(body) { return this.queryService.askQuestion(body); }
    faqs(query) { return this.queryService.getFAQs(query.companyId, query.category); }
    createFaq(body) { return this.queryService.createFAQ(body); }
    listTickets(query) { return this.ticketService.list(query.companyId, query.userId, query.status); }
    createTicket(body) { return this.ticketService.create(body); }
    reply(id, body) { return this.ticketService.reply(id, body.message, body.repliedBy); }
};
exports.HRQueryController = HRQueryController;
__decorate([
    (0, common_1.Post)('ask'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['question', 'employeeId', 'companyId'],
            properties: {
                question: { type: 'string', example: 'What is the company policy on remote work?' },
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-tz-001' },
                context: { type: 'string', example: 'Employee is requesting to work from home 3 days per week' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "ask", null);
__decorate([
    (0, common_1.Get)('faqs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "faqs", null);
__decorate([
    (0, common_1.Post)('faqs'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'question', 'answer', 'category'],
            properties: {
                companyId: { type: 'string', example: 'comp-tz-001' },
                question: { type: 'string', example: 'How do I apply for annual leave?' },
                answer: { type: 'string', example: 'Submit a leave request through the HR portal at least 7 days in advance.' },
                category: { type: 'string', example: 'Leave Policy' },
                tags: { type: 'array', items: { type: 'string' }, example: ['leave', 'annual', 'hr'] },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "createFaq", null);
__decorate([
    (0, common_1.Get)('tickets'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "listTickets", null);
__decorate([
    (0, common_1.Post)('tickets'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'subject', 'description', 'category', 'priority'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-tz-001' },
                subject: { type: 'string', example: 'Salary discrepancy for June 2026' },
                description: { type: 'string', example: 'My June salary was short by TSH 150,000. Please review.' },
                category: { type: 'string', example: 'Salary & Compensation' },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Post)('tickets/:id/reply'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['repliedBy', 'message', 'status'],
            properties: {
                repliedBy: { type: 'string', example: 'emp-002' },
                message: { type: 'string', example: 'The salary discrepancy has been reviewed and corrected. You will receive the adjustment in the next payroll cycle.' },
                status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'], example: 'resolved' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], HRQueryController.prototype, "reply", null);
exports.HRQueryController = HRQueryController = __decorate([
    (0, swagger_1.ApiTags)('HR Query'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('hr-query'),
    __metadata("design:paramtypes", [hr_query_service_1.HRQueryService,
        tickets_service_1.TicketService])
], HRQueryController);
//# sourceMappingURL=hr-query.controller.js.map