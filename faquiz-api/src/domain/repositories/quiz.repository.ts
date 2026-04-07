import type { Quiz } from '../entities/quiz.entity.js';
import type { QuizTreeInput } from '../entities/quiz-tree-input.js';

export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');

export interface IQuizRepository {
  persist(quiz: Quiz): Promise<Quiz>;
  persistMany(quizzes: Quiz[]): Promise<Quiz[]>;
  delete(id: string, adminId: string): Promise<void>;
  findById(id: string): Promise<Quiz | null>;
  findByIdAndAdmin(id: string, adminId: string): Promise<Quiz | null>;
  listByAdmin(adminId: string): Promise<Quiz[]>;
  persistQuizTree(
    quizId: string,
    adminId: string,
    tree: QuizTreeInput,
  ): Promise<void>;
}
