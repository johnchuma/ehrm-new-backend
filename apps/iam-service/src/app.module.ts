import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { AuthController } from './auth/auth.controller';
import { UserController } from './users/users.controller';
import { RoleController } from './roles/roles.controller';
import { IamAuthService } from './auth/auth.service';
import { UserService } from './users/users.service';
import { RoleService } from './roles/roles.service';

@Module({
  imports: [
    CommonModule,
    PrismaModule.forRoot('iam'),
  ],
  controllers: [AuthController, UserController, RoleController],
  providers: [IamAuthService, UserService, RoleService],
})
export class AppModule {}
