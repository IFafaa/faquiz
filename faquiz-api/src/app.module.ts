import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { RepositoriesModule } from './infrastructure/repositories.module.js';
import { AuthModule } from './presentation/modules/auth.module.js';
import { QuizModule } from './presentation/modules/quiz.module.js';
import { SessionModule } from './presentation/modules/session.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'login',
          ttl: 60_000,
          limit: 5,
        },
      ],
    }),
    RepositoriesModule,
    AuthModule,
    QuizModule,
    SessionModule,
  ],
})
export class AppModule {}
