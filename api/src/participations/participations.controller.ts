import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ParticipationsService } from './participations.service';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Participations')
@Controller('participations')
export class ParticipationsController {
  constructor(private readonly service: ParticipationsService) {}

  @Get()
  list(
    @Query('workshopId') workshopId?: string,
    @Query('volunteerId') volunteerId?: string,
  ) {
    return this.service.list({ workshopId, volunteerId });
  }

  @Get('volunteer/:id')
  listByVolunteer(@Param('id') id: string) {
    return this.service.listByVolunteer(id);
  }

  @Post()
  create(@Body() dto: CreateParticipationDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Participações')
@Controller('participacoes')
export class ParticipacoesPtController {
  constructor(private readonly service: ParticipationsService) {}

  @Get(':id')
  listByVolunteerPt(@Param('id') id: string) {
    return this.service.listByVolunteer(id);
  }
}
