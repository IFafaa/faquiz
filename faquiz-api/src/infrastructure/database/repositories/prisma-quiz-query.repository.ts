import { Injectable } from '@nestjs/common';
import type {
  IQuizQueryRepository,
  QuizTreeSnapshot,
} from '../../../domain/repositories/quiz-query.repository.js';
import type { AnswerOption } from '../../../domain/entities/answer-option.entity.js';
import type { QuestionNode } from '../../../domain/entities/question-node.entity.js';
import type { Quiz } from '../../../domain/entities/quiz.entity.js';
import { PrismaService } from '../prisma.service.js';
import { AnswerOptionMapper } from '../mappers/answer-option.mapper.js';
import { QuestionNodeMapper } from '../mappers/question-node.mapper.js';
import { QuizMapper } from '../mappers/quiz.mapper.js';

@Injectable()
export class PrismaQuizQueryRepository implements IQuizQueryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTreeForAdmin(
    quizId: string,
    adminId: string,
  ): Promise<QuizTreeSnapshot | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, adminId },
    });
    if (!quiz) return null;

    const nodes = await this.prisma.questionNode.findMany({
      where: { quizId },
      include: { answerOptions: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });

    return {
      quiz: QuizMapper.toDomain(quiz),
      nodes: nodes.map((n) => ({
        ...QuestionNodeMapper.toDomain(n),
        answerOptions: n.answerOptions.map((o) => AnswerOptionMapper.toDomain(o)),
      })),
    };
  }

  async findPublishedWithRootNode(quizId: string): Promise<{
    quiz: Quiz;
    rootNode:
      | (QuestionNode & { answerOptions: AnswerOption[] })
      | null;
  } | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, isPublished: true },
    });
    if (!quiz) return null;

    if (!quiz.rootNodeId) {
      return { quiz: QuizMapper.toDomain(quiz), rootNode: null };
    }

    const root = await this.prisma.questionNode.findFirst({
      where: { id: quiz.rootNodeId, quizId },
      include: { answerOptions: { orderBy: { order: 'asc' } } },
    });
    if (!root) {
      return { quiz: QuizMapper.toDomain(quiz), rootNode: null };
    }

    return {
      quiz: QuizMapper.toDomain(quiz),
      rootNode: {
        ...QuestionNodeMapper.toDomain(root),
        answerOptions: root.answerOptions.map((o) =>
          AnswerOptionMapper.toDomain(o),
        ),
      },
    };
  }

  async findQuestionWithOptions(quizId: string, nodeId: string) {
    const node = await this.prisma.questionNode.findFirst({
      where: { id: nodeId, quizId },
      include: { answerOptions: { orderBy: { order: 'asc' } } },
    });
    if (!node) return null;
    return {
      ...QuestionNodeMapper.toDomain(node),
      answerOptions: node.answerOptions.map((o) =>
        AnswerOptionMapper.toDomain(o),
      ),
    };
  }

  async listPublishedQuizzes() {
    const rows = await this.prisma.quiz.findMany({
      where: { isPublished: true, rootNodeId: { not: null } },
      select: { id: true, title: true, description: true },
      orderBy: { updatedAt: 'desc' },
    });
    return rows;
  }

  async countQuestionNodes(quizId: string) {
    return this.prisma.questionNode.count({ where: { quizId } });
  }

  async getQuestionOrdinal(quizId: string, nodeId: string) {
    const rows = await this.prisma.questionNode.findMany({
      where: { quizId },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      select: { id: true },
    });
    const idx = rows.findIndex((r) => r.id === nodeId);
    return idx >= 0 ? idx + 1 : 1;
  }
}
