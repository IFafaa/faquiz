import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { CreateQuizUseCase } from './create-quiz.use-case.js';

describe('CreateQuizUseCase', () => {
  it('persists a draft quiz', async () => {
    const persisted = quizFixture({ id: 'new-id' });
    const repo: Pick<IQuizRepository, 'persist'> = {
      persist: jest.fn().mockResolvedValue(persisted),
    };
    const uc = new CreateQuizUseCase(repo as IQuizRepository);
    const result = await uc.execute('admin-1', {
      title: 'T',
      description: 'd',
      collectName: false,
      collectEmail: false,
      collectPhone: false,
    });
    expect(result).toBe(persisted);
    expect(repo.persist).toHaveBeenCalled();
  });
});
