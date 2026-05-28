import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { RegisterPractitionerDto } from './dto/register-practitioner.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException();
    return this.authService.login(user);
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register-practitioner')
  async registerPractitioner(@Body() dto: RegisterPractitionerDto) {
    return this.authService.registerPractitioner(dto);
  }
}