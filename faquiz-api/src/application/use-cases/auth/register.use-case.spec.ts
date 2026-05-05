import { ConflictError } from '../../../domain/errors/conflict.error.js';
import type { IMailPort } from '../../../domain/ports/mail.port.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { userFixture } from '../../../test/fixtures.js';
import { RegisterUseCase } from './register.use-case.js';

describe('RegisterUseCase', () => {
  it('throws ConflictError when email already exists', async () => {
    const existing = userFixture();
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(existing),
      create: jest.fn(),
    };
    const mail = { send: jest.fn() };
    const config = { get: jest.fn().mockReturnValue('http://localhost:5173') };
    const uc = new RegisterUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(
      uc.execute({
        email: 'a@test.com',
        password: 'Abcd1234!',
        name: 'A',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('creates user and sends confirmation e-mail', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const mail = { send: jest.fn().mockResolvedValue(undefined) };
    const config = { get: jest.fn().mockReturnValue('http://localhost:5173') };
    const uc = new RegisterUseCase(
      repo as unknown as IUserRepository,
      mail as unknown as IMailPort,
      config as never,
    );
    await expect(
      uc.execute({
        email: 'new@test.com',
        password: 'Abcd1234!',
        name: 'Novo',
      }),
    ).resolves.toEqual({
      message:
        'Conta criada. Enviamos um link de confirmação para seu e-mail.',
    });
    expect(repo.create).toHaveBeenCalled();
    expect(mail.send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'new@test.com',
        subject: expect.stringContaining('FAQuiz') as string,
      }),
    );
  });
});
