import type { User as PrismaUser } from '../../../../generated/prisma/client.js';
import { User } from '../../../domain/entities/user.entity.js';

/** Campos de auth adicionados na migração; o tipo do Prisma atualiza após `prisma generate`. */
type UserRow = PrismaUser & {
  emailVerifiedAt?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
};

export class UserMapper {
  private constructor() {}

  static toDomain(row: PrismaUser): User {
    const r = row as UserRow;
    return User.fromPersistence({
      id: r.id,
      email: r.email,
      passwordHash: r.password,
      name: r.name,
      emailVerifiedAt: r.emailVerifiedAt ?? null,
      emailVerificationToken: r.emailVerificationToken ?? null,
      emailVerificationExpires: r.emailVerificationExpires ?? null,
      passwordResetToken: r.passwordResetToken ?? null,
      passwordResetExpires: r.passwordResetExpires ?? null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }

  static toPersistence(entity: User): {
    email: string;
    password: string;
    name: string;
    emailVerifiedAt: Date | null;
    emailVerificationToken: string | null;
    emailVerificationExpires: Date | null;
    passwordResetToken: string | null;
    passwordResetExpires: Date | null;
  } {
    return {
      email: entity.email,
      password: entity.passwordHash,
      name: entity.name,
      emailVerifiedAt: entity.emailVerifiedAt,
      emailVerificationToken: entity.emailVerificationToken,
      emailVerificationExpires: entity.emailVerificationExpires,
      passwordResetToken: entity.passwordResetToken,
      passwordResetExpires: entity.passwordResetExpires,
    };
  }
}
