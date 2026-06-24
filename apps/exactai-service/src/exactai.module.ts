import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AIService } from './ai/ai.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [AIService],
  exports: [AIService],
})
export class ExactAIModule {}
