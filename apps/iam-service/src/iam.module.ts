import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { IamAuthService } from './auth/auth.service';
import { UserService } from './users/users.service';
import { RoleService } from './roles/roles.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [IamAuthService, UserService, RoleService],
  exports: [IamAuthService, UserService, RoleService],
})
export class IamModule {}
