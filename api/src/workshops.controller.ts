import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { WorkshopEntity } from './data.store';
import { DataStoreService } from './data.store';
import { JwtAuthGuard } from './jwt.guard';

// Create DTO para validação
interface CreateWorkshopDto {
  name: string;
  description?: string | null;
  schedule?: string | null;
  location?: string | null;
  is_active?: boolean;
}

@UseGuards(JwtAuthGuard)
@Controller('workshops')
export class WorkshopsController {
  constructor(private readonly store: DataStoreService) {}

  @Get()
  list(): WorkshopEntity[] {
    return this.store.listWorkshops();
  }

  @Post()
  create(@Body() body: CreateWorkshopDto): WorkshopEntity {
    if (!body.name || typeof body.name !== 'string') {
      throw new BadRequestException('Nome é obrigatório e deve ser uma string');
    }

    if (body.description !== undefined && body.description !== null && typeof body.description !== 'string') {
      throw new BadRequestException('Descrição deve ser uma string');
    }

    if (body.schedule !== undefined && body.schedule !== null && typeof body.schedule !== 'string') {
      throw new BadRequestException('Agenda deve ser uma string');
    }

    if (body.location !== undefined && body.location !== null && typeof body.location !== 'string') {
      throw new BadRequestException('Localização deve ser uma string');
    }

    if (body.is_active !== undefined && typeof body.is_active !== 'boolean') {
      throw new BadRequestException('is_active deve ser um booleano');
    }

    const payload: Omit<WorkshopEntity, 'id' | 'created_at'> = {
      name: body.name,
      description: body.description ?? null,
      schedule: body.schedule ?? null,
      location: body.location ?? null,
      is_active: body.is_active ?? true,
    };

    return this.store.createWorkshop(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<WorkshopEntity>) {
    const updated = this.store.updateWorkshop(id, body);
    if (!updated) throw new BadRequestException('Workshop not found');
    return updated;
  }
}