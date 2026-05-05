import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetQuizUseCase } from './get-quiz.use-case.js';

describe('GetQuizUseCase', () => {
  it('returns quiz when it exists', async () => {
    const q = quizFixture();
    const repo: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
    };
    const uc = new GetQuizUseCase(repo as IQuizRepository);
    await expect(uc.execute('quiz-1', 'user-1')).resolves.toBe(q);
  });

  it('throws NotFoundError when it does not exist', async () => {
    const repo: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(null),
    };
    const uc = new GetQuizUseCase(repo as IQuizRepository);
    await expect(uc.execute('x', 'user-1')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
