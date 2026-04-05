import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';
import {
  QUIZ_SESSION_REPOSITORY,
  type IQuizSessionRepository,
} from '../../../domain/repositories/quiz-session.repository.js';

@Injectable()
export class GetQuizAnalyticsUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
  ) {}

  async execute(quizId: string, adminId: string) {
    const quiz = await this.quizzes.findByIdAndAdmin(quizId, adminId);
    if (!quiz) {
      throw new NotFoundError('Quiz', quizId);
    }
    const totalSessions = await this.sessions.countByQuiz(quizId);
    const completedSessions = await this.sessions.countCompletedByQuiz(quizId);
    const sessionsPerDay = await this.sessions.sessionsPerDay(quizId, 30);
    return {
      quizId,
      totalSessions,
      completedSessions,
      completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
      sessionsPerDay,
    };
  }
}
