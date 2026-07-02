import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const DAY_KEYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

/** Great-circle distance in metres between two lat/lng points. */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function parseJson(value: any, fallback: any) {
  if (!value) return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function parseHoursRange(value?: string | null): [string, string] {
  const match = String(value || '').match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  return match ? [match[1], match[2]] : ['08:00', '17:00'];
}

function pickTime(...values: Array<string | null | undefined>) {
  const value = values.find((item) => /^\d{1,2}:\d{2}$/.test(String(item || '').trim()));
  if (!value) return '';
  const [hour, minute] = String(value).split(':');
  return `${hour.padStart(2, '0')}:${minute}`;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true, companyId: true },
    });
    if (!user?.employeeId) throw new NotFoundException('Employee profile not linked to this user');
    return { employeeId: user.employeeId, companyId: user.companyId };
  }

  private todayDate() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private async expectedCheckoutFor(companyId: string, date: Date) {
    const pattern = await this.prisma.workingDayPattern.findFirst({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
    const [, defaultEnd] = parseHoursRange(pattern?.hours);
    const configs = parseJson(pattern?.dayConfigs, {});
    const dayConfig = configs?.[DAY_KEYS[date.getDay()]] || {};
    const end = pickTime(dayConfig.end, dayConfig.endTime, defaultEnd) || '17:00';
    const [hour, minute] = end.split(':').map((item) => Number(item));
    const expected = new Date(date);
    expected.setHours(hour || 17, minute || 0, 0, 0);
    return expected;
  }

  async getTodayStatus(userId: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const record = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
      include: { shift: { select: { name: true, startTime: true, endTime: true } } },
    });
    return record ?? { status: 'NOT_CHECKED_IN', date: today };
  }

  async checkIn(userId: string, dto: ClockInDto = {}) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const existing = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    if (existing?.checkIn) throw new BadRequestException('Already checked in today');

    // Geofence is enforced only when the client sends coordinates and the
    // company has configured locations. Persisting the coordinates themselves
    // requires a schema column (pending migration).
    await this.assertWithinGeofence(companyId, dto.latitude, dto.longitude);

    // Find current shift assignment
    const assignment = await this.prisma.shiftAssignment.findFirst({
      where: {
        employeeId,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: { shift: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const status = this.determineStatus(now, assignment?.shift?.startTime);
    const lateMinutes = this.computeLateMinutes(now, assignment?.shift?.startTime);

    return this.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: {
        employeeId,
        companyId,
        date: today,
        checkIn: now,
        shiftId: assignment?.shiftId ?? null,
        status,
        lateMinutes,
        checkInLatitude: dto.latitude ?? undefined,
        checkInLongitude: dto.longitude ?? undefined,
        source: dto.source ?? undefined,
        notes: dto.notes ?? undefined,
      },
      update: {
        checkIn: now,
        status,
        lateMinutes,
        checkInLatitude: dto.latitude ?? undefined,
        checkInLongitude: dto.longitude ?? undefined,
        source: dto.source ?? undefined,
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
    });
  }

  async checkOut(userId: string, dto: ClockOutDto = {}) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const today = this.todayDate();
    const record = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    if (!record?.checkIn) throw new BadRequestException('You have not checked in today');
    if (record.checkOut) throw new BadRequestException('Already checked out today');

    await this.assertWithinGeofence(companyId, dto.latitude, dto.longitude);

    const now = new Date();
    const workMinutes = Math.floor((now.getTime() - record.checkIn!.getTime()) / 60000);
    const expectedCheckout = await this.expectedCheckoutFor(companyId, today);
    const overtime = Math.max(0, Math.floor((now.getTime() - expectedCheckout.getTime()) / 60000));

    const updated = await this.prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: now,
        workMinutes,
        overtime,
        checkOutLatitude: dto.latitude ?? undefined,
        checkOutLongitude: dto.longitude ?? undefined,
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
    });

    // Overtime (overtime > 0 with approvedBy still null) surfaces directly in
    // approvers' /approvals/my-tasks — no separate approval row is created.
    return updated;
  }

  async getMyAttendance(userId: string, month?: number, year?: number) {
    const { employeeId } = await this.resolveEmployee(userId);
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    return this.prisma.attendance.findMany({
      where: { employeeId, date: { gte: start, lte: end } },
      include: { shift: { select: { name: true, startTime: true, endTime: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getMyAttendanceSummary(userId: string, month?: number, year?: number) {
    const records = await this.getMyAttendance(userId, month, year);
    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === 'PRESENT').length,
      late: records.filter((r) => r.status === 'LATE').length,
      absent: records.filter((r) => r.status === 'ABSENT').length,
      halfDay: records.filter((r) => r.status === 'HALF_DAY').length,
      onLeave: records.filter((r) => r.status === 'ON_LEAVE').length,
      totalWorkMinutes: records.reduce((acc, r) => acc + (r.workMinutes ?? 0), 0),
      totalOvertime: records.reduce((acc, r) => acc + r.overtime, 0),
    };
    return { summary, records };
  }

  // Manager: team attendance
  async getTeamAttendance(userId: string, date?: string) {
    const { employeeId } = await this.resolveEmployee(userId);
    const directReports = await this.prisma.employee.findMany({
      where: { managerId: employeeId },
      select: { id: true },
    });
    const reportIds = directReports.map((r) => r.id);
    const targetDate = date ? new Date(date) : this.todayDate();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: { employeeId: { in: reportIds }, date: targetDate },
      include: {
        employee: {
          select: {
            id: true,
            employeeNumber: true,
            user: { select: { fullName: true } },
          },
        },
      },
    });
  }

  /**
   * Enforce geofence only when coordinates are supplied AND the company has
   * active locations with coordinates. No coords, or no configured locations →
   * allowed (unchanged behaviour for non-geo clients).
   */
  private async assertWithinGeofence(companyId: string, latitude?: number, longitude?: number) {
    if (latitude == null || longitude == null) return;
    const locations = (
      await this.prisma.workspaceLocation.findMany({
        where: { companyId, isActive: true },
        select: { latitude: true, longitude: true, radiusMeters: true },
      })
    ).filter((l) => l.latitude != null && l.longitude != null);
    if (!locations.length) return;
    const withinAny = locations.some((loc) => {
      const radius = loc.radiusMeters ?? 200;
      const dist = haversineMeters(latitude, longitude, Number(loc.latitude), Number(loc.longitude));
      return dist <= radius;
    });
    if (!withinAny) throw new BadRequestException('You are outside the allowed clock-in area');
  }

  /** Pre-clock-in check: today's status, scheduled times, and geofence locations. */
  async getPreflight(userId: string, employeeId?: string) {
    const { employeeId: ownId, companyId } = await this.resolveEmployee(userId);
    if (employeeId && employeeId !== ownId) {
      throw new ForbiddenException('You can only run preflight for yourself');
    }
    const today = this.todayDate();
    const record = await this.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId: ownId, date: today } },
      select: { id: true, checkIn: true, checkOut: true },
    });
    const pattern = await this.prisma.workingDayPattern.findFirst({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });
    const [defaultStart, defaultEnd] = parseHoursRange(pattern?.hours);
    const configs = parseJson(pattern?.dayConfigs, {});
    const dayConfig = configs?.[DAY_KEYS[today.getDay()]] || {};
    const locations = await this.prisma.workspaceLocation.findMany({
      where: { companyId, isActive: true },
      select: { id: true, name: true, latitude: true, longitude: true, radiusMeters: true, type: true },
    });
    return {
      employeeId: ownId,
      hasClockedIn: !!record?.checkIn,
      hasClockedOut: !!record?.checkOut,
      attendanceId: record?.id ?? null,
      checkIn: record?.checkIn ?? null,
      checkOut: record?.checkOut ?? null,
      scheduledClockInTime: pickTime(dayConfig.start, dayConfig.startTime, defaultStart) || defaultStart,
      scheduledClockOutTime: pickTime(dayConfig.end, dayConfig.endTime, defaultEnd) || defaultEnd,
      geofenceRequired: locations.some((l) => l.latitude != null && l.longitude != null),
      locations,
    };
  }

  /** Paginated attendance history with a range summary (self-service). */
  async getTimeHistory(
    userId: string,
    employeeId?: string,
    opts: { year?: number; page?: number; limit?: number; startDate?: string; endDate?: string } = {},
  ) {
    const { employeeId: ownId } = await this.resolveEmployee(userId);
    if (employeeId && employeeId !== ownId) {
      throw new ForbiddenException('You can only view your own attendance history');
    }
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts.limit ?? 25));

    let start: Date;
    let end: Date;
    if (opts.startDate && opts.endDate) {
      start = new Date(opts.startDate);
      end = new Date(opts.endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const y = opts.year ?? new Date().getFullYear();
      start = new Date(y, 0, 1);
      end = new Date(y, 11, 31, 23, 59, 59);
    }

    const where = { employeeId: ownId, date: { gte: start, lte: end } };
    const [rangeRows, records] = await this.prisma.$transaction([
      this.prisma.attendance.findMany({
        where,
        select: { status: true, workMinutes: true, overtime: true },
      }),
      this.prisma.attendance.findMany({
        where,
        include: { shift: { select: { name: true, startTime: true, endTime: true } } },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const total = rangeRows.length;
    return {
      meta: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
      summary: this.summarise(rangeRows),
      records,
    };
  }

  private summarise(rows: Array<{ status: string; workMinutes: number | null; overtime: number }>) {
    const count = (s: string) => rows.filter((r) => r.status === s).length;
    return {
      totalDays: rows.length,
      present: count('PRESENT'),
      late: count('LATE'),
      absent: count('ABSENT'),
      onLeave: count('ON_LEAVE'),
      halfDay: count('HALF_DAY'),
      totalWorkMinutes: rows.reduce((a, r) => a + (r.workMinutes ?? 0), 0),
      totalOvertime: rows.reduce((a, r) => a + (r.overtime ?? 0), 0),
    };
  }

  /** Manager team attendance report aggregated over a date range. */
  async getReportSummary(
    userId: string,
    dto: { startDate?: string; endDate?: string; departmentId?: string; userIds?: string[] } = {},
  ) {
    const { employeeId, companyId } = await this.resolveEmployee(userId);
    const now = new Date();
    const start = dto.startDate ? new Date(dto.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = dto.endDate ? new Date(dto.endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    let empIds: string[];
    if (dto.userIds?.length) {
      empIds = dto.userIds;
    } else {
      const reports = await this.prisma.employee.findMany({
        where: { managerId: employeeId, ...(dto.departmentId ? { departmentId: dto.departmentId } : {}) },
        select: { id: true },
      });
      empIds = reports.map((r) => r.id);
    }

    const where = { companyId, employeeId: { in: empIds }, date: { gte: start, lte: end } };
    const rows = await this.prisma.attendance.findMany({
      where,
      select: { status: true, workMinutes: true, overtime: true },
    });
    const s = this.summarise(rows);
    const onTimeOrLate = s.present + s.late;

    return {
      period: { startDate: start, endDate: end },
      employees: empIds.length,
      summary: {
        totalRecords: s.totalDays,
        present: s.present,
        late: s.late,
        absent: s.absent,
        onLeave: s.onLeave,
        halfDay: s.halfDay,
        totalWorkMinutes: s.totalWorkMinutes,
        totalOvertime: s.totalOvertime,
        attendanceRate: s.totalDays ? Math.round((onTimeOrLate / s.totalDays) * 100) : 0,
      },
    };
  }

  private determineStatus(checkInTime: Date, shiftStart?: string): string {
    if (!shiftStart) return 'PRESENT';
    const [h, m] = shiftStart.split(':').map(Number);
    const shiftStartMs = h * 60 + m;
    const checkinMs = checkInTime.getHours() * 60 + checkInTime.getMinutes();
    const diff = checkinMs - shiftStartMs;
    if (diff > 15) return 'LATE';
    return 'PRESENT';
  }

  private computeLateMinutes(checkInTime: Date, shiftStart?: string): number {
    if (!shiftStart) return 0;
    const [h, m] = shiftStart.split(':').map(Number);
    const late = checkInTime.getHours() * 60 + checkInTime.getMinutes() - (h * 60 + m);
    return Math.max(0, late);
  }
}

export interface ClockInDto {
  latitude?: number;
  longitude?: number;
  source?: string;
  notes?: string;
  /** Present in the portal payload; ignored — the caller acts on themselves. */
  employeeId?: string;
}

export interface ClockOutDto {
  latitude?: number;
  longitude?: number;
  notes?: string;
}
