import { Inject, Injectable } from '@nestjs/common';
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
    data: {
      title: string;
      description: string;
      collectName: boolean;
      collectEmail: boolean;
      collectPhone: boolean;
    },
  ): Promise<QuizEntity> {
    return this.quizzes.create({
      title: data.title,
      description: data.description ?? '',
      adminId,
      collectName: data.collectName,
      collectEmail: data.collectEmail,
      collectPhone: data.collectPhone,
    });
  }
}
