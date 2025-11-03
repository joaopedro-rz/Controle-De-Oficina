import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthModule } from '../auth/auth.module';
import { Volunteer } from '../volunteers/volunteers.entity';
import { Participation } from '../participations/participation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Volunteer, Participation]), AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
