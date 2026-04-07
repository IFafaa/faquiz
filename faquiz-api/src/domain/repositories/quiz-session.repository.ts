import type { QuizSession } from '../entities/quiz-session.entity.js';
import type { SessionAnswerEntity } from '../entities/session-answer.entity.js';

export const QUIZ_SESSION_REPOSITORY = Symbol('QUIZ_SESSION_REPOSITORY');

export interface IQuizSessionRepository {
  persist(session: QuizSession): Promise<QuizSession>;
  persistMany(sessions: QuizSession[]): Promise<QuizSession[]>;
  findById(id: string): Promise<QuizSession | null>;
  findByIdAndQuizId(
    sessionId: string,
    quizId: string,
  ): Promise<QuizSession | null>;
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
  ): Promise<QuizSession[]>;
  findDetailForAdmin(
    sessionId: string,
    quizId: string,
    adminId: string,
  ): Promise<{
    session: QuizSession;
    answers: SessionAnswerEntity[];
  } | null>;
  countByQuiz(quizId: string): Promise<number>;
  countCompletedByQuiz(quizId: string): Promise<number>;
  sessionsPerDay(
    quizId: string,
    days: number,
  ): Promise<Array<{ date: string; count: number }>>;
}
