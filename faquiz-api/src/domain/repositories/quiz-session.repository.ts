import type { QuizSessionEntity } from '../entities/quiz-session.entity.js';
import type { SessionAnswerEntity } from '../entities/session-answer.entity.js';

export const QUIZ_SESSION_REPOSITORY = Symbol('QUIZ_SESSION_REPOSITORY');

export interface IQuizSessionRepository {
  create(data: {
    quizId: string;
    respondentName: string;
    respondentEmail: string;
    respondentPhone: string;
  }): Promise<QuizSessionEntity>;
  findById(id: string): Promise<QuizSessionEntity | null>;
  findByIdAndQuizId(
    sessionId: string,
    quizId: string,
  ): Promise<QuizSessionEntity | null>;
  updatePathAndStatus(
    sessionId: string,
    pathTaken: string,
    status: QuizSessionEntity['status'],
    completedAt: Date | null,
  ): Promise<void>;
  addAnswer(data: {
    sessionId: string;
    questionNodeId: string;
    answerOptionId: string | null;
    answerValue: string;
  }): Promise<SessionAnswerEntity>;
  listAnswersForSession(sessionId: string): Promise<SessionAnswerEntity[]>;
  removeLastAnswer(sessionId: string): Promise<SessionAnswerEntity | null>;
  listByQuizForAdmin(
    quizId: string,
    adminId: string,
  ): Promise<QuizSessionEntity[]>;
  findDetailForAdmin(
    sessionId: string,
    quizId: string,
    adminId: string,
  ): Promise<{
    session: QuizSessionEntity;
    answers: SessionAnswerEntity[];
  } | null>;
  countByQuiz(quizId: string): Promise<number>;
  countCompletedByQuiz(quizId: string): Promise<number>;
  sessionsPerDay(quizId: string, days: number): Promise<Array<{ date: string; count: number }>>;
}
