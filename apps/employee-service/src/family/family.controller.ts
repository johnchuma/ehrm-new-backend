import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FamilyService } from './family.service';

@Controller()
export class FamilyController {
  constructor(private readonly service: FamilyService) {}

  @GrpcMethod('FamilyService', 'AddFamilyMember')
  add(data: any) { return this.service.add(data); }

  @GrpcMethod('FamilyService', 'ListFamily')
  list(data: { employeeId: string }) { return this.service.list(data.employeeId); }
}
