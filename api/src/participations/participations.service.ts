import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Participation } from './participation.entity';
import { CreateParticipationDto } from './dto/create-participation.dto';
import { VolunteersService } from '../volunteers/volunteers.service';
import { WorkshopsService } from '../workshops/workshops.service';

@Injectable()
export class ParticipationsService {
  constructor(
    @InjectRepository(Participation)
    private readonly participationRepo: Repository<Participation>,
    @Inject(forwardRef(() => VolunteersService))
    private readonly volunteersService: VolunteersService,
    private readonly workshopsService: WorkshopsService,
  ) {}

  async list(filters?: { workshopId?: string; volunteerId?: string }) {
    const qb = this.participationRepo.createQueryBuilder('p');

    if (filters?.workshopId)
      qb.andWhere('p.workshopId = :workshopId', {
        workshopId: filters.workshopId,
      });
    if (filters?.volunteerId)
      qb.andWhere('p.volunteerId = :volunteerId', {
        volunteerId: filters.volunteerId,
      });

    qb.orderBy('p.date', 'DESC');

    return qb.getMany();
  }

  async listByVolunteer(volunteerId: string) {
    return this.participationRepo.find({
      where: { volunteerId },
      order: { date: 'DESC' },
    });
  }

  async create(dto: CreateParticipationDto) {
    const volunteer = await this.volunteersService.findOne(dto.volunteerId);
    if (!volunteer) throw new BadRequestException('Volunteer not found');

    const workshop = await this.workshopsService.findOne(dto.workshopId);
    if (!workshop) throw new BadRequestException('Workshop not found');

    const participation = this.participationRepo.create(dto);
    return this.participationRepo.save(participation);
  }

  async delete(id: string) {
    const result = await this.participationRepo.delete(id);
    if (result.affected === 0)
      throw new BadRequestException('Participation not found');
    return { success: true };
  }
}
