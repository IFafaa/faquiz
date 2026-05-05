import { randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../../../domain/entities/user.entity.js';
import {
  MAIL_PORT,
  type IMailPort,
} from '../../../domain/ports/mail.port.js';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../domain/repositories/user.repository.js';
import { passwordResetLink } from '../../../infrastructure/mail/auth-mail-templates.js';
import { passwordReset } from '../../../infrastructure/mail/templates/index.js';

const TTL_MS = 60 * 60 * 1000;

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(MAIL_PORT)
    private readonly mail: IMailPort,
    private readonly config: ConfigService,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const normalized = email.trim().toLowerCase();
    const user = await this.users.findByEmail(normalized);
    const generic = {
      message:
        'Se existir uma conta com este e-mail, enviaremos instruções para redefinir a senha.',
    };
    if (!user) {
      return generic;
    }
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TTL_MS);
    const p = user.toPersistenceProps();
    const updated = User.fromPersistence({
      ...p,
      passwordResetToken: token,
      passwordResetExpires: expires,
      updatedAt: new Date(),
    });
    await this.users.update(updated);
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const resetLink = passwordResetLink(frontend, token);
    const body = passwordReset({
      recipientName: user.name,
      resetLink,
    });
    await this.mail.send({ to: user.email, ...body });
    return generic;
  }
}
