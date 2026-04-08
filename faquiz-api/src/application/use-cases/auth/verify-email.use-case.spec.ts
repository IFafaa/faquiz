import { ValidationError } from '../../../domain/errors/validation.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import {
  userFixture,
  userPendingEmailVerificationFixture,
} from '../../../test/fixtures.js';
import { VerifyEmailUseCase } from './verify-email.use-case.js';

describe('VerifyEmailUseCase', () => {
  const future = () => new Date(Date.now() + 60_000);
  const past = () => new Date(Date.now() - 60_000);

  it('throws ValidationError when token is empty', async () => {
    const repo = {
      findByEmailVerificationToken: jest.fn(),
      update: jest.fn(),
    };
    const uc = new VerifyEmailUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('')).rejects.toBeInstanceOf(ValidationError);
    await expect(uc.execute('   ')).rejects.toBeInstanceOf(ValidationError);
    expect(repo.findByEmailVerificationToken).not.toHaveBeenCalled();
  });

  it('throws ValidationError when token is unknown or expired', async () => {
    const repo = {
      findByEmailVerificationToken: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const uc = new VerifyEmailUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('tok')).rejects.toBeInstanceOf(ValidationError);

    const expired = userPendingEmailVerificationFixture({
      token: 't',
      expires: past(),
    });
    repo.findByEmailVerificationToken = jest.fn().mockResolvedValue(expired);
    await expect(uc.execute('t')).rejects.toBeInstanceOf(ValidationError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('marks e-mail verified and updates user', async () => {
    const user = userPendingEmailVerificationFixture({
      token: 'valid-token',
      expires: future(),
    });
    const repo = {
      findByEmailVerificationToken: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const uc = new VerifyEmailUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('valid-token')).resolves.toEqual({
      message: 'E-mail confirmado. Você já pode entrar.',
    });
    expect(repo.update).toHaveBeenCalledTimes(1);
    const updated = repo.update.mock.calls[0][0] as User;
    expect(updated.emailVerifiedAt).not.toBeNull();
    expect(updated.emailVerificationToken).toBeNull();
    expect(updated.emailVerificationExpires).toBeNull();
  });

  it('throws when expiry is missing on user row', async () => {
    const broken = User.fromPersistence({
      ...userFixture({ emailVerifiedAt: null }).toPersistenceProps(),
      emailVerificationToken: 'x',
      emailVerificationExpires: null,
    });
    const repo = {
      findByEmailVerificationToken: jest.fn().mockResolvedValue(broken),
      update: jest.fn(),
    };
    const uc = new VerifyEmailUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('x')).rejects.toBeInstanceOf(ValidationError);
  });
});
