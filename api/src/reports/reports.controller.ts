import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('volunteers/active-count')
  activeVolunteers() {
    return this.service.activeVolunteersCount();
  }

  @Get('workshops/:id/participants-count')
  workshopParticipants(@Param('id') id: string) {
    return this.service.workshopParticipantsCount(id);
  }

  @Get('workshops/active-count')
  activeWorkshops() {
    return this.service.activeWorkshopsCount();
  }
}
