import type { QuizEntity } from '../entities/quiz.entity.js';
import type { QuizTreeInput } from '../entities/quiz-tree-input.js';

export const QUIZ_REPOSITORY = Symbol('QUIZ_REPOSITORY');

export interface IQuizRepository {
  create(data: {
    title: string;
    description: string;
    adminId: string;
    collectName: boolean;
    collectEmail: boolean;
    collectPhone: boolean;
  }): Promise<QuizEntity>;
  update(
    id: string,
    adminId: string,
    data: { title?: string; description?: string; isPublished?: boolean },
  ): Promise<QuizEntity>;
  delete(id: string, adminId: string): Promise<void>;
  findById(id: string): Promise<QuizEntity | null>;
  findByIdAndAdmin(id: string, adminId: string): Promise<QuizEntity | null>;
  listByAdmin(adminId: string): Promise<QuizEntity[]>;
  setRootNodeId(
    quizId: string,
    adminId: string,
    rootNodeId: string | null,
  ): Promise<void>;
  saveTree(quizId: string, adminId: string, tree: QuizTreeInput): Promise<void>;
}
