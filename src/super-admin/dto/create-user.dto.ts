import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

/**
 * Generic "create any kind of user" payload used by the super-admin endpoint.
 * `role` is a free-form role *name* (e.g. "Employee", "Company Admin",
 * "System Administrator", or any custom company role). The service resolves it
 * to a Role record and links it via UserRole, mirroring how the rest of the
 * system provisions users (see SuperAdminService.createCompany / createSuperAdmin).
 */
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description:
      'Role name to assign. Defaults to "Employee". Use "System Administrator" for a platform super admin (companyId is ignored for super admins).',
  })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({
    description: 'Owning company. Required for every non super-admin user.',
  })
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Password (min 8 chars). Defaults to DEFAULT_USER_PASSWORD / ChangeMe@2026! if omitted.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Mark the email as already verified.', default: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Send a welcome email with login credentials and a confirmation link.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  sendWelcomeEmail?: boolean;
}
