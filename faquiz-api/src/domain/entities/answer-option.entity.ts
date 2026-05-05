export type AnswerOptionPersistenceProps = {
  id: string;
  questionNodeId: string;
  label: string;
  value: string;
  order: number;
  nextQuestionNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type AnswerOptionPersistable = Omit<
  AnswerOptionPersistenceProps,
  'createdAt' | 'updatedAt'
>;

export class AnswerOption {
  private constructor(
    public readonly id: string,
    public readonly questionNodeId: string,
    public readonly label: string,
    public readonly value: string,
    public readonly order: number,
    public readonly nextQuestionNodeId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(p: AnswerOptionPersistenceProps): AnswerOption {
    return new AnswerOption(
      p.id,
      p.questionNodeId,
      p.label,
      p.value,
      p.order,
      p.nextQuestionNodeId,
      p.createdAt,
      p.updatedAt,
    );
  }
}
