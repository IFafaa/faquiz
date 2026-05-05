import { randomBytes } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { ConflictError } from '../../../domain/errors/conflict.error.js';
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
import { verifyEmailWelcome } from '../../../infrastructure/mail/templates/index.js';

const TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: IUserRepository,
    @Inject(MAIL_PORT)
    private readonly mail: IMailPort,
    private readonly config: ConfigService,
  ) {}

  async execute(params: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ message: string }> {
    const existing = await this.users.findByEmail(params.email.trim().toLowerCase());
    if (existing) {
      throw new ConflictError('Este e-mail já está cadastrado.');
    }
    const passwordHash = await bcrypt.hash(params.password, 10);
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + TTL_MS);
    const user = User.createPendingEmailVerification({
      email: params.email.trim().toLowerCase(),
      passwordHash,
      name: params.name,
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    });
    const saved = await this.users.create(user);
    const frontend =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const confirmLink = verificationEmailLink(frontend, token);
    const body = verifyEmailWelcome({
      recipientName: saved.name,
      confirmLink,
    });
    await this.mail.send({ to: saved.email, ...body });
    return {
      message:
        'Conta criada. Enviamos um link de confirmação para seu e-mail.',
    };
  }
}
