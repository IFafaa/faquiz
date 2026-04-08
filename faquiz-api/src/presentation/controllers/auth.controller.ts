import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case.js';
import { LoginDto, RegisterDto } from '../dtos/auth.dto.js';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
  }
}
