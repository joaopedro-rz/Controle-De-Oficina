import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    interface RequestWithUser extends Request {
      user?: { id: string; email: string; full_name: string };
    }
    const req = context.switchToHttp().getRequest<RequestWithUser>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      throw new UnauthorizedException('Missing token');
    const token = auth.substring('Bearer '.length);
    try {
      const payload = this.jwt.verify<JwtPayload>(token);
      req.user = {
        id: payload.sub,
        email: payload.email,
        full_name: payload.name,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
