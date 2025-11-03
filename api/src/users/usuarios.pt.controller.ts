import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsuarioPtDto } from './dto/create-usuario-pt.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosPtController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nome: { type: 'string', example: 'José Pedro' },
        email: { type: 'string', example: 'jose@example.com' },
        senha: { type: 'string', example: '123456' },
        role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'ADMIN' },
      },
      required: ['nome', 'email', 'senha', 'role'],
    },
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  async createPt(@Body() dto: CreateUsuarioPtDto) {
    // mapeia para o DTO interno
    const isSuperAdmin = dto.role === 'ADMIN';
    return this.usersService.create({
      name: dto.nome,
      email: dto.email,
      password: dto.senha,
      isSuperAdmin,
    });
  }
}
