import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AIService } from './ai.service';

@Controller()
export class AIController {
  constructor(private readonly service: AIService) {}

  @GrpcMethod('AIService', 'Chat')
  chat(data: any) { return this.service.chat(data); }

  @GrpcMethod('AIService', 'SummarizeEmployee')
  summarize(data: { employeeId: string }) { return this.service.summarizeEmployee(data.employeeId); }

  @GrpcMethod('AIService', 'GetInsights')
  insights(data: { companyId: string; type: string }) { return this.service.getInsights(data.companyId, data.type); }

  @GrpcMethod('AIService', 'PredictAttrition')
  predict(data: { companyId: string; departmentId?: string }) { return this.service.predictAttrition(data.companyId, data.departmentId); }

  @GrpcMethod('AIService', 'RecommendActions')
  recommend(data: { companyId: string; type: string; context?: string }) { return this.service.recommendActions(data.companyId, data.type); }
}
