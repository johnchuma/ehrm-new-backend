import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { DocumentController } from './documents/documents.controller';
import { DocumentService } from './documents/documents.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('documents')],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class AppModule {}
