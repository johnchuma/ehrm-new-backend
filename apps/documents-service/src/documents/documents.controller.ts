import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DocumentService } from './documents.service';

@Controller()
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @GrpcMethod('DocumentService', 'UploadDocument')
  upload(data: any) { return this.service.upload(data); }

  @GrpcMethod('DocumentService', 'GetDocument')
  get(data: { id: string }) { return this.service.get(data.id); }

  @GrpcMethod('DocumentService', 'UpdateDocument')
  update(data: { id: string } & any) { return this.service.update(data.id, data); }

  @GrpcMethod('DocumentService', 'DeleteDocument')
  remove(data: { id: string }) { return this.service.delete(data.id); }

  @GrpcMethod('DocumentService', 'ListDocuments')
  list(data: { companyId: string; employeeId?: string; category?: string; type?: string }) {
    return this.service.list(data.companyId, data);
  }

  @GrpcMethod('DocumentService', 'ShareDocument')
  share(data: { id: string; userIds: string[]; expiresAt?: string }) {
    return this.service.share(data.id, data.userIds, data.expiresAt);
  }
}
