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
import { verificationEmailLink } from '../../../infrastructure/mail/auth-mail-templates.js';
import { verifyEmailResend } from '../../../infrastructure/mail/templates/index.js';

const TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class ResendVerificationUseCase {
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
    const generic =
      'Se existir uma conta com este e-mail, enviaremos um link de confirmação.';
    if (!user || user.emailVerifiedAt) {
      return { message: generic };
    }
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TTL_MS);
    const p = user.toPersistenceProps();
    const updated = User.fromPersistence({
      ...p,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
      updatedAt: new Date(),
    });
    await this.users.update(updated);
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const confirmLink = verificationEmailLink(frontend, token);
    const body = verifyEmailResend({
      recipientName: user.name,
      confirmLink,
    });
    await this.mail.send({ to: user.email, ...body });
    return { message: generic };
  }
}
