import type { Admin as PrismaAdmin } from '../../../../generated/prisma/client.js';
import { Admin } from '../../../domain/entities/admin.entity.js';

export class AdminMapper {
  private constructor() {}

  static toDomain(row: PrismaAdmin): Admin {
    return Admin.fromPersistence({
      id: row.id,
      email: row.email,
      passwordHash: row.password,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  static toPersistence(entity: Admin): {
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
