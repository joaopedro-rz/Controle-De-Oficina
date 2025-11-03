import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VolunteerTermEntity } from './volunteer-term.entity';
import { VolunteersService } from '../volunteers/volunteers.service';
import * as fs from 'fs';
import * as path from 'path';
import { PassThrough } from 'stream';
import { TermStatus } from '../common/enums/term-status.enum';
import PDFDocument from 'pdfkit';

@Injectable()
export class VolunteerTermsService {
  constructor(
    @InjectRepository(VolunteerTermEntity)
    private readonly termRepo: Repository<VolunteerTermEntity>,
    private readonly volunteersService: VolunteersService,
  ) {}

  private ensureStorageDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  async generateAndSave(volunteerId: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const doc: PDFDocument =
      await this.volunteersService.generateTermPdf(volunteerId);

    const storageDir =
      process.env.STORAGE_DIR || path.join(process.cwd(), 'storage', 'terms');
    this.ensureStorageDir(storageDir);

    const fileName = `termo-${volunteerId}-${Date.now()}.pdf`;
    const fullPath = path.join(storageDir, fileName);

    const fileStream = fs.createWriteStream(fullPath);
    const tee = new PassThrough();
    tee.pipe(fileStream);

    /* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    doc.pipe(tee);
    await new Promise<void>((resolve) => {
      fileStream.on('finish', () => resolve());
      doc.end();
    });
    /* eslint-enable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    const term = this.termRepo.create({
      volunteerId,
      version: 'v1',
      filePath: fullPath,
      status: TermStatus.GENERATED,
      generatedAt: new Date(),
    });
    return this.termRepo.save(term);
  }

  async getLatestByVolunteer(volunteerId: string) {
    return this.termRepo.findOne({
      where: { volunteerId },
      order: { createdAt: 'DESC' },
    });
  }
}
