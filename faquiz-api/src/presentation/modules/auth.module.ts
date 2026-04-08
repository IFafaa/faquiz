import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { ForgotPasswordUseCase } from '../../application/use-cases/auth/forgot-password.use-case.js';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case.js';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case.js';
import { ResendVerificationUseCase } from '../../application/use-cases/auth/resend-verification.use-case.js';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/reset-password.use-case.js';
import { VerifyEmailUseCase } from '../../application/use-cases/auth/verify-email.use-case.js';
import { JwtStrategy } from '../../infrastructure/auth/jwt.strategy.js';
import { MailModule } from '../../infrastructure/mail/mail.module.js';
import { RepositoriesModule } from '../../infrastructure/repositories.module.js';
import { AuthController } from '../controllers/auth.controller.js';

@Module({
  imports: [
    ConfigModule,
    MailModule,
    RepositoriesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwtSecret = config.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error(
            'JWT_SECRET não configurado. Defina a variável de ambiente antes de iniciar.',
          );
        }
        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: (config.get<string>('JWT_EXPIRATION') ??
              '7d') as StringValue,
          },
        };
      },
    }),
  ],
  providers: [
    JwtStrategy,
    LoginUseCase,
    RegisterUseCase,
    VerifyEmailUseCase,
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
  ],
  controllers: [AuthController],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
