import { Module } from '@nestjs/common';
import { ExportResponsesExcelUseCase } from '../../application/use-cases/analytics/export-responses-excel.use-case.js';
import { GetQuizAnalyticsUseCase } from '../../application/use-cases/analytics/get-quiz-analytics.use-case.js';
import { GetResponseAggregatesUseCase } from '../../application/use-cases/analytics/get-response-aggregates.use-case.js';
import { ListQuizSessionsUseCase } from '../../application/use-cases/analytics/list-quiz-sessions.use-case.js';
import { CreateQuizUseCase } from '../../application/use-cases/quiz/create-quiz.use-case.js';
import { DeleteQuizUseCase } from '../../application/use-cases/quiz/delete-quiz.use-case.js';
import { GetPublicQuizUseCase } from '../../application/use-cases/quiz/get-public-quiz.use-case.js';
import { GetQuizTreeUseCase } from '../../application/use-cases/quiz/get-quiz-tree.use-case.js';
import { GetQuizUseCase } from '../../application/use-cases/quiz/get-quiz.use-case.js';
import { GetShareUseCase } from '../../application/use-cases/quiz/get-share.use-case.js';
import { ListPublishedQuizzesUseCase } from '../../application/use-cases/quiz/list-published-quizzes.use-case.js';
import { ListQuizzesUseCase } from '../../application/use-cases/quiz/list-quizzes.use-case.js';
import { SaveQuizTreeUseCase } from '../../application/use-cases/quiz/save-quiz-tree.use-case.js';
import { StartSessionUseCase } from '../../application/use-cases/session/start-session.use-case.js';
import { UpdateQuizUseCase } from '../../application/use-cases/quiz/update-quiz.use-case.js';
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
