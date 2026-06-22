import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { LeaveBalanceService } from './leave-balances.service';

@Controller()
export class LeaveBalanceController {
  constructor(private readonly service: LeaveBalanceService) {}

  @GrpcMethod('LeaveBalanceService', 'GetBalance')
  get(data: { employeeId: string; leaveTypeId: string }) { return this.service.getBalance(data.employeeId, data.leaveTypeId); }

  @GrpcMethod('LeaveBalanceService', 'ListBalances')
  list(data: { companyId?: string; employeeId?: string }) { return this.service.listBalances(data.companyId, data.employeeId); }

  @GrpcMethod('LeaveBalanceService', 'AccrueLeave')
  accrue(data: any) { return this.service.accrue(data); }
}

@Controller()
export class LiabilityController {
  constructor(private readonly service: LeaveBalanceService) {}

  @GrpcMethod('LeaveLiabilityService', 'GetLiability')
  get(data: { companyId: string }) { return this.service.getLiability(data.companyId); }

  @GrpcMethod('LeaveLiabilityService', 'GetDepartmentLiability')
  getDept(data: { companyId: string }) { return this.service.getLiability(data.companyId); }
}
