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
  create(@Body() body: any) {
    // Suporta payload em snake_case vindo do front (schedule, location, is_active)
    const hasSnakeCase =
      typeof body === 'object' &&
      body !== null &&
      (Object.prototype.hasOwnProperty.call(body, 'is_active') ||
        Object.prototype.hasOwnProperty.call(body, 'schedule') ||
        Object.prototype.hasOwnProperty.call(body, 'location'));

    let dto: CreateWorkshopDto;
    if (hasSnakeCase) {
      // Concatena schedule/location na descrição para não perder informação
      const baseDesc: string = body.description || '';
      const extraLines: string[] = [];
      if (body.schedule) extraLines.push(`Horário: ${String(body.schedule)}`);
      if (body.location) extraLines.push(`Local: ${String(body.location)}`);
      const description = [baseDesc, ...extraLines].filter(Boolean).join('\n');

      dto = {
        name: body.name,
        description: description || undefined,
        isActive:
          Object.prototype.hasOwnProperty.call(body, 'is_active')
            ? Boolean(body.is_active)
            : undefined,
        // Os demais campos (weekday/startTime/endTime/capacity) podem ser enviados já em camelCase, se existirem
        ...(Object.prototype.hasOwnProperty.call(body, 'weekday')
          ? { weekday: body.weekday }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'startTime')
          ? { startTime: body.startTime }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'endTime')
          ? { endTime: body.endTime }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'capacity')
          ? { capacity: body.capacity }
          : {}),
      } as CreateWorkshopDto;
    } else {
      dto = body as CreateWorkshopDto;
    }

    return this.workshopsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar oficina' })
  update(@Param('id') id: string, @Body() body: any) {
    const hasSnakeCase =
      typeof body === 'object' &&
      body !== null &&
      (Object.prototype.hasOwnProperty.call(body, 'is_active') ||
        Object.prototype.hasOwnProperty.call(body, 'schedule') ||
        Object.prototype.hasOwnProperty.call(body, 'location'));

    let dto: UpdateWorkshopDto;
    if (hasSnakeCase) {
      const baseDesc: string | undefined = body.description;
      const extraLines: string[] = [];
      if (Object.prototype.hasOwnProperty.call(body, 'schedule')) {
        const val = body.schedule;
        if (val) extraLines.push(`Horário: ${String(val)}`);
        else extraLines.push('');
      }
      if (Object.prototype.hasOwnProperty.call(body, 'location')) {
        const val = body.location;
        if (val) extraLines.push(`Local: ${String(val)}`);
        else extraLines.push('');
      }
      const description =
        baseDesc !== undefined || extraLines.some((l) => l !== '')
          ? [baseDesc || '', ...extraLines.filter(Boolean)].filter(Boolean).join('\n') || undefined
          : undefined;

      dto = {
        ...(Object.prototype.hasOwnProperty.call(body, 'name')
          ? { name: body.name }
          : {}),
        ...(description !== undefined ? { description } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'is_active')
          ? { isActive: Boolean(body.is_active) } as any
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'weekday')
          ? { weekday: body.weekday }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'startTime')
          ? { startTime: body.startTime }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'endTime')
          ? { endTime: body.endTime }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(body, 'capacity')
          ? { capacity: body.capacity }
          : {}),
      } as UpdateWorkshopDto;
    } else {
      dto = body as UpdateWorkshopDto;
    }

    return this.workshopsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover oficina' })
  remove(@Param('id') id: string) {
    return this.workshopsService.remove(id);
  }
}
