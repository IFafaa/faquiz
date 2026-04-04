import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';

@Injectable()
export class ListPublishedQuizzesUseCase {
  constructor(
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
  ) {}

  execute() {
    return this.queries.listPublishedQuizzes();
  }
}
