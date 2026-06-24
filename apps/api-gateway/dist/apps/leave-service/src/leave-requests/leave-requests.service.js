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
exports.LeaveRequestService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let LeaveRequestService = class LeaveRequestService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const days = data.days || this.calculateDays(data.from, data.to);
        const type = await this.prisma.leaveType.findUnique({ where: { id: data.leaveTypeId } });
        if (!type)
            throw decorators_1.GrpcErrors.NOT_FOUND('Leave type not found');
        const balance = await this.prisma.leaveBalance.findFirst({
            where: { employeeId: data.employeeId, leaveTypeId: data.leaveTypeId },
        });
        if (balance && balance.available < days) {
            throw decorators_1.GrpcErrors.FAILED_PRECONDITION(`Insufficient leave balance. Available: ${balance.available} days`);
        }
        const req = await this.prisma.leaveRequest.create({
            data: {
                companyId: data.companyId,
                employeeId: data.employeeId,
                leaveTypeId: data.leaveTypeId,
                from: new Date(data.from),
                to: new Date(data.to),
                days,
                reason: data.reason,
                status: 'Pending',
            },
        });
        return this.toResponse(req, type.name);
    }
    async approve(id, approverId, comments) {
        const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!req)
            throw decorators_1.GrpcErrors.NOT_FOUND('Leave request not found');
        const updated = await this.prisma.leaveRequest.update({
            where: { id },
            data: { status: 'Approved', approverId, comments },
        });
        await this.prisma.leaveBalance.updateMany({
            where: { employeeId: req.employeeId, leaveTypeId: req.leaveTypeId },
            data: { used: { increment: req.days }, available: { decrement: req.days } },
        });
        const type = await this.prisma.leaveType.findUnique({ where: { id: req.leaveTypeId } });
        return this.toResponse(updated, type?.name || '');
    }
    async reject(id, approverId, reason) {
        const updated = await this.prisma.leaveRequest.update({
            where: { id },
            data: { status: 'Rejected', approverId, comments: reason },
        });
        const type = await this.prisma.leaveType.findUnique({ where: { id: updated.leaveTypeId } });
        return this.toResponse(updated, type?.name || '');
    }
    async get(id) {
        const req = await this.prisma.leaveRequest.findUnique({ where: { id } });
        if (!req)
            throw decorators_1.GrpcErrors.NOT_FOUND('Leave request not found');
        const type = await this.prisma.leaveType.findUnique({ where: { id: req.leaveTypeId } });
        return this.toResponse(req, type?.name || '');
    }
    async list(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
        if (filters.status)
            where.status = filters.status;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 50;
        const [requests, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({
                where,
                include: {},
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.leaveRequest.count({ where }),
        ]);
        const types = await this.prisma.leaveType.findMany({ where: { companyId } });
        const typeMap = new Map(types.map((t) => [t.id, t.name]));
        return { requests: requests.map((r) => this.toResponse(r, typeMap.get(r.leaveTypeId) || '')), total };
    }
    async getCalendarEvents(companyId, year, month) {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59);
        const requests = await this.prisma.leaveRequest.findMany({
            where: { companyId, from: { lte: end }, to: { gte: start }, status: 'Approved' },
        });
        const types = await this.prisma.leaveType.findMany({ where: { companyId } });
        const typeMap = new Map(types.map((t) => [t.id, t.name]));
        return { requests: requests.map((r) => this.toResponse(r, typeMap.get(r.leaveTypeId) || '')), total: requests.length };
    }
    calculateDays(from, to) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    toResponse(r, leaveTypeName) {
        return {
            id: r.id, companyId: r.companyId, employeeId: r.employeeId,
            leaveTypeId: r.leaveTypeId, leaveTypeName,
            from: r.from?.toISOString() || '', to: r.to?.toISOString() || '',
            days: r.days, reason: r.reason, status: r.status,
            createdAt: r.createdAt?.toISOString() || '',
            updatedAt: r.updatedAt?.toISOString() || '',
        };
    }
};
exports.LeaveRequestService = LeaveRequestService;
exports.LeaveRequestService = LeaveRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], LeaveRequestService);
//# sourceMappingURL=leave-requests.service.js.map