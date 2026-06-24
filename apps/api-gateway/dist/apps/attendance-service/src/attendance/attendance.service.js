"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async checkIn(data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await this.prisma.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId: data.employeeId, date: today } },
        });
        if (existing && existing.checkIn) {
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('Already checked in today');
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
    async checkOut(data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const record = await this.prisma.attendanceRecord.findUnique({
            where: { employeeId_date: { employeeId: data.employeeId, date: today } },
        });
        if (!record || !record.checkIn) {
            throw decorators_1.GrpcErrors.NOT_FOUND('No check-in found for today');
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
    async getRecord(id) {
        const r = await this.prisma.attendanceRecord.findUnique({ where: { id } });
        if (!r)
            throw decorators_1.GrpcErrors.NOT_FOUND('Record not found');
        return this.toResponse(r);
    }
    async listRecords(companyId, filters = {}) {
        const where = { companyId };
        if (filters.employeeId)
            where.employeeId = filters.employeeId;
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
    async getTodayAttendance(companyId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const records = await this.prisma.attendanceRecord.findMany({
            where: { companyId, date: today },
        });
        return { records: records.map((r) => this.toResponse(r)), total: records.length };
    }
    async bulkMark(data) {
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
    toResponse(r) {
        return {
            id: r.id, employeeId: r.employeeId, companyId: r.companyId,
            date: r.date?.toISOString() || '',
            checkIn: r.checkIn?.toISOString() || '',
            checkOut: r.checkOut?.toISOString() || '',
            hours: r.hours, method: r.method, status: r.status,
            lat: r.lat, lng: r.lng,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map