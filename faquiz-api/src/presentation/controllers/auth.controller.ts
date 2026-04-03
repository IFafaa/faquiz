import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { LoginDto } from '../dtos/auth.dto.js';

/** Limite em `AppModule` (ThrottlerModule): 5 tentativas / 60s por IP (nome `login`). */
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }
}
