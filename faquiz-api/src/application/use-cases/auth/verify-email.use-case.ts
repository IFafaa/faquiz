import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/repositories/user.repository.js';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(token: string): Promise<{ message: string }> {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new ValidationError('Token obrigatório.');
    }
    const user = await this.users.findByEmailVerificationToken(trimmed);
    if (
      !user ||
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new ValidationError('Link inválido ou expirado. Solicite um novo e-mail.');
    }
    const p = user.toPersistenceProps();
    const verified = User.fromPersistence({
      ...p,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
      updatedAt: new Date(),
    });
    await this.users.update(verified);
    return { message: 'E-mail confirmado. Você já pode entrar.' };
  }
}
