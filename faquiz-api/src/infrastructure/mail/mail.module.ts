import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MAIL_PORT } from '../../domain/ports/mail.port.js';
import { SmtpMailService } from './smtp-mail.service.js';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    SmtpMailService,
    { provide: MAIL_PORT, useExisting: SmtpMailService },
  ],
  exports: [MAIL_PORT],
})
export class MailModule {}
