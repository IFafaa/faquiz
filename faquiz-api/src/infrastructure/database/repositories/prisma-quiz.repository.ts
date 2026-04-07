import { Injectable } from '@nestjs/common';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { Quiz } from '../../../domain/entities/quiz.entity.js';
import type { QuizTreeInput } from '../../../domain/entities/quiz-tree-input.js';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { PrismaService } from '../prisma.service.js';
import { mapQuiz } from '../mappers/entity-mappers.js';

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
      const row = await this.prisma.quiz.create({
        data: {
          title: quiz.title,
          description: quiz.description,
          isPublished: quiz.isPublished,
          collectName: quiz.collectName,
          collectEmail: quiz.collectEmail,
          collectPhone: quiz.collectPhone,
          rootNodeId: quiz.rootNodeId,
          adminId: quiz.adminId,
        },
      });
      return mapQuiz(row);
    }

    const found = await this.prisma.quiz.findFirst({
      where: { id: quiz.id, adminId: quiz.adminId },
    });
    if (!found) {
      throw new NotFoundError('Quiz', quiz.id);
    }
    const row = await this.prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        title: quiz.title,
        description: quiz.description,
        isPublished: quiz.isPublished,
        collectName: quiz.collectName,
        collectEmail: quiz.collectEmail,
        collectPhone: quiz.collectPhone,
        rootNodeId: quiz.rootNodeId,
      },
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

  async findById(id: string): Promise<Quiz | null> {
    const row = await this.prisma.quiz.findUnique({ where: { id } });
    return row ? mapQuiz(row) : null;
  }

  async findByIdAndAdmin(id: string, adminId: string): Promise<Quiz | null> {
    const row = await this.prisma.quiz.findFirst({
      where: { id, adminId },
    });
    return row ? mapQuiz(row) : null;
  }

  async listByAdmin(adminId: string): Promise<Quiz[]> {
    const rows = await this.prisma.quiz.findMany({
      where: { adminId },
      orderBy: { updatedAt: 'desc' },
    });
    return rows.map(mapQuiz);
  }

  async persistQuizTree(
    quizId: string,
    adminId: string,
    tree: QuizTreeInput,
  ): Promise<void> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, adminId },
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
              questionNodeId: node.id,
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
