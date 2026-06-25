import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acacia Group Ltd' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'info@acacia.co.tz' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'TZ123456789' })
  @IsOptional()
  @IsString()
  tin?: string;

  @ApiPropertyOptional({ example: 'Dar es Salaam' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Manufacturing' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ example: '201-500' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 'https://acacia.co.tz' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: 'admin@acacia.co.tz', description: 'Email for the company admin user' })
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  companyAdminEmail: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  adminFirstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  adminLastName?: string;

  @ApiPropertyOptional({ example: 'hr-professional', description: 'Plan slug' })
  @IsOptional()
  @IsString()
  planSlug?: string;

  @ApiPropertyOptional({ example: 'MONTHLY', enum: ['MONTHLY', 'ANNUAL'] })
  @IsOptional()
  @IsString()
  billingInterval?: string;

  @ApiPropertyOptional({ example: 'SaaS', enum: ['SaaS', 'OnPremise'] })
  @IsOptional()
  @IsString()
  workspaceType?: string;
}
