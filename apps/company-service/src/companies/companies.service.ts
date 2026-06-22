import { Injectable, Inject } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../../../libs/common/src/prisma/prisma.module';
import { GrpcErrors } from '../../../../libs/common/src/decorators';

@Injectable()
export class CompanyService {
  constructor(@Inject(PRISMA_CLIENT) private readonly prisma: any) {}

  async createCompany(data: any) {
    const existing = await this.prisma.company.findUnique({ where: { slug: data.slug } });
    if (existing) throw GrpcErrors.ALREADY_EXISTS('Company with this slug already exists');

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

  async getCompany(id: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw GrpcErrors.NOT_FOUND('Company not found');
    return this.toCompanyResponse(company);
  }

  async updateCompany(id: string, data: any) {
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

  async deleteCompany(id: string) {
    await this.prisma.company.delete({ where: { id } });
    return { success: true, message: 'Company deleted successfully' };
  }

  async listCompanies(page: number = 1, pageSize: number = 20, search?: string, status?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { slug: { contains: search } },
      ];
    }
    if (status) where.status = status;

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

  private toCompanyResponse(c: any) {
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
}
