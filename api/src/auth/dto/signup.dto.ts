import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MinhaSenha123', description: 'Mínimo 6 caracteres' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Nome completo' })
  @IsString()
  full_name: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  isSuperAdmin?: boolean;
}
