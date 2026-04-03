import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';

@Injectable()
export class GetPublicQuizUseCase {
  constructor(
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
  ) {}

  async execute(quizId: string) {
    const data = await this.queries.findPublishedWithRootNode(quizId);
    if (!data) {
      throw new NotFoundError('Quiz', quizId);
    }
    return data;
  }
}
