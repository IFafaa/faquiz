import { Injectable } from '@nestjs/common';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import type { QuizTreeInput } from '../../../domain/entities/quiz-tree-input.js';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { PrismaService } from '../prisma.service.js';
import { mapQuiz } from '../mappers/entity-mappers.js';

@Injectable()
export class PrismaQuizRepository implements IQuizRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description: string;
    adminId: string;
  }): Promise<QuizEntity> {
    const row = await this.prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description,
        adminId: data.adminId,
      },
    });
    return mapQuiz(row);
  }

  async update(
    id: string,
    adminId: string,
    data: { title?: string; description?: string; isPublished?: boolean },
  ): Promise<QuizEntity> {
    const found = await this.prisma.quiz.findFirst({
      where: { id, adminId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', id);
    }
    const row = await this.prisma.quiz.update({
      where: { id },
      data,
    });
    return mapQuiz(row);
  }

  async delete(id: string, adminId: string): Promise<void> {
    const found = await this.prisma.quiz.findFirst({
      where: { id, adminId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', id);
    }
    await this.prisma.quiz.delete({ where: { id } });
  }

  async findById(id: string): Promise<QuizEntity | null> {
    const row = await this.prisma.quiz.findUnique({ where: { id } });
    return row ? mapQuiz(row) : null;
  }

  async findByIdAndAdmin(
    id: string,
    adminId: string,
  ): Promise<QuizEntity | null> {
    const row = await this.prisma.quiz.findFirst({
      where: { id, adminId },
    });
    return row ? mapQuiz(row) : null;
  }

  async listByAdmin(adminId: string): Promise<QuizEntity[]> {
    const rows = await this.prisma.quiz.findMany({
      where: { adminId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(mapQuiz);
  }

  async setRootNodeId(
    quizId: string,
    adminId: string,
    rootNodeId: string | null,
  ): Promise<void> {
    const found = await this.prisma.quiz.findFirst({
      where: { id: quizId, adminId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', quizId);
    }
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { rootNodeId },
    });
  }

  async saveTree(
    quizId: string,
    adminId: string,
    tree: QuizTreeInput,
  ): Promise<void> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, adminId },
    });
    if (!quiz) {
      throw new ValidationError('Quiz não encontrado ou sem permissão');
    }

    const nodeIds = new Set(tree.nodes.map((n) => n.id));
    if (tree.rootNodeId !== null && !nodeIds.has(tree.rootNodeId)) {
      throw new ValidationError('rootNodeId deve referenciar um nó do payload');
    }

    for (const node of tree.nodes) {
      for (const opt of node.answerOptions) {
        if (
          opt.nextQuestionNodeId !== null &&
          !nodeIds.has(opt.nextQuestionNodeId)
        ) {
          throw new ValidationError(
            `nextQuestionNodeId inválido na opção ${opt.id}`,
          );
        }
      }
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
        await tx.questionNode.upsert({
          where: { id: node.id },
          create: {
            id: node.id,
            quizId,
            title: node.title,
            description: node.description,
            questionType: node.questionType,
            positionX: node.positionX,
            positionY: node.positionY,
          },
          update: {
            title: node.title,
            description: node.description,
            questionType: node.questionType,
            positionX: node.positionX,
            positionY: node.positionY,
          },
        });

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
          await tx.answerOption.upsert({
            where: { id: opt.id },
            create: {
              id: opt.id,
              questionNodeId: node.id,
              label: opt.label,
              value: opt.value,
              order: opt.order,
              nextQuestionNodeId: opt.nextQuestionNodeId,
            },
            update: {
              label: opt.label,
              value: opt.value,
              order: opt.order,
              nextQuestionNodeId: opt.nextQuestionNodeId,
            },
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
