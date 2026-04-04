import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { SessionStatus } from '../../../domain/value-objects/session-status.js';
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
export class UndoLastAnswerUseCase {
  constructor(
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão', sessionId);
    }
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('Não é possível voltar nesta sessão');
    }

    const answers = await this.sessions.listAnswersForSession(sessionId);
    if (answers.length === 0) {
      throw new ValidationError('Não há pergunta anterior');
    }

    const removed = await this.sessions.removeLastAnswer(sessionId);
    if (!removed) {
      throw new ValidationError('Não foi possível desfazer a última resposta');
    }

    const path: string[] = JSON.parse(session.pathTaken || '[]') as string[];
    if (path.length > 0) {
      path.pop();
    }

    await this.sessions.updatePathAndStatus(
      sessionId,
      JSON.stringify(path),
      SessionStatus.IN_PROGRESS,
      null,
    );

    const question = await this.queries.findQuestionWithOptions(
      session.quizId,
      removed.questionNodeId,
    );
    const publicQuestion = toPublicQuestion(question);
    if (!publicQuestion) {
      throw new ValidationError('Pergunta não encontrada');
    }

    const remaining = await this.sessions.listAnswersForSession(sessionId);
    const answeredCount = remaining.length;
    const totalQuestions = Math.max(
      1,
      await this.queries.countQuestionNodes(session.quizId),
    );
    const currentQuestionNumber = await this.queries.getQuestionOrdinal(
      session.quizId,
      publicQuestion.id,
    );

    return {
      question: publicQuestion,
      totalQuestions,
      answeredCount,
      currentQuestionNumber,
    };
  }
}
