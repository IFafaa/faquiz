import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { type Quiz } from '../../../domain/entities/quiz.entity.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class UpdateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  async execute(
    id: string,
    adminId: string,
    data: { title?: string; description?: string; isPublished?: boolean },
  ): Promise<Quiz> {
    const quiz = await this.quizzes.findByIdAndAdmin(id, adminId);
    if (!quiz) {
      throw new NotFoundError('Quiz', id);
    }
    quiz.update(data);
    return this.quizzes.persist(quiz);
  }
}
