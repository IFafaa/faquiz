import { Inject, Injectable, PayloadTooLargeException } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { buildQuizSessionWhere } from '../../services/build-quiz-session-where.js';
import type { ResponseFiltersInput } from '../../types/response-filters.js';

export const MAX_EXPORT_ANSWER_ROWS = 50_000;

@Injectable()
export class ExportResponsesExcelUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    quizId: string,
    adminId: string,
    filters?: ResponseFiltersInput | null,
  ): Promise<Buffer> {
    const quiz = await this.quizzes.findByIdAndAdmin(quizId, adminId);
    if (!quiz) {
      throw new NotFoundError('Quiz', quizId);
    }

    const where = buildQuizSessionWhere(quizId, adminId, filters ?? undefined);

    const sessions = await this.prisma.quizSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
    });

    const sessionIds = sessions.map((s) => s.id);

    if (sessionIds.length === 0) {
      const workbook = new ExcelJS.Workbook();
      workbook.addWorksheet('Sessões').addRow([
        'id',
        'respondente',
        'email',
        'telefone',
        'status',
        'iniciadoEm',
        'concluidoEm',
      ]);
      workbook.addWorksheet('Respostas').addRow([
        'sessionId',
        'respondente',
        'email',
        'telefone',
        'pergunta',
        'valor',
        'label',
        'respondidoEm',
      ]);
      const buf = await workbook.xlsx.writeBuffer();
      return Buffer.from(buf);
    }

    const answerCount = await this.prisma.sessionAnswer.count({
      where: { sessionId: { in: sessionIds } },
    });

    if (answerCount > MAX_EXPORT_ANSWER_ROWS) {
      throw new PayloadTooLargeException(
        `Exportação limitada a ${MAX_EXPORT_ANSWER_ROWS} linhas na aba Respostas (atual: ${answerCount}). Aplique filtros mais restritivos.`,
      );
    }

    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId: { in: sessionIds } },
      orderBy: [{ sessionId: 'asc' }, { answeredAt: 'asc' }],
      include: {
        questionNode: { select: { title: true } },
        answerOption: { select: { label: true } },
        session: {
          select: {
            respondentName: true,
            respondentEmail: true,
            respondentPhone: true,
          },
        },
      },
    });

    const workbook = new ExcelJS.Workbook();

    const wsSess = workbook.addWorksheet('Sessões');
    wsSess.addRow([
      'id',
      'respondente',
      'email',
      'telefone',
      'status',
      'iniciadoEm',
      'concluidoEm',
    ]);
    for (const s of sessions) {
      wsSess.addRow([
        s.id,
        s.respondentName,
        s.respondentEmail,
        s.respondentPhone,
        s.status,
        s.startedAt.toISOString(),
        s.completedAt?.toISOString() ?? '',
      ]);
    }

    const wsAns = workbook.addWorksheet('Respostas');
    wsAns.addRow([
      'sessionId',
      'respondente',
      'email',
      'telefone',
      'pergunta',
      'valor',
      'label',
      'respondidoEm',
    ]);
    for (const a of answers) {
      wsAns.addRow([
        a.sessionId,
        a.session.respondentName,
        a.session.respondentEmail,
        a.session.respondentPhone,
        a.questionNode.title,
        a.answerValue,
        a.answerOption?.label ?? '',
        a.answeredAt.toISOString(),
      ]);
    }

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }
}
