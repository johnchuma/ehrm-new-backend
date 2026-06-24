import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AssetService } from './assets/assets.service';
import { AssignmentService } from './assignments/assignments.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [AssetService, AssignmentService],
  exports: [AssetService, AssignmentService],
})
export class AssetsModule {}
