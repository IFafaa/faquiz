import { Injectable } from '@nestjs/common';
import type { IQuizSessionRepository } from '../../../domain/repositories/quiz-session.repository.js';
import type { QuizSession } from '../../../domain/entities/quiz-session.entity.js';
import { PrismaService } from '../prisma.service.js';
import { mapQuizSession, mapSessionAnswer } from '../mappers/entity-mappers.js';

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
      const row = await this.prisma.quizSession.create({
        data: {
          quizId: session.quizId,
          respondentName: session.respondentName ?? '',
          respondentEmail: session.respondentEmail ?? '',
          respondentPhone: session.respondentPhone ?? '',
          status: session.status,
          pathTaken: session.pathTaken,
          completedAt: session.completedAt,
        },
      });
      return mapQuizSession(row);
    }

    await this.prisma.quizSession.update({
      where: { id: session.id },
      data: {
        pathTaken: session.pathTaken,
        status: session.status,
        completedAt: session.completedAt,
      },
    });
    return session;
  }

  async findById(id: string) {
    const row = await this.prisma.quizSession.findUnique({ where: { id } });
    return row ? mapQuizSession(row) : null;
  }

  async findByIdAndQuizId(sessionId: string, quizId: string) {
    const row = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, quizId },
    });
    return row ? mapQuizSession(row) : null;
  }

  async addAnswer(data: {
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
    answerValue: string;
  }) {
    const row = await this.prisma.sessionAnswer.create({
      data: {
        sessionId: data.sessionId,
        questionNodeId: data.questionNodeId,
        answerOptionId: data.answerOptionId,
        answerValue: data.answerValue,
      },
    });
    return mapSessionAnswer(row);
  }

  async listAnswersForSession(sessionId: string) {
    const rows = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });
    return rows.map(mapSessionAnswer);
  }

  async removeLastAnswer(sessionId: string) {
    const last = await this.prisma.sessionAnswer.findFirst({
      where: { sessionId },
      orderBy: { answeredAt: 'desc' },
    });
    if (!last) return null;
    await this.prisma.sessionAnswer.delete({ where: { id: last.id } });
    return mapSessionAnswer(last);
  }

  async listByQuizForAdmin(quizId: string, adminId: string) {
    const rows = await this.prisma.quizSession.findMany({
      where: { quiz: { id: quizId, adminId } },
      orderBy: { startedAt: 'desc' },
    });
    return rows.map(mapQuizSession);
  }

  async findDetailForAdmin(sessionId: string, quizId: string, adminId: string) {
    const session = await this.prisma.quizSession.findFirst({
      where: { id: sessionId, quizId, quiz: { adminId } },
    });
    if (!session) return null;
    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId },
      orderBy: { answeredAt: 'asc' },
    });
    return {
      session: mapQuizSession(session),
      answers: answers.map(mapSessionAnswer),
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
