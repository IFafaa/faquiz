import { Inject, Injectable } from '@nestjs/common';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class ListQuizzesUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(adminId: string): Promise<QuizEntity[]> {
    return this.quizzes.listByAdmin(adminId);
  }
}
