import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { ListQuizzesUseCase } from './list-quizzes.use-case.js';

describe('ListQuizzesUseCase', () => {
  it('delegates listByAdmin to repository', async () => {
    const list = [quizFixture()];
    const repo: Pick<IQuizRepository, 'listByAdmin'> = {
      listByAdmin: jest.fn().mockResolvedValue(list),
    };
    const uc = new ListQuizzesUseCase(repo as IQuizRepository);
    await expect(uc.execute('admin-1')).resolves.toBe(list);
  });
});
