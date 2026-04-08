import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetQuizAnalyticsUseCase } from './get-quiz-analytics.use-case.js';

describe('GetQuizAnalyticsUseCase', () => {
  it('aggregates counts and daily series', async () => {
    const q = quizFixture();
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(q),
    };
    const sessions: Pick<
      IQuizSessionRepository,
      'countByQuiz' | 'countCompletedByQuiz' | 'sessionsPerDay'
    > = {
      countByQuiz: jest.fn().mockResolvedValue(10),
      countCompletedByQuiz: jest.fn().mockResolvedValue(4),
      sessionsPerDay: jest.fn().mockResolvedValue([{ date: '2026-01-01', count: 2 }]),
    };
    const uc = new GetQuizAnalyticsUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('quiz-1', 'admin-1')).resolves.toEqual({
      quizId: 'quiz-1',
      totalSessions: 10,
      completedSessions: 4,
      completionRate: 0.4,
      sessionsPerDay: [{ date: '2026-01-01', count: 2 }],
    });
  });

  it('throws NotFoundError when quiz does not exist', async () => {
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(null),
    };
    const sessions: Pick<
      IQuizSessionRepository,
      'countByQuiz' | 'countCompletedByQuiz' | 'sessionsPerDay'
    > = {
      countByQuiz: jest.fn(),
      countCompletedByQuiz: jest.fn(),
      sessionsPerDay: jest.fn(),
    };
    const uc = new GetQuizAnalyticsUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('x', 'a')).rejects.toBeInstanceOf(NotFoundError);
  });
});
