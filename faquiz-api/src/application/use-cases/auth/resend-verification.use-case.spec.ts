import type { IMailPort } from '../../../domain/ports/mail.port.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { userFixture, userPendingEmailVerificationFixture } from '../../../test/fixtures.js';
import { ResendVerificationUseCase } from './resend-verification.use-case.js';

describe('ResendVerificationUseCase', () => {
  const generic =
    'Se existir uma conta com este e-mail, enviaremos um link de confirmação.';

  it('returns generic message when user does not exist', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const mail = { send: jest.fn() };
    const config = { get: jest.fn().mockReturnValue('http://localhost:5173') };
    const uc = new ResendVerificationUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(uc.execute('missing@test.com')).resolves.toEqual({
      message: generic,
    });
    expect(repo.update).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('returns generic message when e-mail already verified', async () => {
    const verified = userFixture({ emailVerifiedAt: new Date() });
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(verified),
      update: jest.fn(),
    };
    const mail = { send: jest.fn() };
    const config = { get: jest.fn() };
    const uc = new ResendVerificationUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(uc.execute(verified.email)).resolves.toEqual({
      message: generic,
    });
    expect(repo.update).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('generates token, updates user and sends mail when pending verification', async () => {
    const pending = userPendingEmailVerificationFixture({
      token: 'old',
      expires: new Date(Date.now() + 1000),
      email: 'pend@test.com',
      name: 'Pend',
    });
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(pending),
      update: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const mail = { send: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://localhost:5173') };
    const uc = new ResendVerificationUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(uc.execute('pend@test.com')).resolves.toEqual({
      message: generic,
    });
    expect(repo.update).toHaveBeenCalledTimes(1);
    const updated = repo.update.mock.calls[0][0];
    expect(updated.emailVerificationToken).toMatch(/^[a-f0-9]{64}$/);
    expect(updated.emailVerificationToken).not.toBe('old');
    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'pend@test.com',
        subject: 'Confirme seu e-mail — FAQuiz',
      }),
    );
  });
});
