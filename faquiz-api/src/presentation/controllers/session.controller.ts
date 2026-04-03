import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GetSessionDetailUseCase } from '../../application/use-cases/analytics/quiz-analytics.use-cases.js';
import { SubmitAnswerUseCase } from '../../application/use-cases/session/submit-answer.use-case.js';
import type { JwtPayloadUser } from '../../infrastructure/auth/jwt.strategy.js';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard.js';
import { SubmitAnswerDto } from '../dtos/session.dto.js';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly getSessionDetailUseCase: GetSessionDetailUseCase,
  ) {}

  @Post(':id/answers')
  submit(
    @Param('id') sessionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    return this.submitAnswerUseCase.execute(sessionId, {
      answerOptionId: dto.answerOptionId ?? undefined,
      answerValue: dto.answerValue,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  detail(
    @Req() req: Request & { user: JwtPayloadUser },
    @Param('id') sessionId: string,
  ) {
    return this.getSessionDetailUseCase.execute(sessionId, req.user.sub);
  }
}
