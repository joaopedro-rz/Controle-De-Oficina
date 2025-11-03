import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  isSuperAdmin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');
    const ok = await this.usersService.comparePassword(
      password,
      user.passwordHash,
    );
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  private readonly logger = new Logger(AuthService.name);

  private parseExpires(raw: string | undefined, fallback: string): string | number {
    const value = (raw ?? fallback).toString().trim();
    // Allow pure seconds (e.g., "3600") or time span (e.g., "1h", "3600s", "7d")
    if (/^\d+$/.test(value)) return Number(value);
    return value; // pass through timespan strings accepted by jsonwebtoken
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

  const accessTtl = this.parseExpires(process.env.JWT_EXPIRES_IN, '1h');
  const refreshTtl = this.parseExpires(process.env.JWT_REFRESH_EXPIRES_IN, '7d');

  const token = await this.jwtService.signAsync(payload, { expiresIn: accessTtl as any });
  const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: refreshTtl as any });

    await this.usersService.saveRefreshToken(user.id, refreshToken);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async refresh(refreshToken: string) {
    const validUserId =
      await this.usersService.findUserIdByRefresh(refreshToken);
    if (!validUserId) throw new UnauthorizedException('Refresh inválido');

    const decoded = await this.jwtService
      .verifyAsync<JwtPayload>(refreshToken)
      .catch(() => null);
    if (!decoded) throw new UnauthorizedException('Refresh expirado');

    const user = await this.usersService.findById(validUserId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

    const accessTtl = this.parseExpires(process.env.JWT_EXPIRES_IN, '1h');
    const refreshTtl = this.parseExpires(process.env.JWT_REFRESH_EXPIRES_IN, '7d');
  const token = await this.jwtService.signAsync(payload, { expiresIn: accessTtl as any });
  const newRefresh = await this.jwtService.signAsync(payload, { expiresIn: refreshTtl as any });
    await this.usersService.saveRefreshToken(user.id, newRefresh);
    return { token, refreshToken: newRefresh };
  }

  async logout(refreshToken: string) {
    try {
      const decoded = await this.jwtService
        .verifyAsync<JwtPayload>(refreshToken)
        .catch(() => null);
      if (!decoded) return { success: true };
      await this.usersService.saveRefreshToken(
        decoded.sub,
        null as unknown as string,
      );
    } catch {
      this.logger.warn('Logout attempt with invalid token');
    }
    return { success: true };
  }
}
