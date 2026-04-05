import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';

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
