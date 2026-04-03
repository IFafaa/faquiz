import type { AdminEntity } from '../entities/admin.entity.js';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface IAdminRepository {
  findByEmail(email: string): Promise<AdminEntity | null>;
  findById(id: string): Promise<AdminEntity | null>;
}
