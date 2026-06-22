import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class AttendanceService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async checkIn(data: { employeeId: string; method?: string; lat?: number; lng?: number; deviceId?: string; companyId?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: data.employeeId, date: today } },
    });

    if (existing && existing.checkIn) {
      throw GrpcErrors.ALREADY_EXISTS('Already checked in today');
    }

    const now = new Date();
    const expectedTime = new Date(today);
    expectedTime.setHours(8, 0, 0, 0);
    const status = now > expectedTime ? 'Late' : 'Present';

    const record = existing
      ? await this.prisma.attendanceRecord.update({
          where: { id: existing.id },
          data: {
            checkIn: now,
            method: data.method || 'Web',
            lat: data.lat,
            lng: data.lng,
            deviceId: data.deviceId,
            status,
          },
        })
      : await this.prisma.attendanceRecord.create({
          data: {
            employeeId: data.employeeId,
            companyId: data.companyId || '',
            date: today,
            checkIn: now,
            method: data.method || 'Web',
            lat: data.lat,
            lng: data.lng,
            deviceId: data.deviceId,
            status,
          },
        });

    return this.toResponse(record);
  }

  async checkOut(data: { employeeId: string; method?: string; lat?: number; lng?: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendanceRecord.findUnique({
      where: { employeeId_date: { employeeId: data.employeeId, date: today } },
    });

    if (!record || !record.checkIn) {
      throw GrpcErrors.NOT_FOUND('No check-in found for today');
    }

    const now = new Date();
    const hours = (now.getTime() - record.checkIn.getTime()) / (1000 * 60 * 60);

    const updated = await this.prisma.attendanceRecord.update({
      where: { id: record.id },
      data: {
        checkOut: now,
        hours: Math.round(hours * 100) / 100,
        method: data.method || record.method,
        lat: data.lat,
        lng: data.lng,
      },
    });

    return this.toResponse(updated);
  }

  async getRecord(id: string) {
    const r = await this.prisma.attendanceRecord.findUnique({ where: { id } });
    if (!r) throw GrpcErrors.NOT_FOUND('Record not found');
    return this.toResponse(r);
  }

  async listRecords(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.date) {
      const d = new Date(filters.date);
      d.setHours(0, 0, 0, 0);
      where.date = d;
    }
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50;
    const [records, total] = await Promise.all([
      this.prisma.attendanceRecord.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      this.prisma.attendanceRecord.count({ where }),
    ]);
    return { records: records.map((r) => this.toResponse(r)), total };
  }

  async getTodayAttendance(companyId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await this.prisma.attendanceRecord.findMany({
      where: { companyId, date: today },
    });
    return { records: records.map((r) => this.toResponse(r)), total: records.length };
  }

  async bulkMark(data: { companyId: string; branchId?: string; departmentId?: string; date: string; status: string; employeeIds: string[] }) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);
    let count = 0;
    for (const empId of data.employeeIds) {
      await this.prisma.attendanceRecord.upsert({
        where: { employeeId_date: { employeeId: empId, date } },
        update: { status: data.status },
        create: {
          employeeId: empId,
          companyId: data.companyId,
          date,
          status: data.status,
        },
      });
      count++;
    }
    return { marked: count, message: `Marked ${count} employees` };
  }

  private toResponse(r: any) {
    return {
      id: r.id, employeeId: r.employeeId, companyId: r.companyId,
      date: r.date?.toISOString() || '',
      checkIn: r.checkIn?.toISOString() || '',
      checkOut: r.checkOut?.toISOString() || '',
      hours: r.hours, method: r.method, status: r.status,
      lat: r.lat, lng: r.lng,
    };
  }
}
