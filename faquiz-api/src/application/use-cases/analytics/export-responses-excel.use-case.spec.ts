import { PayloadTooLargeException } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { quizFixture } from '../../../test/fixtures.js';
import {
  ExportResponsesExcelUseCase,
  MAX_EXPORT_ANSWER_ROWS,
} from './export-responses-excel.use-case.js';

describe('ExportResponsesExcelUseCase', () => {
  it('throws NotFoundError when quiz does not exist', async () => {
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(null),
    };
    const prisma = {} as unknown as PrismaService;
    const uc = new ExportResponsesExcelUseCase(quizzes as IQuizRepository, prisma);
    await expect(uc.execute('x', 'a', null)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('generates empty workbook when there are no sessions', async () => {
    const q = quizFixture();
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(q),
    };
    const prisma = {
      quizSession: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    } as unknown as PrismaService;
    const uc = new ExportResponsesExcelUseCase(quizzes as IQuizRepository, prisma);
    const buf = await uc.execute('quiz-1', 'admin-1', null);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(0);
  });

  it('throws PayloadTooLargeException when answer row limit is exceeded', async () => {
    const q = quizFixture();
    const quizzes: Pick<IQuizRepository, 'findByIdAndAdmin'> = {
      findByIdAndAdmin: jest.fn().mockResolvedValue(q),
    };
    const sessionIds = Array.from({ length: 3 }, (_, i) => `s${i}`);
    const prisma = {
      quizSession: {
        findMany: jest.fn().mockResolvedValue(
          sessionIds.map((id) => ({
            id,
            respondentName: '',
            respondentEmail: '',
            respondentPhone: '',
            status: 'completed',
            startedAt: new Date(),
            completedAt: new Date(),
          })),
        ),
      },
      sessionAnswer: {
        count: jest.fn().mockResolvedValue(MAX_EXPORT_ANSWER_ROWS + 1),
      },
    } as unknown as PrismaService;
    const uc = new ExportResponsesExcelUseCase(quizzes as IQuizRepository, prisma);
    await expect(uc.execute('quiz-1', 'admin-1', null)).rejects.toBeInstanceOf(
      PayloadTooLargeException,
    );
  });
});
