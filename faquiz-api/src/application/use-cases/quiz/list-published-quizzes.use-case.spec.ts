import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import { ListPublishedQuizzesUseCase } from './list-published-quizzes.use-case.js';

describe('ListPublishedQuizzesUseCase', () => {
  it('delegates to listPublishedQuizzes', async () => {
    const rows = [{ id: '1', title: 'A', description: '' }];
    const repo: Pick<IQuizQueryRepository, 'listPublishedQuizzes'> = {
      listPublishedQuizzes: jest.fn().mockResolvedValue(rows),
    };
    const uc = new ListPublishedQuizzesUseCase(repo as IQuizQueryRepository);
    await expect(uc.execute()).resolves.toBe(rows);
  });
});
