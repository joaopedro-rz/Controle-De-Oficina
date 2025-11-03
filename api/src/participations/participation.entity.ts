import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Index } from 'typeorm';
import { ParticipationRole } from '../common/enums/participation-role.enum';
import { Volunteer } from '../volunteers/volunteers.entity';
import { Workshop } from '../workshops/workshops.entity';

@Entity('participations')
@Index(
  'UQ_participation_unique',
  ['volunteerId', 'workshopId', 'date', 'role'],
  { unique: true },
)
export class Participation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  volunteerId: string;

  @Column({ type: 'uuid' })
  workshopId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ParticipationRole, nullable: true })
  role?: ParticipationRole;

  @Column({ type: 'int', nullable: true })
  hours?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => Volunteer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'volunteerId' })
  volunteer: Volunteer;

  @ManyToOne(() => Workshop, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workshopId' })
  workshop: Workshop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
