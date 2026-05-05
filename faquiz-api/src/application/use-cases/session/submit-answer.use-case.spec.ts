import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { AnswerOption } from '../../../domain/entities/answer-option.entity.js';
import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import { SessionStatus } from '../../../domain/value-objects/session-status.js';
import {
  quizFixture,
  quizSessionFixture,
  questionNodeWithOptionsFixture,
} from '../../../test/fixtures.js';
import { SubmitAnswerUseCase } from './submit-answer.use-case.js';

describe('SubmitAnswerUseCase', () => {
  it('throws NotFoundError when session does not exist', async () => {
    const sessions: Pick<IQuizSessionRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(null),
    };
    const quizzes: Pick<IQuizRepository, never> = {} as never;
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new SubmitAnswerUseCase(
      sessions as IQuizSessionRepository,
      quizzes as IQuizRepository,
      queries as IQuizQueryRepository,
    );
    await expect(
      uc.execute('missing', { answerOptionId: 'opt-1' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('throws ValidationError when session is already completed', async () => {
    const session = quizSessionFixture({ status: SessionStatus.COMPLETED });
    const sessions: Pick<IQuizSessionRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(session),
    };
    const quizzes: Pick<IQuizRepository, never> = {} as never;
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new SubmitAnswerUseCase(
      sessions as IQuizSessionRepository,
      quizzes as IQuizRepository,
      queries as IQuizQueryRepository,
    );
    await expect(
      uc.execute(session.id, { answerOptionId: 'opt-1' }),
    ).rejects.toThrow(ValidationError);
  });

  it('throws ValidationError when quiz is invalid', async () => {
    const session = quizSessionFixture();
    const sessions: Pick<IQuizSessionRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(session),
    };
    const quizzes: Pick<IQuizRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(null),
    };
    const queries: Pick<IQuizQueryRepository, never> = {} as never;
    const uc = new SubmitAnswerUseCase(
      sessions as IQuizSessionRepository,
      quizzes as IQuizRepository,
      queries as IQuizQueryRepository,
    );
    await expect(
      uc.execute(session.id, { answerOptionId: 'opt-1' }),
    ).rejects.toThrow(ValidationError);
  });

  it('records answer and completes when there is no next node', async () => {
    const { composite, opt, optId, nodeId } = questionNodeWithOptionsFixture();
    const optTerminal = AnswerOption.fromPersistence({
      id: opt.id,
      questionNodeId: opt.questionNodeId,
      label: opt.label,
      value: opt.value,
      order: opt.order,
      nextQuestionNodeId: null,
      createdAt: opt.createdAt,
      updatedAt: opt.updatedAt,
    });
    const compositeTerminal = { ...composite, answerOptions: [optTerminal] };
    const quiz = quizFixture({ rootNodeId: nodeId });
    const session = quizSessionFixture({ quizId: quiz.id });

    const persisted = jest.fn();
    const sessions: Pick<
      IQuizSessionRepository,
      'findById' | 'listAnswersForSession' | 'addAnswer' | 'persist'
    > = {
      findById: jest.fn().mockResolvedValue(session),
      listAnswersForSession: jest.fn().mockResolvedValue([]),
      addAnswer: jest.fn().mockResolvedValue(undefined),
      persist: persisted,
    };
    const quizzes: Pick<IQuizRepository, 'findById'> = {
      findById: jest.fn().mockResolvedValue(quiz),
    };
    const queries: Pick<
      IQuizQueryRepository,
      'countQuestionNodes' | 'findQuestionWithOptions'
    > = {
      countQuestionNodes: jest.fn().mockResolvedValue(3),
      findQuestionWithOptions: jest.fn().mockResolvedValue(compositeTerminal),
    };

    const uc = new SubmitAnswerUseCase(
      sessions as IQuizSessionRepository,
      quizzes as IQuizRepository,
      queries as IQuizQueryRepository,
    );
    const out = await uc.execute(session.id, { answerOptionId: optId });
    expect(out.completed).toBe(true);
    expect(out.question).toBeNull();
    expect(sessions.addAnswer).toHaveBeenCalled();
    expect(persisted).toHaveBeenCalled();
  });
});
