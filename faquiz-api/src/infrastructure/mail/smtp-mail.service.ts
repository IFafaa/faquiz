import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { IMailPort, SendMailInput } from '../../domain/ports/mail.port.js';

/**
 * Envio via SMTP genérico (qualquer provedor: Gmail, Outlook, Brevo, Mailgun SMTP, etc.).
 */
@Injectable()
export class SmtpMailService implements IMailPort {
  private readonly logger = new Logger(SmtpMailService.name);

  constructor(private readonly config: ConfigService) {}

  async send(input: SendMailInput): Promise<void> {
    const host = this.config.get<string>('SMTP_HOST');
    const enabled = this.config.get<string>('MAIL_ENABLED');

    if (enabled === 'false' || enabled === '0' || !host) {
      this.logger.warn(
        `E-mail não enviado (MAIL_ENABLED ou SMTP_HOST ausente). Para: ${input.to} — ${input.subject}`,
      );
      this.logger.debug(`Pré-visualização:\n${input.text}`);
      return;
    }

    const port = Number(this.config.get<string>('SMTP_PORT') ?? '587');
    const secureRaw = this.config.get<string>('SMTP_SECURE');
    const secure =
      secureRaw === 'true' ||
      secureRaw === '1' ||
      (secureRaw === undefined && port === 465);

    const user = this.config.get<string>('SMTP_USER');
    const pass =
      this.config.get<string>('SMTP_PASSWORD') ??
      this.config.get<string>('SMTP_PASS');
    const from =
      this.config.get<string>('SMTP_FROM') ?? 'FAQuiz <noreply@localhost>';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
