import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetPublicQuizUseCase } from './get-public-quiz.use-case.js';

describe('GetPublicQuizUseCase', () => {
  it('returns data when published quiz exists', async () => {
    const data = { quiz: quizFixture({ isPublished: true }), rootNode: null };
    const repo: Pick<IQuizQueryRepository, 'findPublishedWithRootNode'> = {
      findPublishedWithRootNode: jest.fn().mockResolvedValue(data),
    };
    const uc = new GetPublicQuizUseCase(repo as IQuizQueryRepository);
    await expect(uc.execute('quiz-1')).resolves.toBe(data);
  });

  it('throws NotFoundError when there is no published quiz', async () => {
    const repo: Pick<IQuizQueryRepository, 'findPublishedWithRootNode'> = {
      findPublishedWithRootNode: jest.fn().mockResolvedValue(null),
    };
    const uc = new GetPublicQuizUseCase(repo as IQuizQueryRepository);
    await expect(uc.execute('x')).rejects.toBeInstanceOf(NotFoundError);
  });
});
