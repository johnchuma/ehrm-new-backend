import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ReviewService } from './reviews.service';

@Controller()
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @GrpcMethod('ReviewService', 'CreateReview')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('ReviewService', 'GetReview')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('ReviewService', 'UpdateReview')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('ReviewService', 'SubmitReview')
  submit(data: { id: string }) { return this.service.submit(data.id); }

  @GrpcMethod('ReviewService', 'ListReviews')
  list(data: { companyId: string; employeeId?: string; status?: string }) { return this.service.list(data.companyId, data); }
}
