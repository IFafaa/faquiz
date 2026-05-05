import type { AnswerOption as PrismaAnswerOption } from '../../../../generated/prisma/client.js';
import {
  AnswerOption,
  type AnswerOptionPersistable,
} from '../../../domain/entities/answer-option.entity.js';

export class AnswerOptionMapper {
  private constructor() {}

  static toDomain(row: PrismaAnswerOption): AnswerOption {
    return AnswerOption.fromPersistence({
      id: row.id,
      questionNodeId: row.questionNodeId,
      label: row.label,
      value: row.value,
      order: row.order,
      nextQuestionNodeId: row.nextQuestionNodeId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(opt: AnswerOptionPersistable): {
    create: {
      id: string;
      questionNodeId: string;
      label: string;
      value: string;
      order: number;
      nextQuestionNodeId: string | null;
    };
    update: {
      questionNodeId: string;
      label: string;
      value: string;
      order: number;
      nextQuestionNodeId: string | null;
    };
  } {
    const {
      id,
      questionNodeId,
      label,
      value,
      order,
      nextQuestionNodeId,
    } = opt;
    return {
      create: {
        id,
        questionNodeId,
        label,
        value,
        order,
        nextQuestionNodeId,
      },
      update: {
        questionNodeId,
        label,
        value,
        order,
        nextQuestionNodeId,
      },
    };
  }
}
