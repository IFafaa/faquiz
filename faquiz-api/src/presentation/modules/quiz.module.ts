import { Module } from '@nestjs/common';
import {
  GetQuizAnalyticsUseCase,
  ListQuizSessionsUseCase,
} from '../../application/use-cases/analytics/quiz-analytics.use-cases.js';
import { GetPublicQuizUseCase } from '../../application/use-cases/quiz/get-public-quiz.use-case.js';
import {
  CreateQuizUseCase,
  DeleteQuizUseCase,
  GetQuizUseCase,
  ListQuizzesUseCase,
  UpdateQuizUseCase,
} from '../../application/use-cases/quiz/quiz-crud.use-cases.js';
import {
  GetQuizTreeUseCase,
  SaveQuizTreeUseCase,
} from '../../application/use-cases/quiz/quiz-tree.use-cases.js';
import { GetShareUseCase } from '../../application/use-cases/share/get-share.use-case.js';
import { StartSessionUseCase } from '../../application/use-cases/session/start-session.use-case.js';
import { AuthModule } from './auth.module.js';
import { QuizController } from '../controllers/quiz.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [QuizController],
  providers: [
    CreateQuizUseCase,
    ListQuizzesUseCase,
    GetQuizUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    GetQuizTreeUseCase,
    SaveQuizTreeUseCase,
    GetPublicQuizUseCase,
    StartSessionUseCase,
    GetShareUseCase,
    GetQuizAnalyticsUseCase,
    ListQuizSessionsUseCase,
  ],
})
export class QuizModule {}
