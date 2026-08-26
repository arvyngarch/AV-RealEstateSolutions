import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class RequireMfaGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.config.get<string>('LOCAL_AUTH_ENABLED') === 'true' && this.config.get<string>('AUTH0_ENABLED') !== 'true') return true;
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const claims = request.auth?.payload;
    if (!claims?.sub || !claims.email) throw new UnauthorizedException('A valid Auth0 access token is required.');
    if (!claims.amr?.includes('mfa')) throw new ForbiddenException('Multi-factor authentication is required.');
    return true;
  }
}
