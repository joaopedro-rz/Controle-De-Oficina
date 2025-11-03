import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import PDFDocument from 'pdfkit';
import { Volunteer } from './volunteers.entity';
import { CreateVolunteerDto } from './dto/create-volunteer.dto';
import { UpdateVolunteerDto } from './dto/update-volunteer.dto';
import { ParticipationsService } from '../participations/participations.service';
import { WorkshopsService } from '../workshops/workshops.service';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

@Injectable()
export class VolunteersService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @Inject(forwardRef(() => ParticipationsService))
    private readonly participationsService: ParticipationsService,
    private readonly workshopsService: WorkshopsService,
  ) {}

  async findAll(q?: string, status?: string, page = 1, limit = 20) {
    const where: Record<string, unknown> = {};
    if (q) where.fullName = ILike(`%${q}%`);
    if (status) where.status = status.toUpperCase();

    const [items, total] = await this.volunteerRepo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const volunteer = await this.volunteerRepo.findOne({ where: { id } });
    if (!volunteer) throw new NotFoundException('Volunteer not found');
    return volunteer;
  }

  async create(dto: CreateVolunteerDto) {
    const volunteer = this.volunteerRepo.create(dto);
    return this.volunteerRepo.save(volunteer);
  }

  async update(id: string, dto: UpdateVolunteerDto) {
    const volunteer = await this.findOne(id);
    Object.assign(volunteer, dto);
    return this.volunteerRepo.save(volunteer);
  }

  async remove(id: string) {
    const volunteer = await this.findOne(id);
    await this.volunteerRepo.remove(volunteer);
    return { success: true };
  }

  async exit(id: string) {
    const volunteer = await this.findOne(id);
    volunteer.endDate = new Date();
    volunteer.status = VolunteerStatus.INACTIVE;
    await this.volunteerRepo.save(volunteer);
    return { success: true };
  }

  async generateTermPdf(volunteerId: string): Promise<PDFDocument> {
    const volunteer = await this.findOne(volunteerId);

    // chama o método correto do service
    const participations =
      await this.participationsService.listByVolunteer(volunteerId);
    // Busca oficinas com tolerância a registros removidos
    const workshops = (
      await Promise.all(
        participations.map(async (p) => {
          try {
            return await this.workshopsService.findOne(p.workshopId);
          } catch {
            return null;
          }
        }),
      )
    ).filter((w): w is NonNullable<typeof w> => Boolean(w));

    const fmt = (d?: Date | string | null): string => {
      if (!d) return '-';
      const date = d instanceof Date ? d : new Date(d);
      return isNaN(date.getTime())
        ? '-'
        : date.toLocaleDateString('pt-BR');
    };

    /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    doc.fontSize(18).text('ELLP', { align: 'left' });
    doc.moveDown(0.5);
    doc.fontSize(16).text('Termo de Voluntariado', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(12).text(`Nome: ${volunteer.fullName}`);
    if (volunteer.email) doc.text(`Email: ${volunteer.email}`);
    if (volunteer.phone) doc.text(`Telefone: ${volunteer.phone}`);
    if (volunteer.cpf) doc.text(`CPF: ${volunteer.cpf}`);
    doc.text(`Data de entrada: ${fmt(volunteer.startDate)}`);
    if (volunteer.endDate)
      doc.text(`Data de saída: ${fmt(volunteer.endDate)}`);
    doc.moveDown(0.5);

    doc.fontSize(13).text('Oficinas vinculadas:', { underline: true });
    if (workshops.length === 0) {
      doc.fontSize(11).text('Nenhuma oficina registrada para este voluntário.');
    } else {
      workshops.forEach((w, i) => {
        doc.fontSize(11).text(`${i + 1}. ${w.name}`);
      });
    }

    doc.moveDown(1);
    doc
      .fontSize(11)
      .text(
        'Declaro estar ciente das responsabilidades do voluntariado e concordo com os termos do projeto ELLP.',
        { align: 'left' },
      );

    doc.moveDown(3);
    doc.text('Assinatura: ______________________________', { align: 'left' });
    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    /* eslint-enable @typescript-eslint/no-unsafe-assignment */

    return doc;
  }
}
