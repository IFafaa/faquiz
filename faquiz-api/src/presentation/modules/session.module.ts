import { Module } from '@nestjs/common';
import { GetSessionDetailUseCase } from '../../application/use-cases/analytics/get-session-detail.use-case.js';
import { SubmitAnswerUseCase } from '../../application/use-cases/session/submit-answer.use-case.js';
import { UndoLastAnswerUseCase } from '../../application/use-cases/session/undo-last-answer.use-case.js';
import { AuthModule } from './auth.module.js';
import { SessionController } from '../controllers/session.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [SessionController],
  providers: [
    SubmitAnswerUseCase,
    UndoLastAnswerUseCase,
    GetSessionDetailUseCase,
  ],
})
export class SessionModule {}
