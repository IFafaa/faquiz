import type { QuizSession as PrismaQuizSessionRow } from '../../../../generated/prisma/client.js';
import { QuizSession } from '../../../domain/entities/quiz-session.entity.js';
import type { SessionStatusValue } from '../../../domain/value-objects/session-status.js';

export class QuizSessionMapper {
  private constructor() {}

  static toDomain(row: PrismaQuizSessionRow): QuizSession {
    return QuizSession.fromPersistence({
      id: row.id,
      quizId: row.quizId,
      respondentName: row.respondentName,
      respondentEmail: row.respondentEmail,
      respondentPhone: row.respondentPhone,
      status: row.status as SessionStatusValue,
      pathTaken: row.pathTaken,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
    });
  }

  static toPersistence(session: QuizSession): {
    create: {
      quizId: string;
      respondentName: string;
      respondentEmail: string;
      respondentPhone: string;
      status: string;
      pathTaken: string;
      completedAt: Date | null;
    };
    update: {
      pathTaken: string;
      status: string;
      completedAt: Date | null;
    };
  } {
    return {
      create: {
        quizId: session.quizId,
        respondentName: session.respondentName ?? '',
        respondentEmail: session.respondentEmail ?? '',
        respondentPhone: session.respondentPhone ?? '',
        status: session.status,
        pathTaken: session.pathTaken,
        completedAt: session.completedAt,
      },
      update: {
        pathTaken: session.pathTaken,
        status: session.status,
        completedAt: session.completedAt,
      },
    };
  }
}
