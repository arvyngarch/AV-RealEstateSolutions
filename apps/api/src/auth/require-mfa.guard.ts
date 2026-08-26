import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedRequest } from './authenticated-request';

@Injectable()
export class RequireMfaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const claims = request.auth?.payload;

    if (!claims?.sub || !claims.email) {
      throw new UnauthorizedException('A valid Auth0 access token is required.');
    }
    if (!claims.amr?.includes('mfa')) {
      throw new ForbiddenException('Multi-factor authentication is required.');
    }
    return true;
  }
}
