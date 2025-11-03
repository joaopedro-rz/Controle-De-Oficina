import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './user.entity';

@Injectable()
export class AdminSeeder implements OnModuleInit {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    const seedEnabled =
      (process.env.ADMIN_SEED_ENABLED ?? 'true').toLowerCase() === 'true';
    if (!seedEnabled) return;
    const email = process.env.ADMIN_EMAIL || 'admin@ellp.com';
    const password = process.env.ADMIN_PASSWORD || 'ellp123';
    const name = process.env.ADMIN_NAME || 'ELLP Admin';

    const exists = await this.userRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    if (exists) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      isSuperAdmin: true,
      lastLoginAt: null,
      refreshToken: null,
    });
    await this.userRepo.save(user);
    this.logger.log(`Super admin criado: ${email}`);
  }
}
