import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { quizSessionFixture } from '../../../test/fixtures.js';
import { GetSessionDetailUseCase } from './get-session-detail.use-case.js';

describe('GetSessionDetailUseCase', () => {
  const detail = {
    session: quizSessionFixture(),
    answers: [],
  };

  it('returns detail when session and quiz belong to admin', async () => {
    const session = quizSessionFixture({ id: 's1', quizId: 'q1' });
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(quizFixture({ id: 'q1' })),
    };
    const sessions: Pick<
      IQuizSessionRepository,
      'findById' | 'findDetailForAdmin'
    > = {
      findById: jest.fn().mockResolvedValue(session),
      findDetailForAdmin: jest.fn().mockResolvedValue(detail),
    };
    const uc = new GetSessionDetailUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('s1', 'admin-1')).resolves.toBe(detail);
  });

  it('throws NotFoundError when session does not exist', async () => {
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn(),
    };
    const sessions: Pick<
      IQuizSessionRepository,
      'findById' | 'findDetailForAdmin'
    > = {
      findById: jest.fn().mockResolvedValue(null),
      findDetailForAdmin: jest.fn(),
    };
    const uc = new GetSessionDetailUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('s1', 'a')).rejects.toBeInstanceOf(NotFoundError);
  });
});
