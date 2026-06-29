import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'hr-professional' })
  @IsString()
  @IsNotEmpty()
  planSlug: string;

  @ApiProperty({ enum: ['MONTHLY', 'ANNUAL'], example: 'MONTHLY' })
  @IsIn(['MONTHLY', 'ANNUAL'])
  billingInterval: string;

  @ApiProperty({ description: 'URL to redirect after payment (frontend success/failure page)' })
  @IsString()
  @IsNotEmpty()
  callbackUrl: string;

  @ApiPropertyOptional({ description: 'Company admin email (for receipt)' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customerName?: string;
}
