import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error.js';
import {
  ADMIN_REPOSITORY,
  type IAdminRepository,
} from '../../../domain/repositories/admin.repository.js';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY)
    private readonly admins: IAdminRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const admin = await this.admins.findByEmail(email);
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new UnauthorizedError('Credenciais inválidas');
    }
    const accessToken = await this.jwt.signAsync({
      sub: admin.id,
      email: admin.email,
    });
    return { accessToken };
  }
}
