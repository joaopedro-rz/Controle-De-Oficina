import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsuariosPtController } from './usuarios.pt.controller';
import { AuthModule } from '../auth/auth.module';
import { UserEntity } from './user.entity';
import { AdminSeeder } from './admin.seeder';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  providers: [UsersService, AdminSeeder],
  controllers: [UsersController, UsuariosPtController],
  exports: [UsersService],
})
export class UsersModule {}
