import { JwtService } from '@nestjs/jwt';
import { ConflictError } from '../../../domain/errors/conflict.error.js';
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
    const jwt = { signAsync: jest.fn() };
    const uc = new RegisterUseCase(
      repo as unknown as IUserRepository,
      jwt as unknown as JwtService,
    );
    await expect(
      uc.execute({
        email: 'a@test.com',
        password: 'password12',
        name: 'A',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('creates user and returns accessToken', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('tok') };
    const uc = new RegisterUseCase(
      repo as unknown as IUserRepository,
      jwt as unknown as JwtService,
    );
    await expect(
      uc.execute({
        email: 'new@test.com',
        password: 'password12',
        name: 'Novo',
      }),
    ).resolves.toEqual({ accessToken: 'tok' });
    expect(repo.create).toHaveBeenCalled();
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@test.com',
      }),
    );
  });
});
