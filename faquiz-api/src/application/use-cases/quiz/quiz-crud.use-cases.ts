import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { QuizEntity } from '../../../domain/entities/quiz.entity.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class CreateQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(
    adminId: string,
    data: { title: string; description: string },
  ): Promise<QuizEntity> {
    return this.quizzes.create({
      title: data.title,
      description: data.description ?? '',
      adminId,
    });
  }
}

@Injectable()
export class ListQuizzesUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(adminId: string): Promise<QuizEntity[]> {
    return this.quizzes.listByAdmin(adminId);
  }
}

@Injectable()
export class GetQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  async execute(id: string, adminId: string): Promise<QuizEntity> {
    const quiz = await this.quizzes.findByIdAndAdmin(id, adminId);
    if (!quiz) {
      throw new NotFoundError('Quiz', id);
    }
    return quiz;
  }
}

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

@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(id: string, adminId: string): Promise<void> {
    return this.quizzes.delete(id, adminId);
  }
}
