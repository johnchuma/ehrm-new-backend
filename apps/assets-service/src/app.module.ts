import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AssetController } from './assets/assets.controller';
import { AssignmentController } from './assignments/assignments.controller';
import { AssetService } from './assets/assets.service';
import { AssignmentService } from './assignments/assignments.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('assets')],
  controllers: [AssetController, AssignmentController],
  providers: [AssetService, AssignmentService],
})
export class AppModule {}
