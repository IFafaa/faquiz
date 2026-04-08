import { Injectable } from '@nestjs/common';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import type { QuizSession } from '../../../domain/entities/quiz-session.entity.js';
import { PrismaService } from '../prisma.service.js';
import { QuizSessionMapper } from '../mappers/quiz-session.mapper.js';
import { SessionAnswerMapper } from '../mappers/session-answer.mapper.js';

@Injectable()
export class PrismaQuizSessionRepository implements IQuizSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async persist(session: QuizSession): Promise<QuizSession> {
    return this.persistOne(session);
  }

  async persistMany(sessions: QuizSession[]): Promise<QuizSession[]> {
    return Promise.all(sessions.map((s) => this.persistOne(s)));
  }

  private async persistOne(session: QuizSession): Promise<QuizSession> {
    if (session.isNew()) {
      const { create } = QuizSessionMapper.toPersistence(session);
      const row = await this.prisma.quizSession.create({
        data: create,
      });
      return QuizSessionMapper.toDomain(row);
    }

    const { update } = QuizSessionMapper.toPersistence(session);
    await this.prisma.quizSession.update({
      where: { id: session.id },
      data: update,
    });
    return session;
  }

  async findById(id: string) {
    const row = await this.prisma.quizSession.findUnique({ where: { id } });
    return row ? QuizSessionMapper.toDomain(row) : null;
  }

  async findByIdAndQuizId(sessionId: string, quizId: string) {
    const row = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, quizId },
    });
    return row ? QuizSessionMapper.toDomain(row) : null;
  }

  async addAnswer(data: {
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
    answerValue: string;
  }) {
    const row = await this.prisma.sessionAnswer.create({
      data: SessionAnswerMapper.toPersistence(data),
    });
    return SessionAnswerMapper.toDomain(row);
  }

  async listAnswersForSession(sessionId: string) {
    const rows = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });
    return rows.map((r) => SessionAnswerMapper.toDomain(r));
  }

  async removeLastAnswer(sessionId: string) {
    const last = await this.prisma.sessionAnswer.findFirst({
      where: { sessionId },
      orderBy: { answeredAt: 'desc' },
    });
    if (!last) return null;
    await this.prisma.sessionAnswer.delete({ where: { id: last.id } });
    return SessionAnswerMapper.toDomain(last);
  }

  async listByQuizForUser(quizId: string, userId: string) {
    const rows = await this.prisma.quizSession.findMany({
      where: { quiz: { id: quizId, userId } },
      orderBy: { startedAt: 'desc' },
    });
    return rows.map((r) => QuizSessionMapper.toDomain(r));
  }

  async findDetailForUser(sessionId: string, quizId: string, userId: string) {
    const session = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, quizId, quiz: { userId } },
    });
    if (!session) return null;
    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });
    return {
      session: QuizSessionMapper.toDomain(session),
      answers: answers.map((a) => SessionAnswerMapper.toDomain(a)),
    };
  }

  async countByQuiz(quizId: string): Promise<number> {
    return this.prisma.quizSession.count({ where: { quizId } });
  }

  async countCompletedByQuiz(quizId: string): Promise<number> {
    return this.prisma.quizSession.count({
      where: { quizId, status: 'completed' },
    });
  }

  async sessionsPerDay(
    quizId: string,
    days: number,
  ): Promise<Array<{ date: string; count: number }>> {
    const endUtc = new Date();
    endUtc.setUTCHours(0, 0, 0, 0);

    const since = new Date(endUtc);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const sessions = await this.prisma.quizSession.findMany({
      where: { quizId, startedAt: { gte: since } },
      select: { startedAt: true },
    });

    const map = new Map<string, number>();
    for (const s of sessions) {
      const d = s.startedAt.toISOString().slice(0, 10);
      map.set(d, (map.get(d) ?? 0) + 1);
    }

    const result: Array<{ date: string; count: number }> = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setUTCDate(d.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      result.push({ date: key, count: map.get(key) ?? 0 });
    }
    return result;
  }
}
