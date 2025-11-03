import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TermStatus } from '../common/enums/term-status.enum';

@Entity('volunteer_terms')
export class VolunteerTermEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column('uuid')
  volunteerId: string;

  @Column({ default: 'v1' })
  version: string;

  @Column()
  filePath: string;

  @Column({ type: 'enum', enum: TermStatus, default: TermStatus.GENERATED })
  status: TermStatus;

  @Column({ type: 'timestamp' })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  signedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
