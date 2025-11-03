import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Volunteer } from '../volunteers/volunteers.entity';
import { Participation } from '../participations/participation.entity';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Volunteer)
    private readonly volunteerRepo: Repository<Volunteer>,
    @InjectRepository(Participation)
    private readonly participationRepo: Repository<Participation>,
  ) {}

  async activeVolunteersCount() {
    return this.volunteerRepo.count({
      where: { status: VolunteerStatus.ACTIVE },
    });
  }

  async workshopParticipantsCount(workshopId: string) {
    const qb = this.participationRepo.createQueryBuilder('p');
    qb.select('COUNT(DISTINCT p.volunteerId)', 'count').where(
      'p.workshopId = :workshopId',
      { workshopId },
    );
    const row = await qb.getRawOne<{ count: string }>();
    return Number(row?.count || 0);
  }

  async activeWorkshopsCount() {
    const qb = this.participationRepo.createQueryBuilder('p');
    qb.select('COUNT(DISTINCT p.workshopId)', 'count');
    const row = await qb.getRawOne<{ count: string }>();
    return Number(row?.count || 0);
  }
}
