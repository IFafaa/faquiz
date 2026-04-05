import { Inject, Injectable } from '@nestjs/common';
import type { QuizTreeInput } from '../../../domain/entities/quiz-tree-input.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';

@Injectable()
export class SaveQuizTreeUseCase {
  constructor(
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
  ) {}

  execute(quizId: string, adminId: string, tree: QuizTreeInput): Promise<void> {
    return this.quizzes.saveTree(quizId, adminId, tree);
  }
}
