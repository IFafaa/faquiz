import type { User as PrismaUser } from '../../../../generated/prisma/client.js';
import { User } from '../../../domain/entities/user.entity.js';

export class UserMapper {
  private constructor() {}

  static toDomain(row: PrismaUser): User {
    return User.fromPersistence({
      id: row.id,
      email: row.email,
      passwordHash: row.password,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(entity: User): {
    email: string;
    password: string;
    name: string;
  } {
    return {
      email: entity.email,
      password: entity.passwordHash,
      name: entity.name,
    };
  }
}
