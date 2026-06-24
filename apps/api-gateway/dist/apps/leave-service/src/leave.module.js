"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaveModule = void 0;
const common_1 = require("@nestjs/common");
const common_module_1 = require("../../../libs/common/src/common.module");
const prisma_module_1 = require("../../../libs/common/src/prisma/prisma.module");
const leave_requests_service_1 = require("./leave-requests/leave-requests.service");
const leave_types_service_1 = require("./leave-types/leave-types.service");
const leave_balances_service_1 = require("./leave-balances/leave-balances.service");
const encashment_service_1 = require("./encashment/encashment.service");
const blackouts_service_1 = require("./blackouts/blackouts.service");
let LeaveModule = class LeaveModule {
};
exports.LeaveModule = LeaveModule;
exports.LeaveModule = LeaveModule = __decorate([
    (0, common_1.Module)({
        imports: [common_module_1.CommonModule, prisma_module_1.PrismaModule],
        providers: [leave_requests_service_1.LeaveRequestService, leave_types_service_1.LeaveTypeService, leave_balances_service_1.LeaveBalanceService, encashment_service_1.EncashmentService, blackouts_service_1.BlackoutService],
        exports: [leave_requests_service_1.LeaveRequestService, leave_types_service_1.LeaveTypeService, leave_balances_service_1.LeaveBalanceService, encashment_service_1.EncashmentService, blackouts_service_1.BlackoutService],
    })
], LeaveModule);
//# sourceMappingURL=leave.module.js.map