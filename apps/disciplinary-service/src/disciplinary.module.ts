import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { CaseService } from './cases/cases.service';
import { ActionService } from './actions/actions.service';

const SERVICE_NAME = 'disciplinary';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    { provide: PRISMA_CLIENT, useFactory: (c: any) => c, inject: [prismaToken(SERVICE_NAME)] },
    CaseService, ActionService,
  ],
  exports: [CaseService, ActionService],
})
export class DisciplinaryModule {}
