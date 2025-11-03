import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'joao@example.com', description: 'E-mail único do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string; // senha em plain text, será hashada no service

  @ApiPropertyOptional({ example: false, description: 'Se verdadeiro, o usuário tem privilégios de super admin' })
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
