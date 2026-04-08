import { Injectable } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.js';
import type { User } from '../../../domain/entities/user.entity.js';
import { PrismaService } from '../prisma.service.js';
import { UserMapper } from '../mappers/user.mapper.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmailVerificationToken(
    token: string,
  ): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { emailVerificationToken: token } as never,
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { passwordResetToken: token } as never,
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async create(user: User): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: user.id,
        ...UserMapper.toPersistence(user),
      } as never,
    });
    return UserMapper.toDomain(row);
  }

  async update(user: User): Promise<User> {
    const row = await this.prisma.user.update({
      where: { id: user.id },
      data: UserMapper.toPersistence(user) as never,
    });
    return UserMapper.toDomain(row);
  }
}
