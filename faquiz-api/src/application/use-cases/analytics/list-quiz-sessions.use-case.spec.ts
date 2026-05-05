import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { quizSessionFixture } from '../../../test/fixtures.js';
import { ListQuizSessionsUseCase } from './list-quiz-sessions.use-case.js';

describe('ListQuizSessionsUseCase', () => {
  it('lists sessions when quiz exists', async () => {
    const q = quizFixture();
    const list = [quizSessionFixture()];
    const quizzes: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
    };
    const sessions: Pick<IQuizSessionRepository, 'listByQuizForUser'> = {
      listByQuizForUser: jest.fn().mockResolvedValue(list),
    };
    const uc = new ListQuizSessionsUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('quiz-1', 'user-1')).resolves.toBe(list);
  });

  it('throws NotFoundError when quiz does not exist', async () => {
    const quizzes: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(null),
    };
    const sessions: Pick<IQuizSessionRepository, 'listByQuizForUser'> = {
      listByQuizForUser: jest.fn(),
    };
    const uc = new ListQuizSessionsUseCase(
      quizzes as IQuizRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('x', 'a')).rejects.toBeInstanceOf(NotFoundError);
  });
});
