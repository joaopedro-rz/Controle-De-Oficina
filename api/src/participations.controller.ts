import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import type { ParticipationEntity } from './data.store';
import { DataStoreService } from './data.store';
import { JwtAuthGuard } from './jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly store: DataStoreService) {}

  @Get()
  list(
    @Query('workshopId') workshopId?: string,
    @Query('volunteerId') volunteerId?: string,
  ): ParticipationEntity[] {
    return this.store.listParticipations({ workshopId, volunteerId });
  }

  @Get('volunteer/:id')
  listByVolunteer(@Param('id') id: string): ParticipationEntity[] {
    const items = this.store.listParticipations({ volunteerId: id });
    return [...items].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da; // desc
    });
  }

  @Post()
  create(@Body() body: any): ParticipationEntity {
    if (!body?.volunteer_id || !body?.workshop_id) {
      throw new BadRequestException('volunteer_id and workshop_id are required');
    }
    if (!this.store.getVolunteer(body.volunteer_id)) {
      throw new BadRequestException('Volunteer not found');
    }
    if (!this.store.getWorkshop(body.workshop_id)) {
      throw new BadRequestException('Workshop not found');
    }
    const result = this.store.createParticipation({
      volunteer_id: body.volunteer_id,
      workshop_id: body.workshop_id,
      date: body.date ?? null,
      role: body.role ?? null,
      hours: body.hours ?? null,
      notes: body.notes ?? null,
    });
    if ((result as any).error) throw new BadRequestException((result as any).error);
    return result as ParticipationEntity;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.store.deleteParticipation(id);
    if (!ok) throw new BadRequestException('Participation not found');
    return { success: true };
  }
}

@UseGuards(JwtAuthGuard)
@Controller('participacoes')
export class ParticipacoesPtController {
  constructor(private readonly store: DataStoreService) {}

  @Get(':id')
  listByVolunteerPt(@Param('id') id: string): ParticipationEntity[] {
    const items = this.store.listParticipations({ volunteerId: id });
    return [...items].sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da; // desc
    });
  }
}
