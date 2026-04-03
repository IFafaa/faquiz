import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { QuizTreeInput } from '../../../domain/entities/quiz-tree-input.js';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class GetQuizTreeUseCase {
  constructor(
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
  ) {}

  async execute(quizId: string, adminId: string) {
    const tree = await this.queries.findTreeForAdmin(quizId, adminId);
    if (!tree) {
      throw new NotFoundError('Quiz', quizId);
    }
    return tree;
  }
}

@Injectable()
export class SaveQuizTreeUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(quizId: string, adminId: string, tree: QuizTreeInput): Promise<void> {
    return this.quizzes.saveTree(quizId, adminId, tree);
  }
}
