import type { SessionStatusValue } from '../value-objects/session-status.js';

export interface QuizSessionEntity {
  id: string;
  quizId: string;
  respondentName: string;
  respondentEmail: string;
  respondentPhone: string;
  status: SessionStatusValue;
  pathTaken: string;
  startedAt: Date;
  completedAt: Date | null;
}
