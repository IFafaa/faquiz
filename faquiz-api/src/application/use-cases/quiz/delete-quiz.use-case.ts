import { Inject, Injectable } from '@nestjs/common';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class DeleteQuizUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(id: string, adminId: string): Promise<void> {
    return this.quizzes.delete(id, adminId);
  }
}
