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
exports.CompanyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../../../libs/common/src/prisma/prisma.module");
const decorators_1 = require("../../../../libs/common/src/decorators");
let CompanyService = class CompanyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCompany(data) {
        const existing = await this.prisma.company.findUnique({ where: { slug: data.slug } });
        if (existing)
            throw decorators_1.GrpcErrors.ALREADY_EXISTS('Company with this slug already exists');
        const company = await this.prisma.company.create({
            data: {
                name: data.name,
                slug: data.slug,
                email: data.email,
                phone: data.phone,
                address: data.address,
                country: data.country || 'Tanzania',
                currency: data.currency || 'TZS',
                timezone: data.timezone || 'Africa/Dar_es_Salaam',
                logo: data.logo,
                subscriptionPlan: data.subscriptionPlan || 'FREE',
                industry: data.industry,
                size: data.size,
                website: data.website,
                taxId: data.taxId,
                registrationNumber: data.registrationNumber,
            },
        });
        await this.prisma.companySettings.create({
            data: { companyId: company.id },
        });
        return this.toCompanyResponse(company);
    }
    async getCompany(id) {
        const company = await this.prisma.company.findUnique({ where: { id } });
        if (!company)
            throw decorators_1.GrpcErrors.NOT_FOUND('Company not found');
        return this.toCompanyResponse(company);
    }
    async updateCompany(id, data) {
        const company = await this.prisma.company.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                logo: data.logo,
                industry: data.industry,
                size: data.size,
                website: data.website,
                taxId: data.taxId,
                registrationNumber: data.registrationNumber,
                status: data.status,
            },
        });
        return this.toCompanyResponse(company);
    }
    async deleteCompany(id) {
        await this.prisma.company.delete({ where: { id } });
        return { success: true, message: 'Company deleted successfully' };
    }
    async listCompanies(page = 1, pageSize = 20, search, status) {
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { slug: { contains: search } },
            ];
        }
        if (status)
            where.status = status;
        const [companies, total] = await Promise.all([
            this.prisma.company.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.company.count({ where }),
        ]);
        return { companies: companies.map((c) => this.toCompanyResponse(c)), total };
    }
    toCompanyResponse(c) {
        return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            email: c.email,
            phone: c.phone,
            address: c.address,
            country: c.country,
            currency: c.currency,
            timezone: c.timezone,
            logo: c.logo,
            subscriptionPlan: c.subscriptionPlan,
            industry: c.industry,
            size: c.size,
            website: c.website,
            taxId: c.taxId,
            registrationNumber: c.registrationNumber,
            status: c.status,
            createdAt: c.createdAt?.toISOString() || '',
            updatedAt: c.updatedAt?.toISOString() || '',
        };
    }
};
exports.CompanyService = CompanyService;
exports.CompanyService = CompanyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_module_1.PRISMA_CLIENT)),
    __metadata("design:paramtypes", [Object])
], CompanyService);
//# sourceMappingURL=companies.service.js.map