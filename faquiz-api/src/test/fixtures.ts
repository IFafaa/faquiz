import { hashSync } from 'bcryptjs';
import { Admin } from '../domain/entities/admin.entity.js';
import { AnswerOption } from '../domain/entities/answer-option.entity.js';
import { QuestionNode } from '../domain/entities/question-node.entity.js';
import { Quiz } from '../domain/entities/quiz.entity.js';
import { QuizSession } from '../domain/entities/quiz-session.entity.js';
import { SessionAnswer } from '../domain/entities/session-answer.entity.js';
import { QuestionType } from '../domain/value-objects/question-type.js';
import { SessionStatus } from '../domain/value-objects/session-status.js';

const now = () => new Date('2026-01-01T00:00:00.000Z');

export function adminFixture(
  overrides: Partial<{
    id: string;
    email: string;
    passwordPlain: string;
    name: string;
  }> = {},
): Admin {
  const plain = overrides.passwordPlain ?? 'secret';
  return Admin.fromPersistence({
    id: overrides.id ?? 'admin-1',
    email: overrides.email ?? 'a@test.com',
    passwordHash: hashSync(plain, 4),
    name: overrides.name ?? 'Admin',
    createdAt: now(),
    updatedAt: now(),
  });
}

export function quizFixture(
  overrides: Partial<{
    id: string;
    title: string;
    adminId: string;
    rootNodeId: string | null;
    isPublished: boolean;
  }> = {},
): Quiz {
  return Quiz.fromPersistence({
    id: overrides.id ?? 'quiz-1',
    title: overrides.title ?? 'Quiz',
    description: '',
    isPublished: overrides.isPublished ?? false,
    collectName: false,
    collectEmail: false,
    collectPhone: false,
    rootNodeId:
      overrides.rootNodeId !== undefined ? overrides.rootNodeId : 'node-root',
    adminId: overrides.adminId ?? 'admin-1',
    createdAt: now(),
    updatedAt: now(),
  });
}

export function quizSessionFixture(
  overrides: Partial<{
    id: string;
    quizId: string;
    status: typeof SessionStatus.IN_PROGRESS | typeof SessionStatus.COMPLETED;
    pathTaken: string;
  }> = {},
): QuizSession {
  return QuizSession.fromPersistence({
    id: overrides.id ?? 'sess-1',
    quizId: overrides.quizId ?? 'quiz-1',
    respondentName: '',
    respondentEmail: '',
    respondentPhone: '',
    status: overrides.status ?? SessionStatus.IN_PROGRESS,
    pathTaken: overrides.pathTaken ?? '[]',
    startedAt: now(),
    completedAt: null,
  });
}

export function questionNodeWithOptionsFixture() {
  const optId = 'opt-1';
  const nodeId = 'node-root';
  const nextId = 'node-next';
  const node = QuestionNode.fromPersistence({
    id: nodeId,
    quizId: 'quiz-1',
    title: 'Q1',
    description: '',
    questionType: QuestionType.MULTIPLE_CHOICE,
    positionX: 0,
    positionY: 0,
    createdAt: now(),
    updatedAt: now(),
  });
  const opt = AnswerOption.fromPersistence({
    id: optId,
    questionNodeId: nodeId,
    label: 'A',
    value: 'a',
    order: 0,
    nextQuestionNodeId: nextId,
    createdAt: now(),
    updatedAt: now(),
  });
  return {
    node,
    opt,
    nodeId,
    optId,
    nextId,
    composite: {
      ...node,
      answerOptions: [opt],
    },
  };
}

export function sessionAnswerFixture(
  overrides: Partial<{
    id: string;
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
  }> = {},
): SessionAnswer {
  return SessionAnswer.fromPersistence({
    id: overrides.id ?? 'ans-1',
    sessionId: overrides.sessionId ?? 'sess-1',
    questionNodeId: overrides.questionNodeId ?? 'node-root',
    answerOptionId: overrides.answerOptionId ?? 'opt-1',
    answerValue: 'a',
    answeredAt: now(),
  });
}
