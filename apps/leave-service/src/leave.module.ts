import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { LeaveRequestService } from './leave-requests/leave-requests.service';
import { LeaveTypeService } from './leave-types/leave-types.service';
import { LeaveBalanceService } from './leave-balances/leave-balances.service';
import { EncashmentService } from './encashment/encashment.service';
import { BlackoutService } from './blackouts/blackouts.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [LeaveRequestService, LeaveTypeService, LeaveBalanceService, EncashmentService, BlackoutService],
  exports: [LeaveRequestService, LeaveTypeService, LeaveBalanceService, EncashmentService, BlackoutService],
})
export class LeaveModule {}
