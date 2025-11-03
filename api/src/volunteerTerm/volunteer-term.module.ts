import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VolunteerTermEntity } from './volunteer-term.entity';
import { VolunteerTermsService } from './volunteer-term.service';
import { VolunteersModule } from '../volunteers/volunteers.module';
import { VolunteerTermsController } from './volunteer-term.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VolunteerTermEntity]),
    VolunteersModule,
    AuthModule,
  ],
  providers: [VolunteerTermsService],
  controllers: [VolunteerTermsController],
  exports: [VolunteerTermsService],
})
export class VolunteerTermModule {}
