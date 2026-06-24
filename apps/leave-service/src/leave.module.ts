import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { LeaveRequestService } from './leave-requests/leave-requests.service';
import { LeaveTypeService } from './leave-types/leave-types.service';
import { LeaveBalanceService } from './leave-balances/leave-balances.service';
import { EncashmentService } from './encashment/encashment.service';
import { BlackoutService } from './blackouts/blackouts.service';

const SERVICE_NAME = 'leave';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    LeaveRequestService,
    LeaveTypeService,
    LeaveBalanceService,
    EncashmentService,
    BlackoutService,
  ],
  exports: [LeaveRequestService, LeaveTypeService, LeaveBalanceService, EncashmentService, BlackoutService],
})
export class LeaveModule {}
