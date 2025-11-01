import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    const token = auth.substring('Bearer '.length);
    try {
      const payload = this.jwt.verify(token) as any;
      req.user = { id: payload.sub, email: payload.email, full_name: payload.name };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

