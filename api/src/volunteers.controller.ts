import { Body, Controller, Get, Param, Post, Put, UseGuards, BadRequestException, Res, NotFoundException, Delete } from '@nestjs/common';
import type { VolunteerEntity } from './data.store';
import { DataStoreService } from './data.store';
import { JwtAuthGuard } from './jwt.guard';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('volunteers')
export class VolunteersController {
  constructor(private readonly store: DataStoreService) {}

  @Get()
  list(): VolunteerEntity[] {
    return this.store.listVolunteers();
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

  @Get(':id')
  getOne(@Param('id') id: string) {
    const v = this.store.getVolunteer(id);
    if (!v) throw new NotFoundException('Volunteer not found');
    return v;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const ok = this.store.deleteVolunteer(id);
    if (!ok) throw new BadRequestException('Volunteer not found');
    return { success: true };
  }

  @Get(':id/term')
  async generateTerm(@Param('id') id: string, @Res() res: Response) {
    const volunteer = this.store.getVolunteer(id);
    if (!volunteer) throw new NotFoundException('Volunteer not found');

    // gather participations and workshop names
    const parts = this.store.listParticipations({ volunteerId: id });
    const workshops = parts.map((p) => this.store.getWorkshop(p.workshop_id)).filter(Boolean) as any[];

    // prepare filename
    const safeName = (volunteer.full_name || 'voluntario').replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    const filename = `termo-${safeName}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    doc.pipe(res);

    // Header
    doc.fontSize(18).text('ELLP', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(16).text('Termo de Voluntariado', { align: 'center' });
    doc.moveDown(1);

    // Volunteer info
    doc.fontSize(12).text(`Nome: ${volunteer.full_name}`);
    if (volunteer.email) doc.text(`Email: ${volunteer.email}`);
    if (volunteer.phone) doc.text(`Telefone: ${volunteer.phone}`);
    if (volunteer.cpf) doc.text(`CPF: ${volunteer.cpf}`);
    doc.text(`Data de entrada: ${volunteer.entry_date}`);
    if (volunteer.exit_date) doc.text(`Data de saída: ${volunteer.exit_date}`);
    doc.moveDown(0.5);

    // Participations / workshops
    doc.fontSize(13).text('Oficinas vinculadas:', { underline: true });
    if (workshops.length === 0) {
      doc.fontSize(11).text('Nenhuma oficina registrada para este voluntário.');
    } else {
      workshops.forEach((w, idx) => {
        doc.moveDown(0.2);
        doc.fontSize(11).text(`${idx + 1}. ${w.name}${w.schedule ? ' — ' + w.schedule : ''}${w.location ? ' (' + w.location + ')' : ''}`);
      });
    }

    doc.moveDown(1);
    doc.fontSize(11).text('Declaro estar ciente das responsabilidades do voluntariado e concordo com os termos do projeto ELLP.', { align: 'left' });

    doc.moveDown(3);
    doc.text('Assinatura: ______________________________', { align: 'left' });

    doc.end();
    // no explicit return, response stream will be closed when doc.end() finishes
  }
}
