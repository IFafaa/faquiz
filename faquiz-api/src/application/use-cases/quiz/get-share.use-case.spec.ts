import { ConfigService } from '@nestjs/config';
import { NotFoundError } from '../../../domain/errors/not-found.error.js';
import type { IQuizRepository } from '../../../domain/repositories/quiz.repository.js';
import type { IQrCodePort } from '../../../domain/ports/qr-code.port.js';
import { quizFixture } from '../../../test/fixtures.js';
import { GetShareUseCase } from './get-share.use-case.js';

describe('GetShareUseCase', () => {
  it('generates public URL and base64 QR', async () => {
    const q = quizFixture({ id: 'qid' });
    const repo: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
    };
    const qr: Pick<IQrCodePort, 'toPngBase64'> = {
      toPngBase64: jest.fn().mockResolvedValue('base64png'),
    };
    const config = {
      get: jest.fn().mockReturnValue('http://localhost:5173'),
    };
    const uc = new GetShareUseCase(
      config as unknown as ConfigService,
      repo as IQuizRepository,
      qr as unknown as IQrCodePort,
    );
    await expect(uc.execute('qid', 'user-1')).resolves.toEqual({
      publicUrl: 'http://localhost:5173/quiz/qid',
      qrCodePngBase64: 'base64png',
    });
    expect(qr.toPngBase64).toHaveBeenCalledWith(
      'http://localhost:5173/quiz/qid',
    );
  });

  it('uses fallback when FRONTEND_URL is not set', async () => {
    const q = quizFixture({ id: 'qid' });
    const repo: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(q),
    };
    const qr: Pick<IQrCodePort, 'toPngBase64'> = {
      toPngBase64: jest.fn().mockResolvedValue('x'),
    };
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const uc = new GetShareUseCase(
      config as unknown as ConfigService,
      repo as IQuizRepository,
      qr as unknown as IQrCodePort,
    );
    const r = await uc.execute('qid', 'user-1');
    expect(r.publicUrl).toBe('http://localhost:5173/quiz/qid');
  });

  it('throws NotFoundError when quiz does not exist', async () => {
    const repo: Pick<IQuizRepository, 'findByIdAndUser'> = {
      findByIdAndUser: jest.fn().mockResolvedValue(null),
    };
    const qr: Pick<IQrCodePort, 'toPngBase64'> = {
      toPngBase64: jest.fn(),
    };
    const config = { get: jest.fn() };
    const uc = new GetShareUseCase(
      config as unknown as ConfigService,
      repo as IQuizRepository,
      qr as unknown as IQrCodePort,
    );
    await expect(uc.execute('x', 'a')).rejects.toBeInstanceOf(NotFoundError);
  });
});
