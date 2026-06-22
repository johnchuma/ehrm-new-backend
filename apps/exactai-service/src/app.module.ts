import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AIController } from './ai/ai.controller';
import { AIService } from './ai/ai.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('exactai')],
  controllers: [AIController],
  providers: [AIService],
})
export class AppModule {}
