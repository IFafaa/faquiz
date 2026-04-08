import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import {
  QUIZ_REPOSITORY,
  type IQuizRepository,
} from '../../../domain/repositories/quiz.repository.js';
import {
  QR_CODE_PORT,
  type IQrCodePort,
} from '../../../domain/ports/qr-code.port.js';

@Injectable()
export class GetShareUseCase {
  constructor(
    private readonly config: ConfigService,
    @Inject(QUIZ_REPOSITORY) private readonly quizzes: IQuizRepository,
    @Inject(QR_CODE_PORT) private readonly qr: IQrCodePort,
  ) {}

  async execute(quizId: string, userId: string) {
    const quiz = await this.quizzes.findByIdAndUser(quizId, userId);
    if (!quiz) {
      throw new NotFoundError('Quiz', quizId);
    }
    const base =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    const publicUrl = `${base.replace(/\/$/, '')}/quiz/${quizId}`;
    const qrCodePngBase64 = await this.qr.toPngBase64(publicUrl);
    return { publicUrl, qrCodePngBase64 };
  }
}
