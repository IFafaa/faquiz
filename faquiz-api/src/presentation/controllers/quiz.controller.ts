import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GetPublicQuizUseCase } from '../../application/use-cases/quiz/get-public-quiz.use-case.js';
import { ListPublishedQuizzesUseCase } from '../../application/use-cases/quiz/list-published-quizzes.use-case.js';
import {
  CreateQuizUseCase,
  DeleteQuizUseCase,
  GetQuizUseCase,
  ListQuizzesUseCase,
  UpdateQuizUseCase,
} from '../../application/use-cases/quiz/quiz-crud.use-cases.js';
import {
  GetQuizTreeUseCase,
  SaveQuizTreeUseCase,
} from '../../application/use-cases/quiz/quiz-tree.use-cases.js';
import {
  GetQuizAnalyticsUseCase,
  ListQuizSessionsUseCase,
} from '../../application/use-cases/analytics/quiz-analytics.use-cases.js';
import { GetShareUseCase } from '../../application/use-cases/share/get-share.use-case.js';
import { StartSessionUseCase } from '../../application/use-cases/session/start-session.use-case.js';
import type { JwtPayloadUser } from '../../infrastructure/auth/jwt.strategy.js';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard.js';
import type { AnswerOptionEntity } from '../../domain/entities/answer-option.entity.js';
import type { QuestionNodeEntity } from '../../domain/entities/question-node.entity.js';
import {
  CreateQuizDto,
  SaveQuizTreeDto,
  UpdateQuizDto,
} from '../dtos/quiz.dto.js';
import { StartSessionDto } from '../dtos/session.dto.js';
import type { QuestionTypeValue } from '../../domain/value-objects/question-type.js';

type PublicQuestion = {
  id: string;
  title: string;
  description: string;
  questionType: QuestionTypeValue;
  answerOptions: Array<{
    id: string;
    label: string;
    value: string;
    order: number;
  }>;
};

@Controller('quizzes')
export class QuizController {
  constructor(
    private readonly createQuiz: CreateQuizUseCase,
    private readonly listQuizzes: ListQuizzesUseCase,
    private readonly getQuiz: GetQuizUseCase,
    private readonly updateQuiz: UpdateQuizUseCase,
    private readonly deleteQuiz: DeleteQuizUseCase,
    private readonly getQuizTree: GetQuizTreeUseCase,
    private readonly saveQuizTree: SaveQuizTreeUseCase,
    private readonly getPublicQuiz: GetPublicQuizUseCase,
    private readonly listPublishedQuizzes: ListPublishedQuizzesUseCase,
    private readonly startSession: StartSessionUseCase,
    private readonly shareUseCase: GetShareUseCase,
    private readonly analyticsUseCase: GetQuizAnalyticsUseCase,
    private readonly listSessions: ListQuizSessionsUseCase,
  ) {}

  private toPublicQuestion(
    node: QuestionNodeEntity & { answerOptions: AnswerOptionEntity[] },
  ): PublicQuestion {
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

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request & { user: JwtPayloadUser }, @Body() dto: CreateQuizDto) {
    return this.createQuiz.execute(req.user.sub, {
      title: dto.title,
      description: dto.description ?? '',
      collectName: dto.collectName ?? false,
      collectEmail: dto.collectEmail ?? false,
      collectPhone: dto.collectPhone ?? false,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@Req() req: Request & { user: JwtPayloadUser }) {
    return this.listQuizzes.execute(req.user.sub);
  }

  /** Lista quizzes publicados (página inicial pública). Deve ficar antes de rotas `:id`. */
  @Get('published')
  listPublished() {
    return this.listPublishedQuizzes.execute();
  }

  @Get(':id/public')
  async getPublic(@Param('id') id: string) {
    const data = await this.getPublicQuiz.execute(id);
    return {
      quiz: {
        id: data.quiz.id,
        title: data.quiz.title,
        description: data.quiz.description,
        collectName: data.quiz.collectName,
        collectEmail: data.quiz.collectEmail,
        collectPhone: data.quiz.collectPhone,
      },
      rootQuestion: data.rootNode
        ? this.toPublicQuestion(data.rootNode)
        : null,
    };
  }

  @Post(':id/sessions')
  startQuizSession(
    @Param('id') quizId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.startSession.execute(quizId, {
      respondentName: dto.respondentName,
      respondentEmail: dto.respondentEmail,
      respondentPhone: dto.respondentPhone,
    });
  }

  @Get(':id/tree')
  @UseGuards(JwtAuthGuard)
  getTree(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.getQuizTree.execute(id, req.user.sub);
  }

  @Put(':id/tree')
  @UseGuards(JwtAuthGuard)
  saveTree(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
    @Body() dto: SaveQuizTreeDto,
  ) {
    return this.saveQuizTree.execute(id, req.user.sub, {
      rootNodeId: dto.rootNodeId ?? null,
      nodes: dto.nodes.map((n) => ({
        id: n.id,
        title: n.title,
        description: n.description ?? '',
        questionType: n.questionType as QuestionTypeValue,
        positionX: n.positionX,
        positionY: n.positionY,
        answerOptions: n.answerOptions.map((o) => ({
          id: o.id,
          label: o.label,
          value: o.value,
          order: o.order,
          nextQuestionNodeId: o.nextQuestionNodeId ?? null,
        })),
      })),
    });
  }

  @Get(':id/share')
  @UseGuards(JwtAuthGuard)
  share(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.shareUseCase.execute(id, req.user.sub);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard)
  analytics(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.analyticsUseCase.execute(id, req.user.sub);
  }

  @Get(':id/sessions')
  @UseGuards(JwtAuthGuard)
  listQuizSessions(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.listSessions.execute(id, req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.getQuiz.execute(id, req.user.sub);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.updateQuiz.execute(id, req.user.sub, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') id: string,
  ) {
    return this.deleteQuiz.execute(id, req.user.sub);
  }
}
