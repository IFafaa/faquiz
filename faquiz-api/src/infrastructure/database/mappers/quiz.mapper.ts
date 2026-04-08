import type { Quiz as PrismaQuizRow } from '../../../../generated/prisma/client.js';
import { Quiz } from '../../../domain/entities/quiz.entity.js';

export class QuizMapper {
  private constructor() {}

  static toDomain(row: PrismaQuizRow): Quiz {
    return Quiz.fromPersistence({
      id: row.id,
      title: row.title,
      description: row.description,
      isPublished: row.isPublished,
      collectName: row.collectName,
      collectEmail: row.collectEmail,
      collectPhone: row.collectPhone,
      rootNodeId: row.rootNodeId,
      adminId: row.adminId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(quiz: Quiz): {
    create: {
      title: string;
      description: string;
      isPublished: boolean;
      collectName: boolean;
      collectEmail: boolean;
      collectPhone: boolean;
      rootNodeId: string | null;
      adminId: string;
    };
    update: {
      title: string;
      description: string;
      isPublished: boolean;
      collectName: boolean;
      collectEmail: boolean;
      collectPhone: boolean;
      rootNodeId: string | null;
    };
  } {
    const update = {
      title: quiz.title,
      description: quiz.description,
      isPublished: quiz.isPublished,
      collectName: quiz.collectName,
      collectEmail: quiz.collectEmail,
      collectPhone: quiz.collectPhone,
      rootNodeId: quiz.rootNodeId,
    };
    return {
      create: { ...update, adminId: quiz.adminId },
      update,
    };
  }
}
