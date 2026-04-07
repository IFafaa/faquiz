import { ValidationError } from '../errors/validation.error.js';
import type { QuizTreeInput } from './quiz-tree-input.js';

export class QuizTree {
  constructor(private readonly input: QuizTreeInput) {}

  validate(): void {
    const nodeIds = new Set(this.input.nodes.map((n) => n.id));
    if (this.input.rootNodeId !== null && !nodeIds.has(this.input.rootNodeId)) {
      throw new ValidationError('rootNodeId deve referenciar um nó do payload');
    }

    for (const node of this.input.nodes) {
      for (const opt of node.answerOptions) {
        if (
          opt.nextQuestionNodeId !== null &&
          !nodeIds.has(opt.nextQuestionNodeId)
        ) {
          throw new ValidationError(
            `nextQuestionNodeId inválido na opção ${opt.id}`,
          );
        }
      }
    }
  }

  getInput(): QuizTreeInput {
    return this.input;
  }
}
