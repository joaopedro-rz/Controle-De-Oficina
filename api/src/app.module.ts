import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth.controller';
import { VolunteersController } from './volunteers.controller';
import { WorkshopsController } from './workshops.controller';
import { ParticipationsController } from './participations.controller';
import { ParticipacoesPtController } from './participations.controller';
import { DataStoreService } from './data.store';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'dev-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, AuthController, VolunteersController, WorkshopsController, ParticipationsController, ParticipacoesPtController],
  providers: [AppService, DataStoreService, AuthService, JwtAuthGuard],
})
export class AppModule {}
