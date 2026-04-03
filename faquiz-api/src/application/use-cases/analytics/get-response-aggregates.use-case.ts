import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';
import { buildQuizSessionWhere } from '../../services/build-quiz-session-where.js';
import type { ResponseFiltersInput } from '../../types/response-filters.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';

export type AggregatesResult = {
  quizId: string;
  filteredSessionCount: number;
  questions: Array<{
    questionNodeId: string;
    title: string;
    questionType: string;
    distribution: Array<{ label: string; value: string; count: number }>;
  }>;
  timeline: Array<{ date: string; count: number }>;
};

@Injectable()
export class GetResponseAggregatesUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    quizId: string,
    adminId: string,
    filters?: ResponseFiltersInput | null,
  ): Promise<AggregatesResult> {
    const quiz = await this.quizzes.findByIdAndAdmin(quizId, adminId);
    if (!quiz) {
      throw new NotFoundError('Quiz', quizId);
    }

    const where = buildQuizSessionWhere(quizId, adminId, filters ?? undefined);

    const sessions = await this.prisma.quizSession.findMany({
      where,
      select: { id: true, startedAt: true },
    });
    const sessionIds = sessions.map((s) => s.id);
    const filteredSessionCount = sessionIds.length;

    const nodes = await this.prisma.questionNode.findMany({
      where: { quizId },
      select: { id: true, title: true, questionType: true },
      orderBy: { createdAt: 'asc' },
    });

    const nodeIds = nodes.map((n) => n.id);
    const labelByQuestionValue = new Map<string, string>();
    if (nodeIds.length > 0) {
      const opts = await this.prisma.answerOption.findMany({
        where: { questionNodeId: { in: nodeIds } },
        select: { questionNodeId: true, value: true, label: true },
      });
      for (const o of opts) {
        labelByQuestionValue.set(`${o.questionNodeId}\0${o.value}`, o.label);
      }
    }

    const questions: AggregatesResult['questions'] = [];

    if (sessionIds.length > 0 && nodeIds.length > 0) {
      const groupRows = await this.prisma.sessionAnswer.groupBy({
        by: ['questionNodeId', 'answerValue'],
        where: {
          sessionId: { in: sessionIds },
          questionNodeId: { in: nodeIds },
        },
        _count: { _all: true },
      });

      const byQuestion = new Map<
        string,
        Array<{ value: string; count: number }>
      >();
      for (const row of groupRows) {
        const list = byQuestion.get(row.questionNodeId) ?? [];
        list.push({
          value: row.answerValue,
          count: row._count._all,
        });
        byQuestion.set(row.questionNodeId, list);
      }

      for (const n of nodes) {
        const rows = byQuestion.get(n.id) ?? [];
        const distribution = rows
          .map((r) => ({
            label:
              labelByQuestionValue.get(`${n.id}\0${r.value}`) ?? r.value,
            value: r.value,
            count: r.count,
          }))
          .sort((a, b) => b.count - a.count);
        questions.push({
          questionNodeId: n.id,
          title: n.title,
          questionType: n.questionType,
          distribution,
        });
      }
    } else {
      for (const n of nodes) {
        questions.push({
          questionNodeId: n.id,
          title: n.title,
          questionType: n.questionType,
          distribution: [],
        });
      }
    }

    const timeline = this.buildTimeline(sessions.map((s) => s.startedAt));

    return {
      quizId,
      filteredSessionCount,
      questions,
      timeline,
    };
  }

  private buildTimeline(startedAts: Date[]): Array<{ date: string; count: number }> {
    if (startedAts.length === 0) return [];
    let min = startedAts[0]!;
    let max = startedAts[0]!;
    for (const d of startedAts) {
      if (d < min) min = d;
      if (d > max) max = d;
    }
    const start = new Date(min);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(max);
    end.setUTCHours(0, 0, 0, 0);

    const map = new Map<string, number>();
    for (const d of startedAts) {
      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) ?? 0) + 1);
    }

    const result: Array<{ date: string; count: number }> = [];
    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      result.push({ date: key, count: map.get(key) ?? 0 });
      cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return result;
  }
}
