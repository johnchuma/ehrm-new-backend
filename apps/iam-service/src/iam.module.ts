import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule, prismaToken, PRISMA_CLIENT } from '../../../libs/common/src/prisma/prisma.module';
import { IamAuthService } from './auth/auth.service';
import { UserService } from './users/users.service';
import { RoleService } from './roles/roles.service';

const SERVICE_NAME = 'iam';

@Module({
  imports: [CommonModule, PrismaModule.forServices(SERVICE_NAME)],
  providers: [
    {
      provide: PRISMA_CLIENT,
      useFactory: (client: any) => client,
      inject: [prismaToken(SERVICE_NAME)],
    },
    IamAuthService,
    UserService,
    RoleService,
  ],
  exports: [IamAuthService, UserService, RoleService],
})
export class IamModule {}
