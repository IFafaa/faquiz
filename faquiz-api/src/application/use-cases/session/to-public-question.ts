import type { IQuizQueryRepository } from '../../../domain/repositories/quiz-query.repository.js';

export function toPublicQuestion(
  node: Awaited<ReturnType<IQuizQueryRepository['findQuestionWithOptions']>>,
) {
  if (!node) return null;
  return {
    id: node.id,
    title: node.title,
    description: node.description,
    questionType: node.questionType,
    answerOptions: node.answerOptions.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value,
      order: o.order,
    })),
  };
}
