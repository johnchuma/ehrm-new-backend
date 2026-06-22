import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DocumentService } from './documents.service';

@Controller()
export class DocumentController {
  constructor(private readonly service: DocumentService) {}

  @GrpcMethod('DocumentService', 'UploadDocument')
  upload(data: any) { return this.service.uploadDocument(data); }

  @GrpcMethod('DocumentService', 'GetDocument')
  get(data: { id: string }) { return this.service.getDocument(data.id); }

  @GrpcMethod('DocumentService', 'DeleteDocument')
  remove(data: { id: string }) { return this.service.deleteDocument(data.id); }

  @GrpcMethod('DocumentService', 'ListDocuments')
  list(data: { employeeId: string }) { return this.service.listDocuments(data.employeeId); }
}
