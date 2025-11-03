import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Request } from 'express';
import type { JwtPayload } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { LogoutDto } from './dto/logout.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private limiter = new RateLimiterMemory({ points: 5, duration: 60 }); // 5 req/min por IP

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar com e-mail e senha' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso (tokens retornados)' })
  async login(@Body() body: LoginDto) {
    try {
      await this.limiter.consume(`${body.email}`);
    } catch {
      throw new HttpException(
        'Muitas tentativas, aguarde um pouco',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar novo access token a partir do refresh token' })
  @ApiBody({ type: RefreshDto })
  async refresh(@Body() body: RefreshDto) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidar o refresh token (logout)' })
  @ApiBody({ type: LogoutDto })
  async logout(@Body() body: LogoutDto) {
    return this.authService.logout(body.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Retorna o payload do usuário autenticado' })
  me(@Req() req: Request & { user?: JwtPayload }) {
    // req.user vem do JwtStrategy.validate (Passport)
    return req.user ?? null;
  }
}
