import type { QuestionTypeValue } from '../value-objects/question-type.js';

export interface QuestionNodeEntity {
  id: string;
  quizId: string;
  title: string;
  description: string;
  questionType: QuestionTypeValue;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
}
