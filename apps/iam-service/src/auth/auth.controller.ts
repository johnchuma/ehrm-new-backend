import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { IamAuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: IamAuthService) {}

  @GrpcMethod('AuthService', 'Login')
  async login(data: { email: string; password: string; companyId: string }) {
    return this.authService.loginWithEmail(data.email, data.password);
  }

  @GrpcMethod('AuthService', 'LoginWithPhone')
  async loginWithPhone(data: { phone: string; password: string; companyId: string }) {
    return this.authService.loginWithPhone(data.phone, data.password);
  }

  @GrpcMethod('AuthService', 'Register')
  async register(data: { email: string; phone: string; password: string; firstName: string; lastName: string; companyId: string }) {
    return this.authService.register(data);
  }

  @GrpcMethod('AuthService', 'ValidateToken')
  async validateToken(data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @GrpcMethod('AuthService', 'RefreshToken')
  async refreshToken(data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @GrpcMethod('AuthService', 'ForgotPassword')
  async forgotPassword(data: { email: string; companyId: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @GrpcMethod('AuthService', 'ResetPassword')
  async resetPassword(data: { token: string; newPassword: string }) {
    return this.authService.resetPassword(data.token, data.newPassword);
  }

  @GrpcMethod('AuthService', 'ChangePassword')
  async changePassword(data: { userId: string; oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(data.userId, data.oldPassword, data.newPassword);
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { userId: string }) {
    return this.authService.logout(data.userId);
  }
}
