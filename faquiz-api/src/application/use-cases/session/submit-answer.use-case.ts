import { Inject, Injectable } from '@nestjs/common';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { QuestionType } from '../../../domain/value-objects/question-type.js';
import { SessionStatus } from '../../../domain/value-objects/session-status.js';
import {
  QUIZ_QUERY_REPOSITORY,
  type IQuizQueryRepository,
} from '../../../domain/repositories/quiz-query.repository.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';
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
export class SubmitAnswerUseCase {
  constructor(
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
  ) {}

  async execute(
    sessionId: string,
    input: {
      answerOptionId?: string | null;
      answerValue?: string;
    },
  ) {
    const session = await this.sessions.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Sessão', sessionId);
    }
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('Sessão já finalizada');
    }

    const quiz = await this.quizzes.findById(session.quizId);
    if (!quiz || !quiz.rootNodeId) {
      throw new ValidationError('Quiz inválido');
    }

    const totalInQuiz = Math.max(
      1,
      await this.queries.countQuestionNodes(session.quizId),
    );

    const answers = await this.sessions.listAnswersForSession(sessionId);
    const expectedNodeId = await this.resolveCurrentQuestionId(
      quiz.rootNodeId,
      session.quizId,
      answers,
    );

    if (expectedNodeId === null) {
      throw new ValidationError('Não há pergunta pendente');
    }

    const question = await this.queries.findQuestionWithOptions(
      session.quizId,
      expectedNodeId,
    );
    if (!question) {
      throw new ValidationError('Pergunta não encontrada');
    }

    let answerOptionId: string | null = input.answerOptionId ?? null;
    let answerValue = input.answerValue ?? '';

    if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
      if (!answerOptionId) {
        throw new ValidationError('answerOptionId é obrigatório');
      }
      const opt = question.answerOptions.find((o) => o.id === answerOptionId);
      if (!opt) {
        throw new ValidationError('Opção inválida para esta pergunta');
      }
      answerValue = opt.value;
    } else {
      if (!answerValue.trim()) {
        throw new ValidationError('answerValue é obrigatório');
      }
      if (answerOptionId) {
        const opt = question.answerOptions.find((o) => o.id === answerOptionId);
        if (!opt) {
          throw new ValidationError('Opção inválida');
        }
      }
    }

    await this.sessions.addAnswer({
      sessionId,
      questionNodeId: expectedNodeId,
      answerOptionId,
      answerValue,
    });

    const answeredCount = answers.length + 1;

    const path: string[] = JSON.parse(session.pathTaken || '[]') as string[];
    path.push(expectedNodeId);

    const nextNodeId = this.computeNextNodeId(question, answerOptionId);

    if (nextNodeId === null) {
      await this.sessions.updatePathAndStatus(
        sessionId,
        JSON.stringify(path),
        SessionStatus.COMPLETED,
        new Date(),
      );
      return {
        completed: true,
        question: null,
        totalQuestions: totalInQuiz,
        answeredCount,
        currentQuestionNumber: totalInQuiz,
      };
    }

    await this.sessions.updatePathAndStatus(
      sessionId,
      JSON.stringify(path),
      SessionStatus.IN_PROGRESS,
      null,
    );

    const nextQuestion = await this.queries.findQuestionWithOptions(
      session.quizId,
      nextNodeId,
    );

    const currentQuestionNumber = await this.queries.getQuestionOrdinal(
      session.quizId,
      nextNodeId,
    );

    return {
      completed: false,
      question: toPublicQuestion(nextQuestion),
      totalQuestions: totalInQuiz,
      answeredCount,
      currentQuestionNumber,
    };
  }

  private async resolveCurrentQuestionId(
    rootNodeId: string,
    quizId: string,
    answers: import('../../../domain/entities/session-answer.entity.js').SessionAnswerEntity[],
  ): Promise<string | null> {
    let nodeId: string | null = rootNodeId;
    for (const ans of answers) {
      if (ans.questionNodeId !== nodeId) {
        throw new ValidationError('Sequência de respostas inválida');
      }
      const node = await this.queries.findQuestionWithOptions(quizId, nodeId);
      if (!node) {
        return null;
      }
      nodeId = this.computeNextNodeIdFromStoredAnswer(node, ans);
    }
    return nodeId;
  }

  private computeNextNodeIdFromStoredAnswer(
    node: NonNullable<
      Awaited<ReturnType<IQuizQueryRepository['findQuestionWithOptions']>>
    >,
    ans: import('../../../domain/entities/session-answer.entity.js').SessionAnswerEntity,
  ): string | null {
    if (node.questionType === QuestionType.MULTIPLE_CHOICE) {
      if (!ans.answerOptionId) return null;
      const opt = node.answerOptions.find((o) => o.id === ans.answerOptionId);
      return opt?.nextQuestionNodeId ?? null;
    }
    if (ans.answerOptionId) {
      const opt = node.answerOptions.find((o) => o.id === ans.answerOptionId);
      return opt?.nextQuestionNodeId ?? null;
    }
    const first = node.answerOptions[0];
    return first?.nextQuestionNodeId ?? null;
  }

  private computeNextNodeId(
    node: NonNullable<
      Awaited<ReturnType<IQuizQueryRepository['findQuestionWithOptions']>>
    >,
    answerOptionId: string | null,
  ): string | null {
    if (node.questionType === QuestionType.MULTIPLE_CHOICE) {
      if (!answerOptionId) return null;
      const opt = node.answerOptions.find((o) => o.id === answerOptionId);
      return opt?.nextQuestionNodeId ?? null;
    }
    if (answerOptionId) {
      const opt = node.answerOptions.find((o) => o.id === answerOptionId);
      return opt?.nextQuestionNodeId ?? null;
    }
    const first = node.answerOptions[0];
    return first?.nextQuestionNodeId ?? null;
  }
}
