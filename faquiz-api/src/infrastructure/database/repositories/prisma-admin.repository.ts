import { Injectable } from '@nestjs/common';
import type { IAdminRepository } from '../../../domain/repositories/admin.repository.js';
import type { AdminEntity } from '../../../domain/entities/admin.entity.js';
import { PrismaService } from '../prisma.service.js';
import { mapAdmin } from '../mappers/entity-mappers.js';

@Injectable()
export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const row = await this.prisma.admin.findUnique({ where: { email } });
    return row ? mapAdmin(row) : null;
  }

  async findById(id: string): Promise<AdminEntity | null> {
    const row = await this.prisma.admin.findUnique({ where: { id } });
    return row ? mapAdmin(row) : null;
  }
}
