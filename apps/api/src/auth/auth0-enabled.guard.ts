import { CanActivate, ExecutionContext, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Auth0EnabledGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(_context: ExecutionContext): boolean {
    if (this.config.get<string>('AUTH0_ENABLED') === 'true') {
      return true;
    }
    throw new ServiceUnavailableException('Account access is not configured yet.');
  }
}
