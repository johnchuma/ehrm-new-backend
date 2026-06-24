import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { DocumentService } from './documents/documents.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentsModule {}
