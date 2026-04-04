import { Module } from '@nestjs/common';
import {
  GetQuizAnalyticsUseCase,
  ListQuizSessionsUseCase,
} from '../../application/use-cases/analytics/quiz-analytics.use-cases.js';
import { ExportResponsesExcelUseCase } from '../../application/use-cases/analytics/export-responses-excel.use-case.js';
import { GetResponseAggregatesUseCase } from '../../application/use-cases/analytics/get-response-aggregates.use-case.js';
import { GetPublicQuizUseCase } from '../../application/use-cases/quiz/get-public-quiz.use-case.js';
import { ListPublishedQuizzesUseCase } from '../../application/use-cases/quiz/list-published-quizzes.use-case.js';
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
import { RepositoriesModule } from '../../infrastructure/repositories.module.js';
import { QuizController } from '../controllers/quiz.controller.js';
import { QuizInsightsController } from '../controllers/quiz-insights.controller.js';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [QuizController, QuizInsightsController],
  providers: [
    CreateQuizUseCase,
    ListQuizzesUseCase,
    GetQuizUseCase,
    UpdateQuizUseCase,
    DeleteQuizUseCase,
    GetQuizTreeUseCase,
    SaveQuizTreeUseCase,
    GetPublicQuizUseCase,
    ListPublishedQuizzesUseCase,
    StartSessionUseCase,
    GetShareUseCase,
    GetQuizAnalyticsUseCase,
    ListQuizSessionsUseCase,
    GetResponseAggregatesUseCase,
    ExportResponsesExcelUseCase,
  ],
})
export class QuizModule {}
