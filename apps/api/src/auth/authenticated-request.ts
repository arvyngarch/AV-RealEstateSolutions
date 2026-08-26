import type { Request } from 'express';

export interface Auth0TokenPayload {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  amr?: string[];
}

export type AuthenticatedRequest = Request & {
  auth?: { payload?: Auth0TokenPayload };
};
