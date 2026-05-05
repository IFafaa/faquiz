import { Injectable } from '@nestjs/common';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { Quiz } from '../../../domain/entities/quiz.entity.js';
import type { QuizTreeInput } from '../../../domain/entities/quiz-tree-input.js';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { PrismaService } from '../prisma.service.js';
import { AnswerOptionMapper } from '../mappers/answer-option.mapper.js';
import { QuestionNodeMapper } from '../mappers/question-node.mapper.js';
import { QuizMapper } from '../mappers/quiz.mapper.js';

@Injectable()
export class PrismaQuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async persist(quiz: Quiz): Promise<Quiz> {
    return this.persistOne(quiz);
  }

  async persistMany(quizzes: Quiz[]): Promise<Quiz[]> {
    return Promise.all(quizzes.map((q) => this.persistOne(q)));
  }

  private async persistOne(quiz: Quiz): Promise<Quiz> {
    if (quiz.isNew()) {
      const { create } = QuizMapper.toPersistence(quiz);
      const row = await this.prisma.quiz.create({
        data: create,
      });
      return QuizMapper.toDomain(row);
    }

    const found = await this.prisma.quiz.findFirst({
      where: { id: quiz.id, userId: quiz.userId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', quiz.id);
    }
    const { update } = QuizMapper.toPersistence(quiz);
    const row = await this.prisma.quiz.update({
      where: { id: quiz.id },
      data: update,
    });
    return QuizMapper.toDomain(row);
  }

  async delete(id: string, userId: string): Promise<void> {
    const found = await this.prisma.quiz.findFirst({
      where: { id, userId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', id);
    }
    await this.prisma.quiz.delete({ where: { id } });
  }

  async findById(id: string): Promise<Quiz | null> {
    const row = await this.prisma.quiz.findUnique({ where: { id } });
    return row ? QuizMapper.toDomain(row) : null;
  }

  async findByIdAndUser(id: string, userId: string): Promise<Quiz | null> {
    const row = await this.prisma.quiz.findFirst({
      where: { id, userId },
    });
    return row ? QuizMapper.toDomain(row) : null;
  }

  async listByUser(userId: string): Promise<Quiz[]> {
    const rows = await this.prisma.quiz.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map((row) => QuizMapper.toDomain(row));
  }

  async persistQuizTree(
    quizId: string,
    userId: string,
    tree: QuizTreeInput,
  ): Promise<void> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, userId },
    });
    if (!quiz) {
      throw new NotFoundError('Quiz', quizId);
    }

    await this.prisma.$transaction(async (tx) => {
      const existingNodes = await tx.questionNode.findMany({
        where: { quizId },
        select: { id: true },
      });
      const incoming = new Set(tree.nodes.map((n) => n.id));
      const toRemove = existingNodes
        .map((n) => n.id)
        .filter((id) => !incoming.has(id));
      if (toRemove.length > 0) {
        await tx.questionNode.deleteMany({
          where: { id: { in: toRemove }, quizId },
        });
      }

      for (const node of tree.nodes) {
        const { answerOptions: _a, ...nodeFields } = node;
        const { create, update } = QuestionNodeMapper.toPersistence({
          ...nodeFields,
          quizId,
        });
        await tx.questionNode.upsert({
          where: { id: node.id },
          create,
          update,
        });
      }

      for (const node of tree.nodes) {
        const optIds = new Set(node.answerOptions.map((o) => o.id));
        const existingOpts = await tx.answerOption.findMany({
          where: { questionNodeId: node.id },
          select: { id: true },
        });
        const optsToRemove = existingOpts
          .map((o) => o.id)
          .filter((id) => !optIds.has(id));
        if (optsToRemove.length > 0) {
          await tx.answerOption.deleteMany({
            where: { id: { in: optsToRemove } },
          });
        }

        for (const opt of node.answerOptions) {
          const { create: optCreate, update: optUpdate } =
            AnswerOptionMapper.toPersistence({
              id: opt.id,
              questionNodeId: node.id,
              label: opt.label,
              value: opt.value,
              order: opt.order,
              nextQuestionNodeId: opt.nextQuestionNodeId,
            });
          await tx.answerOption.upsert({
            where: { id: opt.id },
            create: optCreate,
            update: optUpdate,
          });
        }
      }

      await tx.quiz.update({
        where: { id: quizId },
        data: { rootNodeId: tree.rootNodeId },
      });
    });
  }
}
