import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AttendanceController } from './attendance/attendance.controller';
import { ExceptionController } from './exceptions/exceptions.controller';
import { ShiftController } from './shifts/shifts.controller';
import { SwapController } from './swap-requests/swap.controller';
import { OvertimeController } from './overtime/overtime.controller';
import { GeofenceController } from './geofencing/geofencing.controller';
import { ApprovalController } from './attendance/approvals.controller';
import { AttendanceService } from './attendance/attendance.service';
import { ExceptionService } from './exceptions/exceptions.service';
import { ShiftService } from './shifts/shifts.service';
import { SwapService } from './swap-requests/swap.service';
import { OvertimeService } from './overtime/overtime.service';
import { GeofenceService } from './geofencing/geofencing.service';
import { ApprovalService } from './attendance/approvals.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('attendance')],
  controllers: [AttendanceController, ExceptionController, ShiftController, SwapController, OvertimeController, GeofenceController, ApprovalController],
  providers: [AttendanceService, ExceptionService, ShiftService, SwapService, OvertimeService, GeofenceService, ApprovalService],
})
export class AppModule {}
