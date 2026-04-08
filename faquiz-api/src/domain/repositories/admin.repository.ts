import type { Admin } from '../entities/admin.entity.js';

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');

export interface IAdminRepository {
  findByEmail(email: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
}
