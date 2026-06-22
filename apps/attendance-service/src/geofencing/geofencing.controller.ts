import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GeofenceService } from './geofencing.service';

@Controller()
export class GeofenceController {
  constructor(private readonly service: GeofenceService) {}

  @GrpcMethod('GeofenceService', 'CreateGeofence')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('GeofenceService', 'UpdateGeofence')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('GeofenceService', 'ListGeofences')
  list(data: { companyId: string }) { return this.service.list(data.companyId); }
}
