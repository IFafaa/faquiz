import { Inject, Injectable } from '@nestjs/common';
import { Quiz } from '../../../domain/entities/quiz.entity.js';
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
    userId: string,
    data: {
      title: string;
      description: string;
      collectName: boolean;
      collectEmail: boolean;
      collectPhone: boolean;
    },
  ): Promise<Quiz> {
    const draft = Quiz.createDraft({
      title: data.title,
      description: data.description ?? '',
      userId,
      collectName: data.collectName,
      collectEmail: data.collectEmail,
      collectPhone: data.collectPhone,
    });
    return this.quizzes.persist(draft);
  }
}
