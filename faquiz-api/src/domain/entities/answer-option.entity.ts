export interface AnswerOptionEntity {
  id: string;
  questionNodeId: string;
  label: string;
  value: string;
  order: number;
  nextQuestionNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
