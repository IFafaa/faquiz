import { Prisma } from '../../../generated/prisma/client.js';
import type { ResponseFiltersInput } from '../types/response-filters.js';

export function buildQuizSessionWhere(
  quizId: string,
  userId: string,
  filters?: ResponseFiltersInput | null,
): Prisma.QuizSessionWhereInput {
  const base: Prisma.QuizSessionWhereInput = {
    quizId,
    quiz: { id: quizId, userId },
  };

  if (!filters) {
    return base;
  }

  const and: Prisma.QuizSessionWhereInput[] = [];

  const name = filters.respondentNameContains?.trim();
  if (name) {
    and.push({
      respondentName: { contains: name, mode: 'insensitive' },
    });
  }

  const email = filters.respondentEmailContains?.trim();
  if (email) {
    and.push({
      respondentEmail: { contains: email, mode: 'insensitive' },
    });
  }

  const phone = filters.respondentPhoneContains?.trim();
  if (phone) {
    and.push({
      respondentPhone: { contains: phone, mode: 'insensitive' },
    });
  }

  if (filters.status?.length) {
    and.push({ status: { in: filters.status } });
  }

  if (filters.startedAtFrom || filters.startedAtTo) {
    and.push({
      startedAt: {
        ...(filters.startedAtFrom && {
          gte: new Date(filters.startedAtFrom),
        }),
        ...(filters.startedAtTo && { lte: new Date(filters.startedAtTo) }),
      },
    });
  }

  if (filters.completedAtFrom || filters.completedAtTo) {
    and.push({
      AND: [
        { completedAt: { not: null } },
        {
          completedAt: {
            ...(filters.completedAtFrom && {
              gte: new Date(filters.completedAtFrom),
            }),
            ...(filters.completedAtTo && {
              lte: new Date(filters.completedAtTo),
            }),
          },
        },
      ],
    });
  }

  for (const qf of filters.questionFilters ?? []) {
    if (qf.answerValues?.length) {
      and.push({
        answers: {
          some: {
            questionNodeId: qf.questionNodeId,
            answerValue: { in: qf.answerValues },
          },
        },
      });
    }
  }

  if (and.length === 0) {
    return base;
  }

  return {
    ...base,
    AND: and,
  };
}
