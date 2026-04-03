import type { QuestionTypeValue } from '../value-objects/question-type.js';

export interface QuizTreeAnswerOptionInput {
  id: string;
  label: string;
  value: string;
  order: number;
  nextQuestionNodeId: string | null;
}

export interface QuizTreeNodeInput {
  id: string;
  title: string;
  description: string;
  questionType: QuestionTypeValue;
  positionX: number;
  positionY: number;
  answerOptions: QuizTreeAnswerOptionInput[];
}

export interface QuizTreeInput {
  rootNodeId: string | null;
  nodes: QuizTreeNodeInput[];
}
