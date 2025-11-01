import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body ?? {};
    const user = await this.auth.validateUser(email, password);
    const token = this.auth.signToken(user);
    return { token, user };
  }

  @Post('signup')
  async signup(@Body() body: any) {
    // Apenas stub para compatibilidade com a tela; admin é fixo.
    const { email, full_name } = body ?? {};
    return { success: true, message: 'Conta criada (stub)', email, full_name };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: any) {
    return req.user;
  }
}
