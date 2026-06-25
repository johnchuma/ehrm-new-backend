import { Module } from '@nestjs/common';
import { MovementController } from './movement.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MovementController],
})
export class MovementModule {}
