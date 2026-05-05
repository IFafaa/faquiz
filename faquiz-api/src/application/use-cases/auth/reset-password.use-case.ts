import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/repositories/user.repository.js';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const trimmed = token?.trim();
    if (!trimmed) {
      throw new ValidationError('Token obrigatório.');
    }
    const user = await this.users.findByPasswordResetToken(trimmed);
    if (
      !user ||
      !user.passwordResetExpires ||
      user.passwordResetExpires < new Date()
    ) {
      throw new ValidationError('Link inválido ou expirado. Solicite nova redefinição.');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const p = user.toPersistenceProps();
    const updated = User.fromPersistence({
      ...p,
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
      updatedAt: new Date(),
    });
    await this.users.update(updated);
    return { message: 'Senha atualizada. Você já pode entrar.' };
  }
}
