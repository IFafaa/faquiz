import type { AnswerOption } from '../entities/answer-option.entity.js';
import type { QuestionNode } from '../entities/question-node.entity.js';
import type { Quiz } from '../entities/quiz.entity.js';

export const QUIZ_QUERY_REPOSITORY = Symbol('QUIZ_QUERY_REPOSITORY');

export interface QuizTreeSnapshot {
  quiz: Quiz;
  nodes: Array<
    QuestionNode & {
      answerOptions: AnswerOption[];
    }
  >;
}

export interface IQuizQueryRepository {
  findTreeForUser(
    quizId: string,
    userId: string,
  ): Promise<QuizTreeSnapshot | null>;
  findPublishedWithRootNode(quizId: string): Promise<{
    quiz: Quiz;
    rootNode:
      | (QuestionNode & { answerOptions: AnswerOption[] })
      | null;
  } | null>;
  findQuestionWithOptions(
    quizId: string,
    nodeId: string,
  ): Promise<
    (QuestionNode & { answerOptions: AnswerOption[] }) | null
  >;
  listPublishedQuizzes(): Promise<
    Array<{ id: string; title: string; description: string }>
  >;
  countQuestionNodes(quizId: string): Promise<number>;
  getQuestionOrdinal(quizId: string, nodeId: string): Promise<number>;
}
