import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { SessionStatus } from '../../../domain/value-objects/session-status.js';
import {
  quizSessionFixture,
  quizFixture,
  questionNodeWithOptionsFixture,
  sessionAnswerFixture,
} from '../../../test/fixtures.js';
import { UndoLastAnswerUseCase } from './undo-last-answer.use-case.js';

describe('UndoLastAnswerUseCase', () => {
  it('throws NotFoundError when session does not exist', async () => {
    const sessions: Pick<IQuizSessionRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(null),
    };
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new UndoLastAnswerUseCase(
      sessions as IQuizSessionRepository,
      queries as IQuizQueryRepository,
    );
    await expect(uc.execute('x')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ValidationError when session is not in progress', async () => {
    const session = quizSessionFixture({ status: SessionStatus.COMPLETED });
    const sessions: Pick<IQuizSessionRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(session),
    };
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new UndoLastAnswerUseCase(
      sessions as IQuizSessionRepository,
      queries as IQuizQueryRepository,
    );
    await expect(uc.execute(session.id)).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when there are no answers', async () => {
    const session = quizSessionFixture();
    const sessions: Pick<
      IQuizSessionRepository,
      'findById' | 'listAnswersForSession'
    > = {
      findById: jest.fn().mockResolvedValue(session),
      listAnswersForSession: jest.fn().mockResolvedValue([]),
    };
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new UndoLastAnswerUseCase(
      sessions as IQuizSessionRepository,
      queries as IQuizQueryRepository,
    );
    await expect(uc.execute(session.id)).rejects.toThrow(ValidationError);
  });

  it('removes last answer and returns current question', async () => {
    const { composite, nodeId } = questionNodeWithOptionsFixture();
    const quiz = quizFixture({ rootNodeId: nodeId });
    const session = quizSessionFixture({
      quizId: quiz.id,
      pathTaken: JSON.stringify([nodeId]),
    });
    const ans = sessionAnswerFixture({
      sessionId: session.id,
      questionNodeId: nodeId,
    });

    const sessions: Pick<
      IQuizSessionRepository,
      | 'findById'
      | 'listAnswersForSession'
      | 'removeLastAnswer'
      | 'persist'
    > = {
      findById: jest.fn().mockResolvedValue(session),
      listAnswersForSession: jest
        .fn()
        .mockResolvedValueOnce([ans])
        .mockResolvedValueOnce([]),
      removeLastAnswer: jest.fn().mockResolvedValue(ans),
      persist: jest.fn().mockResolvedValue(undefined),
    };
    const queries: Pick<
      IQuizQueryRepository,
      'findQuestionWithOptions' | 'countQuestionNodes' | 'getQuestionOrdinal'
    > = {
      findQuestionWithOptions: jest.fn().mockResolvedValue(composite),
      countQuestionNodes: jest.fn().mockResolvedValue(2),
      getQuestionOrdinal: jest.fn().mockResolvedValue(1),
    };
    const uc = new UndoLastAnswerUseCase(
      sessions as IQuizSessionRepository,
      queries as IQuizQueryRepository,
    );
    const out = await uc.execute(session.id);
    expect(out.question.id).toBe(nodeId);
    expect(out.answeredCount).toBe(0);
    expect(sessions.persist).toHaveBeenCalled();
  });
});
