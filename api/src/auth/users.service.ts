import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import type { AdminUser } from '../domain/entities';

@Injectable()
export class UsersService {
  private users: AdminUser[] = [];
  private refreshIndex = new Map<string, string>(); // refreshToken -> userId

  constructor() {
    // seed admin user (password: admin123)
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const admin: AdminUser = {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash,
      lastLoginAt: null,
      isSuperAdmin: true,
    };
    this.users.push(admin);
  }

  async findByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findById(id: string) {
    return this.users.find((u) => u.id === id) || null;
  }

  async comparePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  async saveRefreshToken(userId: string, refreshToken: string) {
    this.refreshIndex.set(refreshToken, userId);
  }

  async findUserIdByRefresh(refreshToken: string) {
    return this.refreshIndex.get(refreshToken) || null;
  }
}

