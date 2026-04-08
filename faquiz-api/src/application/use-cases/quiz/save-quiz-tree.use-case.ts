import { Inject, Injectable } from '@nestjs/common';
import { QuizTree } from '../../../domain/entities/quiz-tree.entity.js';
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

  execute(quizId: string, userId: string, tree: QuizTreeInput): Promise<void> {
    const quizTree = new QuizTree(tree);
    quizTree.validate();
    return this.quizzes.persistQuizTree(quizId, userId, quizTree.getInput());
  }
}
