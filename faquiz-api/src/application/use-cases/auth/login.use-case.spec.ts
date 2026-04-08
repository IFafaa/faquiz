import { JwtService } from '@nestjs/jwt';
import { UnauthorizedError } from '../../../domain/errors/unauthorized.error.js';
import type { IAdminRepository } from '../../../domain/repositories/admin.repository.js';
import { adminFixture } from '../../../test/fixtures.js';
import { LoginUseCase } from './login.use-case.js';

describe('LoginUseCase', () => {
  const admin = adminFixture({ email: 'u@test.com', passwordPlain: 'ok' });

  it('throws UnauthorizedError when admin does not exist', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(null) };
    const jwt = { signAsync: jest.fn() };
    const uc = new LoginUseCase(
      repo as unknown as IAdminRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'x')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedError when password is wrong', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(admin) };
    const jwt = { signAsync: jest.fn() };
    const uc = new LoginUseCase(
      repo as unknown as IAdminRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'wrong')).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it('returns accessToken when credentials are valid', async () => {
    const repo = { findByEmail: jest.fn().mockResolvedValue(admin) };
    const jwt = { signAsync: jest.fn().mockResolvedValue('jwt-token') };
    const uc = new LoginUseCase(
      repo as unknown as IAdminRepository,
      jwt as unknown as JwtService,
    );
    await expect(uc.execute('u@test.com', 'ok')).resolves.toEqual({
      accessToken: 'jwt-token',
    });
    expect(jwt.signAsync).toHaveBeenCalledWith({
      sub: admin.id,
      email: admin.email,
    });
  });
});
