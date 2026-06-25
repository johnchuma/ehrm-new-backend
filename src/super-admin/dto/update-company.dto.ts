import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Acacia Group Ltd' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'info@acacia.co.tz' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

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

  @ApiPropertyOptional({ example: '#EA580C' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1E293B' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;
}

export class UpdateCompanyStatusDto {
  @ApiPropertyOptional({ example: 'SUSPENDED', enum: ['ACTIVE', 'SUSPENDED'] })
  @IsString()
  status: 'ACTIVE' | 'SUSPENDED';
}
