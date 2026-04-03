import {
  type ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../../domain/errors/domain-error.js';
import { NotFoundError } from '../../domain/errors/not-found.error.js';
import { UnauthorizedError } from '../../domain/errors/unauthorized.error.js';
import { ValidationError } from '../../domain/errors/validation.error.js';

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    let status = HttpStatus.BAD_REQUEST;
    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof UnauthorizedError) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
    }
    res.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }
}
