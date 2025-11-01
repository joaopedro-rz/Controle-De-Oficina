import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

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
    const ok = await this.usersService.comparePassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Credenciais inválidas');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

    const token = await this.jwtService.signAsync(payload);

    // refresh token simples (exemplo educativo)
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
    });

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
    const validUserId = await this.usersService.findUserIdByRefresh(refreshToken);
    if (!validUserId) throw new UnauthorizedException('Refresh inválido');

    const decoded = await this.jwtService.verifyAsync<JwtPayload>(refreshToken).catch(() => null);
    if (!decoded) throw new UnauthorizedException('Refresh expirado');

    const user = await this.usersService.findById(validUserId);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

    const token = await this.jwtService.signAsync(payload);

    return { token };
  }
}
