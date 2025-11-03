import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Workshop } from './workshops.entity';
import { CreateWorkshopDto } from './dto/create-workshop.dto';
import { UpdateWorkshopDto } from './dto/update-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(Workshop)
    private readonly workshopRepo: Repository<Workshop>,
  ) {}

  async findAll(
    q?: string,
    status?: 'active' | 'inactive',
    page = 1,
    limit = 20,
  ) {
    const where: Record<string, unknown> = {};
    if (q) where.name = ILike(`%${q}%`);
    if (status) where.isActive = status === 'active';

    const [items, total] = await this.workshopRepo.findAndCount({
      where,
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const workshop = await this.workshopRepo.findOne({ where: { id } });
    if (!workshop) throw new NotFoundException('Workshop not found');
    return workshop;
  }

  async create(dto: CreateWorkshopDto) {
    const workshop = this.workshopRepo.create(dto);
    return this.workshopRepo.save(workshop);
  }

  async update(id: string, dto: UpdateWorkshopDto) {
    const workshop = await this.findOne(id);
    Object.assign(workshop, dto);
    return this.workshopRepo.save(workshop);
  }

  async remove(id: string) {
    const workshop = await this.findOne(id);
    await this.workshopRepo.remove(workshop);
    return { success: true };
  }
}
