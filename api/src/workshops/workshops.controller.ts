import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiOperation } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Workshops')
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly workshopsService: WorkshopsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar oficinas' })
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: 'active' | 'inactive',
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.workshopsService.findAll(
      q,
      status,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter oficina por ID' })
  findOne(@Param('id') id: string) {
    return this.workshopsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar oficina' })
  create(@Body() dto: CreateWorkshopDto) {
    return this.workshopsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar oficina' })
  update(@Param('id') id: string, @Body() dto: UpdateWorkshopDto) {
    return this.workshopsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover oficina' })
  remove(@Param('id') id: string) {
    return this.workshopsService.remove(id);
  }
}
