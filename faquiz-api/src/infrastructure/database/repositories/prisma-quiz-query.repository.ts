import { Injectable } from '@nestjs/common';
import type {
  IQuizQueryRepository,
  QuizTreeSnapshot,
} from '../../../domain/repositories/quiz-query.repository.js';
import type { AnswerOptionEntity } from '../../../domain/entities/answer-option.entity.js';
import type { QuestionNodeEntity } from '../../../domain/entities/question-node.entity.js';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import { PrismaService } from '../prisma.service.js';
import {
  mapAnswerOption,
  mapQuestionNode,
  mapQuiz,
} from '../mappers/entity-mappers.js';

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
      quiz: mapQuiz(quiz),
      nodes: nodes.map((n) => ({
        ...mapQuestionNode(n),
        answerOptions: n.answerOptions.map(mapAnswerOption),
      })),
    };
  }

  async findPublishedWithRootNode(quizId: string): Promise<{
    quiz: QuizEntity;
    rootNode:
      | (QuestionNodeEntity & { answerOptions: AnswerOptionEntity[] })
      | null;
  } | null> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId, isPublished: true },
    });
    if (!quiz) return null;

    if (!quiz.rootNodeId) {
      return { quiz: mapQuiz(quiz), rootNode: null };
    }

    const root = await this.prisma.questionNode.findFirst({
      where: { id: quiz.rootNodeId, quizId },
      include: { answerOptions: { orderBy: { order: 'asc' } } },
    });
    if (!root) {
      return { quiz: mapQuiz(quiz), rootNode: null };
    }

    return {
      quiz: mapQuiz(quiz),
      rootNode: {
        ...mapQuestionNode(root),
        answerOptions: root.answerOptions.map(mapAnswerOption),
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
      ...mapQuestionNode(node),
      answerOptions: node.answerOptions.map(mapAnswerOption),
    };
  }
}
