import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteersService } from './volunteers.service';
import { VolunteersController } from './volunteers.controller';
import { Volunteer } from './volunteers.entity';
import { ParticipationsModule } from '../participations/participations.module';
import { WorkshopsModule } from '../workshops/workshops.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Volunteer]),
    forwardRef(() => ParticipationsModule),
    WorkshopsModule,
    AuthModule,
  ],
  controllers: [VolunteersController],
  providers: [VolunteersService],
  exports: [VolunteersService],
})
export class VolunteersModule {}
