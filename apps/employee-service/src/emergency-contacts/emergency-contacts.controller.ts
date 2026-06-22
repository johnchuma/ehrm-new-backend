import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { EmergencyContactService } from './emergency-contacts.service';

@Controller()
export class EmergencyContactController {
  constructor(private readonly service: EmergencyContactService) {}

  @GrpcMethod('EmergencyContactService', 'AddEmergencyContact')
  add(data: any) { return this.service.add(data); }

  @GrpcMethod('EmergencyContactService', 'ListEmergencyContacts')
  list(data: { employeeId: string }) { return this.service.list(data.employeeId); }
}
