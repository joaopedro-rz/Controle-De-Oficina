import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsIn, MinLength } from 'class-validator';

export class CreateUsuarioPtDto {
  @ApiProperty({ example: 'José Pedro', description: 'Nome completo do usuário' })
  @IsString()
  nome: string;

  @ApiProperty({ example: 'jose@example.com', description: 'E-mail único do usuário' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Senha do usuário (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  senha: string;

  @ApiProperty({ example: 'ADMIN', description: 'Papel do usuário', enum: ['ADMIN', 'USER'], default: 'USER' })
  @IsString()
  @IsIn(['ADMIN', 'USER'])
  role: 'ADMIN' | 'USER';
}
