export type SessionAnswerPersistenceProps = {
  id: string;
  sessionId: string;
  questionNodeId: string;
  answerOptionId: string | null;
  answerValue: string;
  answeredAt: Date;
};

export class SessionAnswer {
  private constructor(
    public readonly id: string,
    public readonly sessionId: string,
    public readonly questionNodeId: string,
    public readonly answerOptionId: string | null,
    public readonly answerValue: string,
    public readonly answeredAt: Date,
  ) {}

  static fromPersistence(p: SessionAnswerPersistenceProps): SessionAnswer {
    return new SessionAnswer(
      p.id,
      p.sessionId,
      p.questionNodeId,
      p.answerOptionId,
      p.answerValue,
      p.answeredAt,
    );
  }
}
