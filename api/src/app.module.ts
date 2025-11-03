import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { VolunteersModule } from './volunteers/volunteers.module';
import { WorkshopsModule } from './workshops/workshops.module';
import { ParticipationsModule } from './participations/participations.module';
import { AuthModule } from './auth/auth.module';
import { VolunteerTermModule } from './volunteerTerm/volunteer-term.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const get = (key: string) =>
          configService.get<string>(key) ?? process.env[key];

        // Prefer DB_* (docker/compose) over DATABASE_* (local api/.env)
        const host = get('DB_HOST') ?? get('DATABASE_HOST') ?? 'localhost';
        const portRaw = get('DB_PORT') ?? get('DATABASE_PORT') ?? '5432';
        const port = Number(portRaw);
        const username = get('DB_USER') ?? get('DATABASE_USER') ?? 'postgres';
        const password =
          get('DB_PASSWORD') ?? get('DATABASE_PASS') ?? 'postgres';
        const database = get('DB_NAME') ?? get('DATABASE_NAME') ?? 'postgres';

  // Log básico para depuração de conexão
  // eslint-disable-next-line no-console
  console.log('[TypeORM]', { host, port, username, database, DB_HOST: process.env.DB_HOST, DATABASE_HOST: process.env.DATABASE_HOST });

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: (process.env.TYPEORM_SYNC ?? 'true') === 'true',
        };
      },
    }),
    AuthModule,
    VolunteersModule,
    WorkshopsModule,
    ParticipationsModule,
    VolunteerTermModule,
    ReportsModule,
  ],
})
export class AppModule {}
