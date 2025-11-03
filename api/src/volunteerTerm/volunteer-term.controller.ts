import {
  Controller,
  Post,
  Param,
  Get,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { VolunteerTermsService } from './volunteer-term.service';
import type { Response } from 'express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Volunteer Terms')
@Controller('volunteers/:id/terms')
export class VolunteerTermsController {
  constructor(private readonly service: VolunteerTermsService) {}

  @Post()
  async generate(@Param('id') id: string) {
    return this.service.generateAndSave(id);
  }

  @Get('latest/download')
  async downloadLatest(@Param('id') id: string, @Res() res: Response) {
    const term = await this.service.getLatestByVolunteer(id);
    if (!term || !fs.existsSync(term.filePath))
      throw new NotFoundException('Termo não encontrado');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="term-latest.pdf"',
    );
    fs.createReadStream(term.filePath).pipe(res);
  }
}
