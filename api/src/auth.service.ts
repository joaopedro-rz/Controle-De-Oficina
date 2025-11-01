import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
}

@Injectable()
export class AuthService {
  private admin = {
    id: 'admin-1',
    email: process.env.ADMIN_EMAIL || 'admin@ellp.local',
    full_name: 'Administrador',
    passwordHash: '',
  };

  constructor(private readonly jwt: JwtService) {
    const pwd = process.env.ADMIN_PASSWORD || 'admin123';
    this.admin.passwordHash = bcrypt.hashSync(pwd, 10);
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    if (email !== this.admin.email) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, this.admin.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return { id: this.admin.id, email: this.admin.email, full_name: this.admin.full_name };
  }

  signToken(user: AuthUser): string {
    return this.jwt.sign({ sub: user.id, email: user.email, name: user.full_name });
  }

  verifyToken(token: string): AuthUser | null {
    try {
      const payload = this.jwt.verify(token) as any;
      return { id: payload.sub, email: payload.email, full_name: payload.name };
    } catch {
      return null;
    }
  }
}

