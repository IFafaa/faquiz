import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { DeleteQuizUseCase } from './delete-quiz.use-case.js';

describe('DeleteQuizUseCase', () => {
  it('delegates delete to repository', async () => {
    const repo: Pick<IQuizRepository, 'delete'> = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const uc = new DeleteQuizUseCase(repo as IQuizRepository);
    await uc.execute('quiz-1', 'admin-1');
    expect(repo.delete).toHaveBeenCalledWith('quiz-1', 'admin-1');
  });
});
