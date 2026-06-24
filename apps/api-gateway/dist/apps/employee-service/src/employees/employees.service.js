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
exports.EmployeeService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let EmployeeService = class EmployeeService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEmployee(data) {
        const employeeId = data.employeeId || `EMP${Date.now().toString().slice(-7)}`;
        const fullName = `${data.firstName} ${data.middleName || ''} ${data.lastName}`.trim().replace(/\s+/g, ' ');
        const employee = await this.prisma.employee.create({
            data: {
                companyId: data.companyId,
                employeeId,
                firstName: data.firstName,
                middleName: data.middleName,
                lastName: data.lastName,
                fullName,
                preferredName: data.preferredName,
                email: data.email?.toLowerCase(),
                phone: data.phone,
                altPhone: data.altPhone,
                personalEmail: data.personalEmail,
                gender: data.gender,
                dob: data.dob ? new Date(data.dob) : null,
                nationality: data.nationality,
                maritalStatus: data.maritalStatus,
                disabilityStatus: data.disabilityStatus,
                disabilityCategory: data.disabilityCategory,
                bloodGroup: data.bloodGroup,
                photo: data.photo,
                address: data.address,
                postalAddress: data.postalAddress,
                region: data.region,
                district: data.district,
                country: data.country || 'Tanzania',
                departmentId: data.departmentId,
                branchId: data.branchId,
                jobTitle: data.jobTitle,
                position: data.position,
                grade: data.grade,
                businessUnit: data.businessUnit,
                section: data.section,
                employmentType: data.employmentType || 'Permanent',
                recruitmentChannel: data.recruitmentChannel,
                modeOfPayment: data.modeOfPayment || 'Monthly',
                status: data.status || 'Active',
                managerId: data.managerId,
                dateJoined: new Date(data.dateJoined || Date.now()),
                confirmationDate: data.confirmationDate ? new Date(data.confirmationDate) : null,
                contractType: data.contractType,
                contractStartDate: data.contractStartDate ? new Date(data.contractStartDate) : null,
                contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,
                probationStartDate: data.probationStartDate ? new Date(data.probationStartDate) : null,
                probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : null,
                grossSalary: data.grossSalary || 0,
                salaryGrade: data.salaryGrade,
                salaryLevel: data.salaryLevel,
                costCentre: data.costCentre,
                payrollGroup: data.payrollGroup,
                socialSecurityType: data.socialSecurityType,
                socialSecurityNumber: data.socialSecurityNumber,
                tinNumber: data.tinNumber,
                nidaNumber: data.nidaNumber,
                passportNumber: data.passportNumber,
                bankName: data.bankName,
                bankBranch: data.bankBranch,
                bankAccount: data.bankAccount,
                bankAccountName: data.bankAccountName,
                mobileMoneyProvider: data.mobileMoneyProvider,
                mobileMoneyNumber: data.mobileMoneyNumber,
                technicalSkills: data.technicalSkills,
                functionalSkills: data.functionalSkills,
                softSkills: data.softSkills,
                languages: data.languages,
            },
        });
        return this.toEmployeeResponse(employee);
    }
    async getEmployee(id) {
        const emp = await this.prisma.employee.findUnique({
            where: { id },
            include: {
                documents: true,
                educations: true,
                qualifications: true,
                emergencyContacts: true,
                family: true,
            },
        });
        if (!emp)
            throw decorators_1.GrpcErrors.NOT_FOUND('Employee not found');
        return this.toEmployeeResponse(emp);
    }
    async getEmployeeProfile(id) {
        const emp = await this.getEmployee(id);
        return {
            employee: emp,
            documents: emp.documents || [],
            education: emp.educations || [],
            qualifications: emp.qualifications || [],
            emergencyContacts: emp.emergencyContacts || [],
            family: emp.family || [],
        };
    }
    async updateEmployee(id, data) {
        const updateData = { ...data };
        if (data.email)
            updateData.email = data.email.toLowerCase();
        if (data.dateJoined)
            updateData.dateJoined = new Date(data.dateJoined);
        if (data.dob)
            updateData.dob = new Date(data.dob);
        if (data.confirmationDate)
            updateData.confirmationDate = new Date(data.confirmationDate);
        delete updateData.id;
        delete updateData.employeeId;
        const emp = await this.prisma.employee.update({
            where: { id },
            data: updateData,
        });
        return this.toEmployeeResponse(emp);
    }
    async deleteEmployee(id) {
        await this.prisma.employee.delete({ where: { id } });
        return { success: true, message: 'Employee deleted' };
    }
    async listEmployees(companyId, filters = {}) {
        const where = { companyId };
        if (filters.departmentId)
            where.departmentId = filters.departmentId;
        if (filters.branchId)
            where.branchId = filters.branchId;
        if (filters.status)
            where.status = filters.status;
        if (filters.search) {
            where.OR = [
                { firstName: { contains: filters.search } },
                { lastName: { contains: filters.search } },
                { fullName: { contains: filters.search } },
                { email: { contains: filters.search } },
                { employeeId: { contains: filters.search } },
            ];
        }
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 20;
        const [employees, total] = await Promise.all([
            this.prisma.employee.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.employee.count({ where }),
        ]);
        return { employees: employees.map((e) => this.toEmployeeResponse(e)), total };
    }
    async advanceApproval(id) {
        const emp = await this.prisma.employee.findUnique({ where: { id } });
        if (!emp)
            throw decorators_1.GrpcErrors.NOT_FOUND('Employee not found');
        const stages = ['HR Officer', 'HR Manager', 'Department Manager', 'Authoriser'];
        const nextStage = Math.min(emp.approvalStage + 1, stages.length);
        const newStatus = nextStage >= stages.length ? 'Approved' : 'In Review';
        const updated = await this.prisma.employee.update({
            where: { id },
            data: { approvalStage: nextStage, approvalStatus: newStatus },
        });
        return this.toEmployeeResponse(updated);
    }
    async approveEmployee(id) {
        const emp = await this.prisma.employee.findUnique({ where: { id } });
        if (!emp)
            throw decorators_1.GrpcErrors.NOT_FOUND('Employee not found');
        const updated = await this.prisma.employee.update({
            where: { id },
            data: { approvalStage: 4, approvalStatus: 'Approved' },
        });
        return this.toEmployeeResponse(updated);
    }
    toEmployeeResponse(e) {
        return {
            id: e.id,
            companyId: e.companyId,
            employeeId: e.employeeId,
            firstName: e.firstName,
            middleName: e.middleName,
            lastName: e.lastName,
            fullName: e.fullName,
            preferredName: e.preferredName,
            email: e.email,
            phone: e.phone,
            gender: e.gender,
            dob: e.dob?.toISOString() || '',
            nationality: e.nationality,
            maritalStatus: e.maritalStatus,
            departmentId: e.departmentId,
            branchId: e.branchId,
            jobTitle: e.jobTitle,
            grade: e.grade,
            employmentType: e.employmentType,
            status: e.status,
            managerId: e.managerId,
            dateJoined: e.dateJoined?.toISOString() || '',
            grossSalary: e.grossSalary,
            leaveBalance: e.leaveBalance,
            approvalStage: e.approvalStage,
            approvalStatus: e.approvalStatus,
            photo: e.photo,
            createdAt: e.createdAt?.toISOString() || '',
            updatedAt: e.updatedAt?.toISOString() || '',
        };
    }
};
exports.EmployeeService = EmployeeService;
exports.EmployeeService = EmployeeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], EmployeeService);
//# sourceMappingURL=employees.service.js.map