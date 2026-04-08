import { Global, Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module.js';
import { PrismaUserRepository } from './database/repositories/prisma-user.repository.js';
import { PrismaQuizQueryRepository } from './database/repositories/prisma-quiz-query.repository.js';
import { PrismaQuizRepository } from './database/repositories/prisma-quiz.repository.js';
import { PrismaQuizSessionRepository } from './database/repositories/prisma-quiz-session.repository.js';
import { USER_REPOSITORY } from '../domain/repositories/user.repository.js';
import { QUIZ_QUERY_REPOSITORY } from '../domain/repositories/quiz-query.repository.js';
import { QUIZ_REPOSITORY } from '../domain/repositories/quiz.repository.js';
import { QUIZ_SESSION_REPOSITORY } from '../domain/repositories/quiz-session.repository.js';
import { QR_CODE_PORT } from '../domain/ports/qr-code.port.js';
import { QrCodeService } from './services/qr-code.service.js';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: QUIZ_REPOSITORY, useClass: PrismaQuizRepository },
    { provide: QUIZ_QUERY_REPOSITORY, useClass: PrismaQuizQueryRepository },
    { provide: QUIZ_SESSION_REPOSITORY, useClass: PrismaQuizSessionRepository },
    { provide: QR_CODE_PORT, useClass: QrCodeService },
  ],
  exports: [
    USER_REPOSITORY,
    QUIZ_REPOSITORY,
    QUIZ_QUERY_REPOSITORY,
    QUIZ_SESSION_REPOSITORY,
    QR_CODE_PORT,
  ],
})
export class RepositoriesModule {}
