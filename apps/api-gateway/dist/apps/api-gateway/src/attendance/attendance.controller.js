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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const attendance_service_1 = require("../../../attendance-service/src/attendance/attendance.service");
const exceptions_service_1 = require("../../../attendance-service/src/exceptions/exceptions.service");
const shifts_service_1 = require("../../../attendance-service/src/shifts/shifts.service");
const swap_service_1 = require("../../../attendance-service/src/swap-requests/swap.service");
const overtime_service_1 = require("../../../attendance-service/src/overtime/overtime.service");
const geofencing_service_1 = require("../../../attendance-service/src/geofencing/geofencing.service");
const approvals_service_1 = require("../../../attendance-service/src/attendance/approvals.service");
let AttendanceController = class AttendanceController {
    attService;
    excService;
    shiftService;
    swapService;
    otService;
    gfService;
    apprService;
    constructor(attService, excService, shiftService, swapService, otService, gfService, apprService) {
        this.attService = attService;
        this.excService = excService;
        this.shiftService = shiftService;
        this.swapService = swapService;
        this.otService = otService;
        this.gfService = gfService;
        this.apprService = apprService;
    }
    checkIn(body) { return this.attService.checkIn(body); }
    checkOut(body) { return this.attService.checkOut(body); }
    listRecords(query) { return this.attService.listRecords(query.companyId, query); }
    today(companyId) { return this.attService.getTodayAttendance(companyId); }
    bulkMark(body) { return this.attService.bulkMark(body); }
    createException(body) { return this.excService.create(body); }
    listExceptions(query) { return this.excService.list(query.companyId, query.status); }
    resolveException(id, body) { return this.excService.resolve(id, body.notes); }
    createShift(body) { return this.shiftService.create(body); }
    listShifts(query) { return this.shiftService.list(query.companyId); }
    assignShift(body) { return this.shiftService.assign(body); }
    createOT(body) { return this.otService.create(body); }
    listOT(query) { return this.otService.list(query.companyId, query.status); }
    approveOT(id, body) { return this.otService.approve(id, body.approved ? 'approved' : 'rejected'); }
    createGF(body) { return this.gfService.create(body); }
    listGF(query) { return this.gfService.list(query.companyId); }
    createAppr(body) { return this.apprService.create(body); }
    listAppr(query) { return this.apprService.list(query.companyId, query.status); }
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
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService,
        exceptions_service_1.ExceptionService,
        shifts_service_1.ShiftService,
        swap_service_1.SwapService,
        overtime_service_1.OvertimeService,
        geofencing_service_1.GeofenceService,
        approvals_service_1.ApprovalService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map