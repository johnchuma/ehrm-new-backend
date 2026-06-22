import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { TransferController } from './transfers/transfers.controller';
import { PromotionController } from './promotions/promotions.controller';
import { TransferService } from './transfers/transfers.service';
import { PromotionService } from './promotions/promotions.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('movement')],
  controllers: [TransferController, PromotionController],
  providers: [TransferService, PromotionService],
})
export class AppModule {}
