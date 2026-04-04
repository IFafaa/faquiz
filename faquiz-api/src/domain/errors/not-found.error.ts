import { DomainError } from './domain-error.js';

export class NotFoundError extends DomainError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} não encontrado: ${id}` : `${resource} não encontrado`,
    );
    this.name = 'NotFoundError';
  }
}
