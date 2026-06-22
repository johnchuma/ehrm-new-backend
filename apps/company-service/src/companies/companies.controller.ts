import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CompanyService } from './companies.service';

@Controller()
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @GrpcMethod('CompanyService', 'CreateCompany')
  create(data: any) { return this.service.createCompany(data); }

  @GrpcMethod('CompanyService', 'GetCompany')
  get(data: { id: string }) { return this.service.getCompany(data.id); }

  @GrpcMethod('CompanyService', 'UpdateCompany')
  update(data: { id: string } & any) { return this.service.updateCompany(data.id, data); }

  @GrpcMethod('CompanyService', 'DeleteCompany')
  remove(data: { id: string }) { return this.service.deleteCompany(data.id); }

  @GrpcMethod('CompanyService', 'ListCompanies')
  list(data: { page?: number; pageSize?: number; search?: string; status?: string }) {
    return this.service.listCompanies(data.page || 1, data.pageSize || 20, data.search, data.status);
  }
}
