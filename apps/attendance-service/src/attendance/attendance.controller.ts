import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AttendanceService } from './attendance.service';

@Controller()
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @GrpcMethod('AttendanceService', 'CheckIn')
  checkIn(data: any) { return this.service.checkIn(data); }

  @GrpcMethod('AttendanceService', 'CheckOut')
  checkOut(data: any) { return this.service.checkOut(data); }

  @GrpcMethod('AttendanceService', 'GetRecord')
  get(data: { id: string }) { return this.service.getRecord(data.id); }

  @GrpcMethod('AttendanceService', 'ListRecords')
  list(data: { companyId: string; employeeId?: string; date?: string; page?: number; pageSize?: number }) {
    return this.service.listRecords(data.companyId, data);
  }

  @GrpcMethod('AttendanceService', 'GetTodayAttendance')
  today(data: { companyId: string }) { return this.service.getTodayAttendance(data.companyId); }

  @GrpcMethod('AttendanceService', 'BulkMarkAttendance')
  bulk(data: any) { return this.service.bulkMark(data); }
}
