import type { AnswerOptionEntity } from '../entities/answer-option.entity.js';
import type { QuestionNodeEntity } from '../entities/question-node.entity.js';
import type { QuizEntity } from '../entities/quiz.entity.js';

export const QUIZ_QUERY_REPOSITORY = Symbol('QUIZ_QUERY_REPOSITORY');

export interface QuizTreeSnapshot {
  quiz: QuizEntity;
  nodes: Array<
    QuestionNodeEntity & {
      answerOptions: AnswerOptionEntity[];
    }
  >;
}

export interface IQuizQueryRepository {
  findTreeForAdmin(
    quizId: string,
    adminId: string,
  ): Promise<QuizTreeSnapshot | null>;
  findPublishedWithRootNode(quizId: string): Promise<{
    quiz: QuizEntity;
    rootNode:
      | (QuestionNodeEntity & { answerOptions: AnswerOptionEntity[] })
      | null;
  } | null>;
  findQuestionWithOptions(
    quizId: string,
    nodeId: string,
  ): Promise<
    (QuestionNodeEntity & { answerOptions: AnswerOptionEntity[] }) | null
  >;
  listPublishedQuizzes(): Promise<
    Array<{ id: string; title: string; description: string }>
  >;
  countQuestionNodes(quizId: string): Promise<number>;
  getQuestionOrdinal(quizId: string, nodeId: string): Promise<number>;
}
