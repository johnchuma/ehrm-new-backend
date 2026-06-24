import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { TransferService } from './transfers/transfers.service';
import { PromotionService } from './promotions/promotions.service';

const SERVICE_NAME = 'movement';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    TransferService, PromotionService,
  ],
  exports: [TransferService, PromotionService],
})
export class MovementModule {}
