import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GRPC_SERVICES } from '../../../../libs/common/src/grpc/grpc.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  private service: any;

  constructor(@Inject(GRPC_SERVICES.DOCUMENTS) private readonly client: ClientGrpc) {}

  onModuleInit() { this.service = this.client.getService('DocumentService'); }

  @Post()
  @ApiBody({
    schema: {
      type: 'object',
      required: ['employeeId', 'companyId', 'title', 'type', 'fileUrl', 'mimeType'],
      properties: {
        employeeId: { type: 'string', example: 'emp-001' },
        companyId: { type: 'string', example: 'comp-001' },
        title: { type: 'string', example: 'National ID Copy' },
        description: { type: 'string', example: 'Scanned copy of national identity card' },
        type: { type: 'string', example: 'identification' },
        fileUrl: { type: 'string', example: 'https://storage.example.com/documents/emp-001/national-id.pdf' },
        fileSize: { type: 'number', example: 2048576 },
        mimeType: { type: 'string', example: 'application/pdf' },
      },
    },
  })
  upload(@Body() body: any) { return firstValueFrom(this.service.UploadDocument(body)); }

  @Get()
  list(@Query() query: any) { return firstValueFrom(this.service.ListDocuments(query)); }

  @Get(':id')
  get(@Param('id') id: string) { return firstValueFrom(this.service.GetDocument({ id })); }

  @Put(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated National ID Copy' },
        description: { type: 'string', example: 'Re-uploaded clearer scan of national identity card' },
        type: { type: 'string', example: 'identification' },
      },
    },
  })
  update(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.UpdateDocument({ id, ...body })); }

  @Delete(':id')
  remove(@Param('id') id: string) { return firstValueFrom(this.service.DeleteDocument({ id })); }

  @Post(':id/share')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sharedWith', 'permission'],
      properties: {
        sharedWith: { type: 'string', example: 'hr-director-001' },
        permission: { type: 'string', example: 'read-only' },
        expiresAt: { type: 'string', example: '2026-06-30' },
      },
    },
  })
  share(@Param('id') id: string, @Body() body: any) { return firstValueFrom(this.service.ShareDocument({ id, ...body })); }
}
