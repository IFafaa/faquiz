import type { IMailPort } from '../../../domain/ports/mail.port.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { userFixture } from '../../../test/fixtures.js';
import { ForgotPasswordUseCase } from './forgot-password.use-case.js';

describe('ForgotPasswordUseCase', () => {
  const generic = {
    message:
      'Se existir uma conta com este e-mail, enviaremos instruções para redefinir a senha.',
  };

  it('returns generic message when user does not exist (no enumeration)', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const mail = { send: jest.fn() };
    const config = { get: jest.fn() };
    const uc = new ForgotPasswordUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(uc.execute('nope@test.com')).resolves.toEqual(generic);
    expect(repo.update).not.toHaveBeenCalled();
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('sets reset token, updates user and sends mail', async () => {
    const user = userFixture({ email: 'u@test.com' });
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const mail = { send: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://localhost:5173') };
    const uc = new ForgotPasswordUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(uc.execute('u@test.com')).resolves.toEqual(generic);
    expect(repo.update).toHaveBeenCalledTimes(1);
    const updated = repo.update.mock.calls[0][0];
    expect(updated.passwordResetToken).toMatch(/^[a-f0-9]{64}$/);
    expect(updated.passwordResetExpires).not.toBeNull();
    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'u@test.com',
        subject: 'Redefinição de senha — FAQuiz',
      }),
    );
  });
});
