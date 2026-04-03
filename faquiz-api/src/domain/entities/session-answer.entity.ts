export interface SessionAnswerEntity {
  id: string;
  sessionId: string;
  questionNodeId: string;
  answerOptionId: string | null;
  answerValue: string;
  answeredAt: Date;
}
