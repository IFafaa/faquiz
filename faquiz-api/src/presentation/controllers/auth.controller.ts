import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { LoginDto } from '../dtos/auth.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto.email, dto.password);
  }
}
