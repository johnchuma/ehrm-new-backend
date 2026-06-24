"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const attendance_service_1 = require("./attendance/attendance.service");
const approvals_service_1 = require("./attendance/approvals.service");
const exceptions_service_1 = require("./exceptions/exceptions.service");
const shifts_service_1 = require("./shifts/shifts.service");
const swap_service_1 = require("./swap-requests/swap.service");
const overtime_service_1 = require("./overtime/overtime.service");
const geofencing_service_1 = require("./geofencing/geofencing.service");
let AttendanceModule = class AttendanceModule {
};
exports.AttendanceModule = AttendanceModule;
exports.AttendanceModule = AttendanceModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule],
        providers: [attendance_service_1.AttendanceService, approvals_service_1.ApprovalService, exceptions_service_1.ExceptionService, shifts_service_1.ShiftService, swap_service_1.SwapService, overtime_service_1.OvertimeService, geofencing_service_1.GeofenceService],
        exports: [attendance_service_1.AttendanceService, approvals_service_1.ApprovalService, exceptions_service_1.ExceptionService, shifts_service_1.ShiftService, swap_service_1.SwapService, overtime_service_1.OvertimeService, geofencing_service_1.GeofenceService],
    })
], AttendanceModule);
//# sourceMappingURL=attendance.module.js.map