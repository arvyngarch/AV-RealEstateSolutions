import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

export type Actor = { subject: string; email: string; role: 'BUYER' | 'SELLER' | 'ADMIN'; emailVerified: boolean };

export function actorFrom(request: Request & { devAccount?: { subject: string; email: string; role: string }; auth?: { payload?: { sub?: string; email?: string; email_verified?: boolean } } }): Actor {
  if (request.devAccount) {
    const role = request.devAccount.role;
    if (role === 'BUYER' || role === 'SELLER' || role === 'ADMIN') return { ...request.devAccount, role, emailVerified: true };
  }
  const claims = request.auth?.payload;
  if (!claims?.sub || !claims.email) throw new UnauthorizedException('Authentication is required.');
  return { subject: claims.sub, email: claims.email, role: 'BUYER', emailVerified: claims.email_verified === true };
}

export function requireRole(actor: Actor, ...roles: Actor['role'][]): void {
  if (!roles.includes(actor.role)) throw new ForbiddenException('You do not have permission for this action.');
}
