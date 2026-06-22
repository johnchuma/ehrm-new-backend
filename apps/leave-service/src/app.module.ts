import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { LeaveRequestController } from './leave-requests/leave-requests.controller';
import { LeaveTypeController } from './leave-types/leave-types.controller';
import { LeaveBalanceController, LiabilityController } from './leave-balances/leave-balances.controller';
import { EncashmentController } from './encashment/encashment.controller';
import { BlackoutController } from './blackouts/blackouts.controller';
import { LeaveRequestService } from './leave-requests/leave-requests.service';
import { LeaveTypeService } from './leave-types/leave-types.service';
import { LeaveBalanceService } from './leave-balances/leave-balances.service';
import { EncashmentService } from './encashment/encashment.service';
import { BlackoutService } from './blackouts/blackouts.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('leave')],
  controllers: [LeaveRequestController, LeaveTypeController, LeaveBalanceController, LiabilityController, EncashmentController, BlackoutController],
  providers: [LeaveRequestService, LeaveTypeService, LeaveBalanceService, EncashmentService, BlackoutService],
})
export class AppModule {}
