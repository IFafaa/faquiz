import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ConflictError } from '../../../domain/errors/conflict.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/repositories/user.repository.js';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    private readonly jwt: JwtService,
  ) {}

  async execute(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ accessToken: string }> {
    const existing = await this.users.findByEmail(params.email);
    if (existing) {
      throw new ConflictError('Este e-mail já está cadastrado.');
    }
    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = User.createNew({
      email: params.email,
      passwordHash,
      name: params.name,
    });
    const saved = await this.users.create(user);
    const accessToken = await this.jwt.signAsync({
      sub: saved.id,
      email: saved.email,
    });
    return { accessToken };
  }
}
