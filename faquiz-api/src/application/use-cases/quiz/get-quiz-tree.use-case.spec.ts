import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetQuizTreeUseCase } from './get-quiz-tree.use-case.js';

describe('GetQuizTreeUseCase', () => {
  it('returns tree when it exists', async () => {
    const tree = { quiz: quizFixture(), nodes: [] };
    const repo: Pick<IQuizQueryRepository, 'findTreeForUser'> = {
      findTreeForUser: jest.fn().mockResolvedValue(tree),
    };
    const uc = new GetQuizTreeUseCase(repo as IQuizQueryRepository);
    await expect(uc.execute('quiz-1', 'user-1')).resolves.toBe(tree);
  });

  it('throws NotFoundError when it does not exist', async () => {
    const repo: Pick<IQuizQueryRepository, 'findTreeForUser'> = {
      findTreeForUser: jest.fn().mockResolvedValue(null),
    };
    const uc = new GetQuizTreeUseCase(repo as IQuizQueryRepository);
    await expect(uc.execute('x', 'a')).rejects.toBeInstanceOf(NotFoundError);
  });
});
