import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AttendanceService } from './attendance/attendance.service';
import { ApprovalService } from './attendance/approvals.service';
import { ExceptionService } from './exceptions/exceptions.service';
import { ShiftService } from './shifts/shifts.service';
import { SwapService } from './swap-requests/swap.service';
import { OvertimeService } from './overtime/overtime.service';
import { GeofenceService } from './geofencing/geofencing.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [AttendanceService, ApprovalService, ExceptionService, ShiftService, SwapService, OvertimeService, GeofenceService],
  exports: [AttendanceService, ApprovalService, ExceptionService, ShiftService, SwapService, OvertimeService, GeofenceService],
})
export class AttendanceModule {}
