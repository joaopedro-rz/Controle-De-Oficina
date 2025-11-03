import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participation } from './participation.entity';
import { ParticipationsService } from './participations.service';
import {
  ParticipationsController,
  ParticipacoesPtController,
} from './participations.controller';
import { VolunteersModule } from '../volunteers/volunteers.module';
import { WorkshopsModule } from '../workshops/workshops.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Participation]),
    forwardRef(() => VolunteersModule),
    WorkshopsModule,
    AuthModule,
  ],
  controllers: [ParticipationsController, ParticipacoesPtController],
  providers: [ParticipationsService],
  exports: [ParticipationsService],
})
export class ParticipationsModule {}
