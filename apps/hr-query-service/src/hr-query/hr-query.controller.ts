import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HRQueryService } from './hr-query.service';

@Controller()
export class HRQueryController {
  constructor(private readonly service: HRQueryService) {}

  @GrpcMethod('HRQueryService', 'AskQuestion')
  ask(data: any) { return this.service.askQuestion(data); }

  @GrpcMethod('HRQueryService', 'GetFAQs')
  faqs(data: { companyId: string; category?: string }) { return this.service.getFAQs(data.companyId, data.category); }

  @GrpcMethod('HRQueryService', 'CreateFAQ')
  create(data: any) { return this.service.createFAQ(data); }
}
