import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';
import {
  QUIZ_SESSION_REPOSITORY,
  type IQuizSessionRepository,
} from '../../../domain/repositories/quiz-session.repository.js';

function toPublicQuestion(
  node: Awaited<
    ReturnType<IQuizQueryRepository['findQuestionWithOptions']>
  >,
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

@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
  ) {}

  async execute(quizId: string, respondentName: string) {
    const data = await this.queries.findPublishedWithRootNode(quizId);
    if (!data) {
      throw new NotFoundError('Quiz', quizId);
    }
    if (!data.quiz.rootNodeId) {
      throw new ValidationError('Quiz sem pergunta inicial configurada');
    }
    const session = await this.sessions.create({
      quizId,
      respondentName: respondentName ?? '',
    });
    const question = await this.queries.findQuestionWithOptions(
      quizId,
      data.quiz.rootNodeId,
    );
    const totalQuestions = Math.max(
      1,
      await this.queries.countQuestionNodes(quizId),
    );
    const currentQuestionNumber = await this.queries.getQuestionOrdinal(
      quizId,
      data.quiz.rootNodeId,
    );
    return {
      sessionId: session.id,
      quiz: {
        id: data.quiz.id,
        title: data.quiz.title,
        description: data.quiz.description,
      },
      question: toPublicQuestion(question),
      totalQuestions,
      answeredCount: 0,
      currentQuestionNumber,
    };
  }
}
