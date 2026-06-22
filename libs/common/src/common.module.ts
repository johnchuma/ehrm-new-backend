import { Module, Global } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

@Global()
@Module({
  imports: [AuthModule],
  providers: [AllExceptionsFilter],
  exports: [AuthModule, AllExceptionsFilter],
})
export class CommonModule {}
