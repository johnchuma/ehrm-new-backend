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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const grpc_module_1 = require("../../../../libs/common/src/grpc/grpc.module");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AttendanceController = class AttendanceController {
    client;
    attService;
    excService;
    shiftService;
    swapService;
    otService;
    gfService;
    apprService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.attService = this.client.getService('AttendanceService');
        this.excService = this.client.getService('AttendanceExceptionService');
        this.shiftService = this.client.getService('ShiftService');
        this.swapService = this.client.getService('ShiftSwapService');
        this.otService = this.client.getService('OvertimeService');
        this.gfService = this.client.getService('GeofenceService');
        this.apprService = this.client.getService('AttendanceApprovalService');
    }
    checkIn(body) { return (0, rxjs_1.firstValueFrom)(this.attService.CheckIn(body)); }
    checkOut(body) { return (0, rxjs_1.firstValueFrom)(this.attService.CheckOut(body)); }
    listRecords(query) { return (0, rxjs_1.firstValueFrom)(this.attService.ListRecords(query)); }
    today(companyId) { return (0, rxjs_1.firstValueFrom)(this.attService.GetTodayAttendance({ companyId })); }
    bulkMark(body) { return (0, rxjs_1.firstValueFrom)(this.attService.BulkMarkAttendance(body)); }
    createException(body) { return (0, rxjs_1.firstValueFrom)(this.excService.CreateException(body)); }
    listExceptions(query) { return (0, rxjs_1.firstValueFrom)(this.excService.ListExceptions(query)); }
    resolveException(id, body) { return (0, rxjs_1.firstValueFrom)(this.excService.ResolveException({ id, ...body })); }
    createShift(body) { return (0, rxjs_1.firstValueFrom)(this.shiftService.CreateShift(body)); }
    listShifts(query) { return (0, rxjs_1.firstValueFrom)(this.shiftService.ListShifts(query)); }
    assignShift(body) { return (0, rxjs_1.firstValueFrom)(this.shiftService.AssignShift(body)); }
    createOT(body) { return (0, rxjs_1.firstValueFrom)(this.otService.CreateOvertime(body)); }
    listOT(query) { return (0, rxjs_1.firstValueFrom)(this.otService.ListOvertime(query)); }
    approveOT(id, body) { return (0, rxjs_1.firstValueFrom)(this.otService.ApproveOvertime({ id, ...body })); }
    createGF(body) { return (0, rxjs_1.firstValueFrom)(this.gfService.CreateGeofence(body)); }
    listGF(query) { return (0, rxjs_1.firstValueFrom)(this.gfService.ListGeofences(query)); }
    createAppr(body) { return (0, rxjs_1.firstValueFrom)(this.apprService.CreateApproval(body)); }
    listAppr(query) { return (0, rxjs_1.firstValueFrom)(this.apprService.ListApprovals(query)); }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('check-in'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'method'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                method: { type: 'string', example: 'geofence' },
                latitude: { type: 'number', example: -6.7924 },
                longitude: { type: 'number', example: 39.2083 },
                notes: { type: 'string', example: 'Checked in from main office' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('check-out'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                notes: { type: 'string', example: 'Leaving for the day' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)('records'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listRecords", null);
__decorate([
    (0, common_1.Get)('records/today/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "today", null);
__decorate([
    (0, common_1.Post)('bulk-mark'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'employeeIds', 'date', 'status'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                employeeIds: { type: 'array', items: { type: 'string' }, example: ['emp-001', 'emp-002', 'emp-003'] },
                date: { type: 'string', example: '2024-06-15' },
                status: { type: 'string', example: 'present' },
                reason: { type: 'string', example: 'Company-wide training day' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "bulkMark", null);
__decorate([
    (0, common_1.Post)('exceptions'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'date', 'type'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                date: { type: 'string', example: '2024-06-15' },
                type: { type: 'string', example: 'late_arrival' },
                description: { type: 'string', example: 'Traffic jam on Morogoro Road caused 30-minute delay' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createException", null);
__decorate([
    (0, common_1.Get)('exceptions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listExceptions", null);
__decorate([
    (0, common_1.Post)('exceptions/:id/resolve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['resolution', 'approvedBy'],
            properties: {
                resolution: { type: 'string', example: 'approved' },
                notes: { type: 'string', example: 'Valid reason confirmed with manager' },
                approvedBy: { type: 'string', example: 'mgr-001' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "resolveException", null);
__decorate([
    (0, common_1.Post)('shifts'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'startTime', 'endTime'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                name: { type: 'string', example: 'Morning Shift' },
                startTime: { type: 'string', example: '08:00' },
                endTime: { type: 'string', example: '17:00' },
                breakMinutes: { type: 'number', example: 60 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createShift", null);
__decorate([
    (0, common_1.Get)('shifts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listShifts", null);
__decorate([
    (0, common_1.Post)('shifts/assign'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['shiftId', 'employeeIds', 'startDate'],
            properties: {
                shiftId: { type: 'string', example: 'shift-001' },
                employeeIds: { type: 'array', items: { type: 'string' }, example: ['emp-001', 'emp-002'] },
                startDate: { type: 'string', example: '2024-07-01' },
                endDate: { type: 'string', example: '2024-07-31' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "assignShift", null);
__decorate([
    (0, common_1.Post)('overtime'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'date', 'hours', 'reason'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                date: { type: 'string', example: '2024-06-15' },
                hours: { type: 'number', example: 3.5 },
                reason: { type: 'string', example: 'Urgent server migration project deadline' },
                approvedBy: { type: 'string', example: 'mgr-001' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createOT", null);
__decorate([
    (0, common_1.Get)('overtime'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listOT", null);
__decorate([
    (0, common_1.Post)('overtime/:id/approve'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['approved', 'approvedBy'],
            properties: {
                approved: { type: 'boolean', example: true },
                approvedBy: { type: 'string', example: 'mgr-001' },
                notes: { type: 'string', example: 'Approved - project deadline is critical' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "approveOT", null);
__decorate([
    (0, common_1.Post)('geofences'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['companyId', 'name', 'latitude', 'longitude', 'radiusMeters'],
            properties: {
                companyId: { type: 'string', example: 'comp-001' },
                name: { type: 'string', example: 'Head Office - Dar es Salaam' },
                latitude: { type: 'number', example: -6.7924 },
                longitude: { type: 'number', example: 39.2083 },
                radiusMeters: { type: 'number', example: 200 },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createGF", null);
__decorate([
    (0, common_1.Get)('geofences'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listGF", null);
__decorate([
    (0, common_1.Post)('approvals'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            required: ['employeeId', 'companyId', 'type', 'status', 'approvedBy'],
            properties: {
                employeeId: { type: 'string', example: 'emp-001' },
                companyId: { type: 'string', example: 'comp-001' },
                type: { type: 'string', example: 'overtime' },
                status: { type: 'string', example: 'pending' },
                approvedBy: { type: 'string', example: 'mgr-001' },
                notes: { type: 'string', example: 'Awaiting department head approval' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createAppr", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "listAppr", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('attendance'),
    __param(0, (0, common_1.Inject)(grpc_module_1.GRPC_SERVICES.ATTENDANCE)),
    __metadata("design:paramtypes", [Object])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map