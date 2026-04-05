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
import { toPublicQuestion } from './to-public-question.js';

@Injectable()
export class StartSessionUseCase {
  constructor(
    @Inject(QUIZ_QUERY_REPOSITORY)
    private readonly queries: IQuizQueryRepository,
    @Inject(QUIZ_SESSION_REPOSITORY)
    private readonly sessions: IQuizSessionRepository,
  ) {}

  async execute(
    quizId: string,
    input: {
      respondentName?: string;
      respondentEmail?: string;
      respondentPhone?: string;
    },
  ) {
    const data = await this.queries.findPublishedWithRootNode(quizId);
    if (!data) {
      throw new NotFoundError('Quiz', quizId);
    }
    if (!data.quiz.rootNodeId) {
      throw new ValidationError('Quiz sem pergunta inicial configurada');
    }
    const q = data.quiz;
    let name = (input.respondentName ?? '').trim();
    let email = (input.respondentEmail ?? '').trim();
    let phone = (input.respondentPhone ?? '').trim();

    if (!q.collectName) name = '';
    else if (name.length === 0) {
      throw new ValidationError('Nome é obrigatório para este quiz.');
    }

    if (!q.collectEmail) email = '';
    else {
      if (!email) {
        throw new ValidationError('E-mail é obrigatório para este quiz.');
      }
      if (!isValidEmail(email)) {
        throw new ValidationError('E-mail inválido.');
      }
    }

    if (!q.collectPhone) phone = '';
    else if (phone.length === 0) {
      throw new ValidationError('Telefone é obrigatório para este quiz.');
    }

    const session = await this.sessions.create({
      quizId,
      respondentName: name,
      respondentEmail: email,
      respondentPhone: phone,
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
