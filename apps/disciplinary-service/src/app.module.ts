import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { CaseController } from './cases/cases.controller';
import { ActionController } from './actions/actions.controller';
import { CaseService } from './cases/cases.service';
import { ActionService } from './actions/actions.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('disciplinary')],
  controllers: [CaseController, ActionController],
  providers: [CaseService, ActionService],
})
export class AppModule {}
