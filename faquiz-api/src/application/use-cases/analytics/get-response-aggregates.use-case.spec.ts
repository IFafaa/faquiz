import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetResponseAggregatesUseCase } from './get-response-aggregates.use-case.js';

describe('GetResponseAggregatesUseCase', () => {
  it('throws NotFoundError when quiz does not exist', async () => {
    const quizzes: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(null),
    };
    const prisma = {} as unknown as PrismaService;
    const uc = new GetResponseAggregatesUseCase(
      quizzes as IQuizRepository,
      prisma,
    );
    await expect(uc.execute('x', 'a', null)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('returns empty aggregates when no sessions match filters', async () => {
    const q = quizFixture();
    const quizzes: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
    };
    const prisma = {
      quizSession: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      questionNode: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'n1',
            title: 'P1',
            questionType: 'multiple_choice',
          },
        ]),
      },
      answerOption: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const uc = new GetResponseAggregatesUseCase(
      quizzes as IQuizRepository,
      prisma,
    );
    await expect(uc.execute('quiz-1', 'user-1', null)).resolves.toEqual({
      quizId: 'quiz-1',
      filteredSessionCount: 0,
      questions: [
        {
          questionNodeId: 'n1',
          title: 'P1',
          questionType: 'multiple_choice',
          distribution: [],
        },
      ],
      timeline: [],
    });
  });
});
