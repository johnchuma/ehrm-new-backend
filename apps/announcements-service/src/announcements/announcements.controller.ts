import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AnnouncementService } from './announcements.service';

@Controller()
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @GrpcMethod('AnnouncementService', 'CreateAnnouncement')
  create(data: any) { return this.service.create(data); }

  @GrpcMethod('AnnouncementService', 'GetAnnouncement')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('AnnouncementService', 'UpdateAnnouncement')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('AnnouncementService', 'DeleteAnnouncement')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('AnnouncementService', 'ListAnnouncements')
  list(data: { companyId: string; type?: string; priority?: string }) { return this.service.list(data.companyId, data); }
}
