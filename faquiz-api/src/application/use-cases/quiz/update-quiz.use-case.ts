import { Inject, Injectable } from '@nestjs/common';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(
    id: string,
    adminId: string,
    data: { title?: string; description?: string; isPublished?: boolean },
  ): Promise<QuizEntity> {
    return this.quizzes.update(id, adminId, data);
  }
}
