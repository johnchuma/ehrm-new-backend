import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'exactonlinesoftware@gmail.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ required: false })
  companyId?: string;
}
