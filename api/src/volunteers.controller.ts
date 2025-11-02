import { Body, Controller, Get, Param, Post, Put, UseGuards, BadRequestException, Query, Delete, NotFoundException } from '@nestjs/common';
import type { VolunteerEntity } from './data.store';
import { DataStoreService } from './data.store';
import { JwtAuthGuard } from './jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly store: DataStoreService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('status') status?: 'active' | 'inactive',
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const p = page ? Math.max(1, Number(page) || 1) : 1;
    const l = limit ? Math.max(1, Number(limit) || 20) : 20;
    const res = this.store.listVolunteers({ q: q ?? undefined, status: status ?? undefined, page: p, limit: l });
    return res;
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    const v = this.store.getVolunteer(id);
    if (!v) throw new NotFoundException('Volunteer not found');
    return v;
  }

  @Post()
  create(@Body() body: any): VolunteerEntity {
    if (!body?.full_name || !body?.entry_date) {
      throw new BadRequestException('full_name and entry_date are required');
    }
    const payload: Omit<VolunteerEntity, 'id' | 'created_at'> = {
      full_name: body.full_name,
      email: body.email ?? null,
      phone: body.phone ?? null,
      cpf: body.cpf ?? null,
      birth_date: body.birth_date ?? null,
      entry_date: body.entry_date,
      exit_date: body.exit_date ?? null,
      is_active: body.is_active ?? true,
      address: body.address ?? null,
      city: body.city ?? null,
      state: body.state ?? null,
      zip_code: body.zip_code ?? null,
      emergency_contact: body.emergency_contact ?? null,
      emergency_phone: body.emergency_phone ?? null,
      notes: body.notes ?? null,
    };
    return this.store.createVolunteer(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<VolunteerEntity>) {
    const updated = this.store.updateVolunteer(id, body);
    if (!updated) throw new BadRequestException('Volunteer not found');
    return updated;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.store.deleteVolunteer(id);
    if (!ok) throw new BadRequestException('Volunteer not found');
    return { success: true };
  }
}
