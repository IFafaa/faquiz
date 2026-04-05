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
export class ListQuizSessionsUseCase {
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
    return this.sessions.listByQuizForAdmin(quizId, adminId);
  }
}
