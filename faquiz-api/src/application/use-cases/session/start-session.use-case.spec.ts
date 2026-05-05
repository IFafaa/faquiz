import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { QuizSession } from '../../../domain/entities/quiz-session.entity.js';
import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { SessionStatus } from '../../../domain/value-objects/session-status.js';
import {
  quizFixture,
  questionNodeWithOptionsFixture,
} from '../../../test/fixtures.js';
import { StartSessionUseCase } from './start-session.use-case.js';

describe('StartSessionUseCase', () => {
  const { composite, nodeId } = questionNodeWithOptionsFixture();
  const q = quizFixture({ rootNodeId: nodeId });

  it('throws NotFoundError when quiz does not exist or is not published', async () => {
    const queries: Pick<IQuizQueryRepository, 'findPublishedWithRootNode'> = {
      findPublishedWithRootNode: jest.fn().mockResolvedValue(null),
    };
    const sessions: Pick<IQuizSessionRepository, never> = {} as never;
    const uc = new StartSessionUseCase(
      queries as IQuizQueryRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('x', {})).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ValidationError when rootNodeId is missing', async () => {
    const quiz = quizFixture({ rootNodeId: null });
    const queries: Pick<IQuizQueryRepository, 'findPublishedWithRootNode'> = {
      findPublishedWithRootNode: jest.fn().mockResolvedValue({
        quiz,
      }),
    };
    const sessions: Pick<IQuizSessionRepository, never> = {} as never;
    const uc = new StartSessionUseCase(
      queries as IQuizQueryRepository,
      sessions as IQuizSessionRepository,
    );
    await expect(uc.execute('quiz-1', {})).rejects.toThrow(ValidationError);
  });

  it('starts session and returns first question', async () => {
    const quizzes: Pick<
      IQuizQueryRepository,
      | 'findPublishedWithRootNode'
      | 'findQuestionWithOptions'
      | 'countQuestionNodes'
      | 'getQuestionOrdinal'
    > = {
      findPublishedWithRootNode: jest.fn().mockResolvedValue({ quiz: q }),
      findQuestionWithOptions: jest.fn().mockResolvedValue(composite),
      countQuestionNodes: jest.fn().mockResolvedValue(3),
      getQuestionOrdinal: jest.fn().mockResolvedValue(1),
    };
    const sessions: Pick<IQuizSessionRepository, 'persist'> = {
      persist: jest.fn().mockImplementation(async (draft: QuizSession) => {
        expect(draft.quizId).toBe(q.id);
        return QuizSession.fromPersistence({
          id: 'sess-new',
          quizId: q.id,
          respondentName: '',
          respondentEmail: '',
          respondentPhone: '',
          status: SessionStatus.IN_PROGRESS,
          pathTaken: '[]',
          startedAt: draft.startedAt,
          completedAt: null,
        });
      }),
    };
    const uc = new StartSessionUseCase(
      quizzes as IQuizQueryRepository,
      sessions as IQuizSessionRepository,
    );
    const out = await uc.execute(q.id, {});
    expect(out.sessionId).toBe('sess-new');
    expect(out.totalQuestions).toBe(3);
    expect(out.answeredCount).toBe(0);
    expect(out.currentQuestionNumber).toBe(1);
    expect(out.question?.id).toBe(nodeId);
  });
});
