import { JwtService } from '@nestjs/jwt';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import { userFixture } from '../../../test/fixtures.js';
import { LoginUseCase } from './login.use-case.js';

describe('LoginUseCase', () => {
  const user = userFixture({ email: 'u@test.com', passwordPlain: 'ok' });

  it('throws UnauthorizedError when user does not exist', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(null) };
    const jwt = { signAsync: jest.fn() };
    const uc = new LoginUseCase(
      repo as unknown as IUserRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'x')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedError when password is wrong', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(user) };
    const jwt = { signAsync: jest.fn() };
    const uc = new LoginUseCase(
      repo as unknown as IUserRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('returns accessToken when credentials are valid', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(user) };
    const jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') };
    const uc = new LoginUseCase(
      repo as unknown as IUserRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'ok')).resolves.toEqual({
      accessToken: 'jwt-token',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
    });
  });
});
