import type { SessionAnswer as PrismaSessionAnswer } from '../../../../generated/prisma/client.js';
import { SessionAnswer } from '../../../domain/entities/session-answer.entity.js';

export class SessionAnswerMapper {
  private constructor() {}

  static toDomain(row: PrismaSessionAnswer): SessionAnswer {
    return SessionAnswer.fromPersistence({
      id: row.id,
      sessionId: row.sessionId,
      questionNodeId: row.questionNodeId,
      answerOptionId: row.answerOptionId,
      answerValue: row.answerValue,
      answeredAt: row.answeredAt,
    });
  }

  static toPersistence(data: {
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
    answerValue: string;
  }): {
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
    answerValue: string;
  } {
    return {
      sessionId: data.sessionId,
      questionNodeId: data.questionNodeId,
      answerOptionId: data.answerOptionId,
      answerValue: data.answerValue,
    };
  }
}
