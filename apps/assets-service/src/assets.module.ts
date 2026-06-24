import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { AssetService } from './assets/assets.service';
import { AssignmentService } from './assignments/assignments.service';

const SERVICE_NAME = 'assets';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    AssetService, AssignmentService,
  ],
  exports: [AssetService, AssignmentService],
})
export class AssetsModule {}
