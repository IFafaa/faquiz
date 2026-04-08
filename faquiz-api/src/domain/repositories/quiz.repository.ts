import type { Quiz } from '../entities/quiz.entity.js';
import type { QuizTreeInput } from '../entities/quiz-tree-input.js';

export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');

export interface IQuizRepository {
  persist(quiz: Quiz): Promise<Quiz>;
  persistMany(quizzes: Quiz[]): Promise<Quiz[]>;
  delete(id: string, userId: string): Promise<void>;
  findById(id: string): Promise<Quiz | null>;
  findByIdAndUser(id: string, userId: string): Promise<Quiz | null>;
  listByUser(userId: string): Promise<Quiz[]>;
  persistQuizTree(
    quizId: string,
    userId: string,
    tree: QuizTreeInput,
  ): Promise<void>;
}
