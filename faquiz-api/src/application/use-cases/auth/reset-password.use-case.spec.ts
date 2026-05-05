import * as bcrypt from 'bcryptjs';
import { ValidationError } from '../../../domain/errors/validation.error.js';
import { User } from '../../../domain/entities/user.entity.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import {
  userFixture,
  userWithPasswordResetTokenFixture,
} from '../../../test/fixtures.js';
import { ResetPasswordUseCase } from './reset-password.use-case.js';

describe('ResetPasswordUseCase', () => {
  const future = () => new Date(Date.now() + 60_000);
  const past = () => new Date(Date.now() - 60_000);

  it('throws ValidationError when token is empty', async () => {
    const repo = {
      findByPasswordResetToken: jest.fn(),
      update: jest.fn(),
    };
    const uc = new ResetPasswordUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('', 'Abcd1234!')).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(repo.findByPasswordResetToken).not.toHaveBeenCalled();
  });

  it('throws ValidationError when token unknown or expired', async () => {
    const repo = {
      findByPasswordResetToken: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const uc = new ResetPasswordUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('x', 'Abcd1234!')).rejects.toBeInstanceOf(
      ValidationError,
    );

    const expired = userWithPasswordResetTokenFixture({
      token: 't',
      expires: past(),
    });
    repo.findByPasswordResetToken = jest.fn().mockResolvedValue(expired);
    await expect(uc.execute('t', 'Abcd1234!')).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('updates password hash and clears reset tokens', async () => {
    const user = userWithPasswordResetTokenFixture({
      token: 'reset-tok',
      expires: future(),
    });
    const repo = {
      findByPasswordResetToken: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation((u) => Promise.resolve(u)),
    };
    const uc = new ResetPasswordUseCase(repo as unknown as IUserRepository);
    const plain = 'Abcd1234!';
    await expect(uc.execute('reset-tok', plain)).resolves.toEqual({
      message: 'Senha atualizada. Você já pode entrar.',
    });
    const updated = repo.update.mock.calls[0][0] as User;
    expect(await bcrypt.compare(plain, updated.passwordHash)).toBe(true);
    expect(updated.passwordResetToken).toBeNull();
    expect(updated.passwordResetExpires).toBeNull();
  });

  it('throws when expiry is missing', async () => {
    const p = userFixture().toPersistenceProps();
    const broken = User.fromPersistence({
      ...p,
      passwordResetToken: 'x',
      passwordResetExpires: null,
    });
    const repo = {
      findByPasswordResetToken: jest.fn().mockResolvedValue(broken),
      update: jest.fn(),
    };
    const uc = new ResetPasswordUseCase(repo as unknown as IUserRepository);
    await expect(uc.execute('x', 'Abcd1234!')).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
