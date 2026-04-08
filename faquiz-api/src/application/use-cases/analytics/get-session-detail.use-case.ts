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
export class GetSessionDetailUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
  ) {}

  async execute(sessionId: string, userId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão', sessionId);
    }
    const quiz = await this.quizzes.findByIdAndUser(session.quizId, userId);
    if (!quiz) {
      throw new NotFoundError('Sessão', sessionId);
    }
    const detail = await this.sessions.findDetailForUser(
      sessionId,
      session.quizId,
      userId,
    );
    if (!detail) {
      throw new NotFoundError('Sessão', sessionId);
    }
    return detail;
  }
}
