import type { QuestionNode as PrismaQuestionNode } from '../../../../generated/prisma/client.js';
import {
  QuestionNode,
  type QuestionNodePersistable,
} from '../../../domain/entities/question-node.entity.js';
import type { QuestionTypeValue } from '../../../domain/value-objects/question-type.js';

export class QuestionNodeMapper {
  private constructor() {}

  static toDomain(row: PrismaQuestionNode): QuestionNode {
    return QuestionNode.fromPersistence({
      id: row.id,
      quizId: row.quizId,
      title: row.title,
      description: row.description,
      questionType: row.questionType as QuestionTypeValue,
      positionX: row.positionX,
      positionY: row.positionY,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(node: QuestionNodePersistable): {
    create: {
      id: string;
      quizId: string;
      title: string;
      description: string;
      questionType: string;
      positionX: number;
      positionY: number;
    };
    update: {
      title: string;
      description: string;
      questionType: string;
      positionX: number;
      positionY: number;
    };
  } {
    const { id, quizId, title, description, questionType, positionX, positionY } =
      node;
    return {
      create: {
        id,
        quizId,
        title,
        description,
        questionType,
        positionX,
        positionY,
      },
      update: {
        title,
        description,
        questionType,
        positionX,
        positionY,
      },
    };
  }
}
