import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { Quiz } from '../../../domain/entities/quiz.entity.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class GetQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  async execute(id: string, userId: string): Promise<Quiz> {
    const quiz = await this.quizzes.findByIdAndUser(id, userId);
    if (!quiz) {
      throw new NotFoundError('Quiz', id);
    }
    return quiz;
  }
}
