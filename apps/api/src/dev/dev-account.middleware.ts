import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class DevAccountMiddleware implements NestMiddleware {
  use(request: Request & { devAccount?: { subject: string; email: string; role: string } }, _response: Response, next: NextFunction): void {
    if (process.env.AUTH0_ENABLED !== 'true' && process.env.LOCAL_AUTH_ENABLED === 'true') {
      const role = request.header('x-dev-role') ?? 'BUYER';
      request.devAccount = {
        subject: request.header('x-dev-subject') ?? `local|${role.toLowerCase()}`,
        email: request.header('x-dev-email') ?? `${role.toLowerCase()}@example.test`,
        role,
      };
    }
    next();
  }
}
