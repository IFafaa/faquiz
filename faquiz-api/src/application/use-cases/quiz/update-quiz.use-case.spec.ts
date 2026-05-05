import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { UpdateQuizUseCase } from './update-quiz.use-case.js';

describe('UpdateQuizUseCase', () => {
  it('updates and persists quiz', async () => {
    const q = quizFixture();
    const persisted = quizFixture({ title: 'Novo' });
    const repo: Pick<IQuizRepository, 'findByIdAndUser' | 'persist'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
      persist: jest.fn().mockResolvedValue(persisted),
    };
    const uc = new UpdateQuizUseCase(repo as IQuizRepository);
    const result = await uc.execute('quiz-1', 'user-1', { title: 'Novo' });
    expect(result).toBe(persisted);
    expect(repo.persist).toHaveBeenCalled();
  });

  it('throws NotFoundError when quiz does not exist', async () => {
    const repo: Pick<IQuizRepository, 'findByIdAndUser' | 'persist'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(null),
      persist: jest.fn(),
    };
    const uc = new UpdateQuizUseCase(repo as IQuizRepository);
    await expect(
      uc.execute('x', 'user-1', { title: 'A' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(repo.persist).not.toHaveBeenCalled();
  });
});
