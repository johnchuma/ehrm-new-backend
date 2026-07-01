import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CtcController } from './ctc.controller';
import { CtcService } from './ctc.service';

@Module({
  imports: [AuthModule],
  controllers: [CtcController],
  providers: [CtcService],
  exports: [CtcService],
})
export class CtcModule {}