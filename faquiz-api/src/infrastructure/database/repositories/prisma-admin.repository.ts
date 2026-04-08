import { Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../../domain/repositories/admin.repository.js';
import type { Admin } from '../../../domain/entities/admin.entity.js';
import { PrismaService } from '../prisma.service.js';
import { AdminMapper } from '../mappers/admin.mapper.js';

@Injectable()
export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<Admin | null> {
    const row = await this.prisma.admin.findUnique({ where: { email } });
    return row ? AdminMapper.toDomain(row) : null;
  }

  async findById(id: string): Promise<Admin | null> {
    const row = await this.prisma.admin.findUnique({ where: { id } });
    return row ? AdminMapper.toDomain(row) : null;
  }
}
