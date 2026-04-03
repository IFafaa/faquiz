import type {
  Admin,
  AnswerOption,
  QuestionNode,
  Quiz,
  QuizSession,
  SessionAnswer,
} from '../../../../generated/prisma/client.js';
import type { AdminEntity } from '../../../domain/entities/admin.entity.js';
import type { AnswerOptionEntity } from '../../../domain/entities/answer-option.entity.js';
import type { QuestionNodeEntity } from '../../../domain/entities/question-node.entity.js';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import type { QuizSessionEntity } from '../../../domain/entities/quiz-session.entity.js';
import type { SessionAnswerEntity } from '../../../domain/entities/session-answer.entity.js';
import type { QuestionTypeValue } from '../../../domain/value-objects/question-type.js';
import type { SessionStatusValue } from '../../../domain/value-objects/session-status.js';

export function mapAdmin(row: Admin): AdminEntity {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapQuiz(row: Quiz): QuizEntity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isPublished: row.isPublished,
    rootNodeId: row.rootNodeId,
    adminId: row.adminId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapQuestionNode(row: QuestionNode): QuestionNodeEntity {
  return {
    id: row.id,
    quizId: row.quizId,
    title: row.title,
    description: row.description,
    questionType: row.questionType as QuestionTypeValue,
    positionX: row.positionX,
    positionY: row.positionY,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapAnswerOption(row: AnswerOption): AnswerOptionEntity {
  return {
    id: row.id,
    questionNodeId: row.questionNodeId,
    label: row.label,
    value: row.value,
    order: row.order,
    nextQuestionNodeId: row.nextQuestionNodeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapQuizSession(row: QuizSession): QuizSessionEntity {
  return {
    id: row.id,
    quizId: row.quizId,
    respondentName: row.respondentName,
    status: row.status as SessionStatusValue,
    pathTaken: row.pathTaken,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
  };
}

export function mapSessionAnswer(row: SessionAnswer): SessionAnswerEntity {
  return {
    id: row.id,
    sessionId: row.sessionId,
    questionNodeId: row.questionNodeId,
    answerOptionId: row.answerOptionId,
    answerValue: row.answerValue,
    answeredAt: row.answeredAt,
  };
}
