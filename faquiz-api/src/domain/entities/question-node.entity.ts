import type { QuestionTypeValue } from '../value-objects/question-type.js';

export type QuestionNodePersistenceProps = {
  id: string;
  quizId: string;
  title: string;
  description: string;
  questionType: QuestionTypeValue;
  positionX: number;
  positionY: number;
  createdAt: Date;
  updatedAt: Date;
};

export type QuestionNodePersistable = Omit<
  QuestionNodePersistenceProps,
  'createdAt' | 'updatedAt'
>;

export class QuestionNode {
  private constructor(
    public readonly id: string,
    public readonly quizId: string,
    public readonly title: string,
    public readonly description: string,
    public readonly questionType: QuestionTypeValue,
    public readonly positionX: number,
    public readonly positionY: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromPersistence(p: QuestionNodePersistenceProps): QuestionNode {
    return new QuestionNode(
      p.id,
      p.quizId,
      p.title,
      p.description,
      p.questionType,
      p.positionX,
      p.positionY,
      p.createdAt,
      p.updatedAt,
    );
  }
}
