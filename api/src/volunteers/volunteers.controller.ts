import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Res,
} from '@nestjs/common';
import { VolunteersService } from './volunteers.service';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Volunteers')
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly volunteersService: VolunteersService) {}

  @Get()
  findAll(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.volunteersService.findAll(
      q,
      status,
      Number(page),
      Number(limit),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.volunteersService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    // Suporte a payload em snake_case vindo do front (web)
    // Caso detecte chaves snake_case, mapeia para o DTO esperado em camelCase
    const hasSnakeCase =
      typeof body === 'object' &&
      body !== null &&
      (Object.prototype.hasOwnProperty.call(body, 'full_name') ||
        Object.prototype.hasOwnProperty.call(body, 'entry_date'));

    let dto: CreateVolunteerDto;

    if (hasSnakeCase) {
      const fullName: string = (body.full_name ?? '').toString();
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts.length > 0 ? parts[0] : '';
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

      dto = {
        firstName,
        lastName,
        fullName: fullName,
        email: body.email || undefined,
        phone: body.phone || undefined,
        cpf: body.cpf || undefined,
        birthDate: body.birth_date || undefined,
        address: body.address || undefined,
        startDate: body.entry_date,
        endDate: body.exit_date || undefined,
        status:
          body.is_active === false
            ? VolunteerStatus.INACTIVE
            : VolunteerStatus.ACTIVE,
        emergencyContactName: body.emergency_contact || undefined,
        emergencyContactPhone: body.emergency_phone || undefined,
        notes: body.notes || undefined,
      } as CreateVolunteerDto;
    } else {
      // Assume já está no formato camelCase esperado
      dto = body as CreateVolunteerDto;
    }

    return this.volunteersService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const hasSnakeCase =
      typeof body === 'object' &&
      body !== null &&
      (Object.prototype.hasOwnProperty.call(body, 'full_name') ||
        Object.prototype.hasOwnProperty.call(body, 'entry_date'));

    let dto: UpdateVolunteerDto;
    if (hasSnakeCase) {
      const fullName: string | undefined = body.full_name;
      const parts = (fullName ?? '').trim().split(/\s+/);
      const firstName = fullName ? (parts.length > 0 ? parts[0] : '') : undefined;
      const lastName = fullName ? (parts.length > 1 ? parts.slice(1).join(' ') : '') : undefined;

      dto = {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(fullName !== undefined ? { fullName } : {}),
        ...(body.email !== undefined ? { email: body.email || undefined } : {}),
        ...(body.phone !== undefined ? { phone: body.phone || undefined } : {}),
        ...(body.cpf !== undefined ? { cpf: body.cpf || undefined } : {}),
        ...(body.birth_date !== undefined ? { birthDate: body.birth_date || undefined } : {}),
        ...(body.address !== undefined ? { address: body.address || undefined } : {}),
        ...(body.entry_date !== undefined ? { startDate: body.entry_date } : {}),
        ...(body.exit_date !== undefined ? { endDate: body.exit_date || undefined } : {}),
        ...(body.is_active !== undefined
          ? {
              status:
                body.is_active === false
                  ? VolunteerStatus.INACTIVE
                  : VolunteerStatus.ACTIVE,
            }
          : {}),
        ...(body.emergency_contact !== undefined
          ? { emergencyContactName: body.emergency_contact || undefined }
          : {}),
        ...(body.emergency_phone !== undefined
          ? { emergencyContactPhone: body.emergency_phone || undefined }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes || undefined } : {}),
      } as UpdateVolunteerDto;
    } else {
      dto = body as UpdateVolunteerDto;
    }

    return this.volunteersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.volunteersService.remove(id);
  }

  // ---------------- PDF TERM -----------------
  @Get(':id/term')
  async generateTerm(@Param('id') id: string, @Res() res: Response) {
    const volunteer = await this.volunteersService.findOne(id);
    const safeName = volunteer.fullName
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase();
    const filename = `termo-${safeName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc = await this.volunteersService.generateTermPdf(id);
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    doc.pipe(res);
    doc.end();
    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  }

  // Marca saída do voluntário
  @Put(':id/exit')
  async exit(@Param('id') id: string) {
    return this.volunteersService.exit(id);
  }

  // Exporta CSV
  @Get('export/csv')
  async exportCsv(
    @Res() res: Response,
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '1000',
  ) {
    const { items } = await this.volunteersService.findAll(
      q,
      status,
      Number(page),
      Number(limit),
    );
    const header = [
      'id',
      'fullName',
      'email',
      'phone',
      'status',
      'startDate',
      'endDate',
    ];
    const rows = items.map((v) => [
      v.id,
      v.fullName,
      v.email ?? '',
      v.phone ?? '',
      v.status,
      v.startDate ? new Date(v.startDate).toISOString().substring(0, 10) : '',
      v.endDate ? new Date(v.endDate).toISOString().substring(0, 10) : '',
    ]);
    const csv = [header, ...rows]
      .map((r) =>
        r.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','),
      )
      .join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="volunteers.csv"',
    );
    res.send(csv);
  }
}
