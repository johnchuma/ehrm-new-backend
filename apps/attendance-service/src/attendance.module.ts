import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { AttendanceService } from './attendance/attendance.service';
import { ApprovalService } from './attendance/approvals.service';
import { ExceptionService } from './exceptions/exceptions.service';
import { ShiftService } from './shifts/shifts.service';
import { SwapService } from './swap-requests/swap.service';
import { OvertimeService } from './overtime/overtime.service';
import { GeofenceService } from './geofencing/geofencing.service';

const SERVICE_NAME = 'attendance';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    AttendanceService,
    ApprovalService,
    ExceptionService,
    ShiftService,
    SwapService,
    OvertimeService,
    GeofenceService,
  ],
  exports: [AttendanceService, ApprovalService, ExceptionService, ShiftService, SwapService, OvertimeService, GeofenceService],
})
export class AttendanceModule {}
