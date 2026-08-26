# Auth0 setup for Phase 1

Complete these steps before setting `AUTH0_ENABLED=true`.

1. Create an Auth0 regular web application for the browser client and an API for the NestJS service.
2. Set the API identifier as `AUTH0_AUDIENCE`.
3. Add the local callback and logout URLs used by the web application. Add production URLs only after the deployment domain is known.
4. Enable database connection sign-up and email verification. Configure a verified email provider before pilot use.
5. Require multi-factor authentication for every buyer and seller sign-in. The access token must include an `amr` claim containing `mfa`.
6. Add the Auth0 domain, API audience, and client identifiers to the environment secret store. Do not commit client secrets.
7. Set `AUTH0_ENABLED=true` only after a test user can obtain an API access token with `sub`, `email`, `email_verified`, and `amr` claims.

## Application behavior

`POST /accounts/provision` accepts the authenticated Auth0 identity and a Buyer or Seller role. It creates an application account with `UNVERIFIED` identity status. It rejects a duplicate email address or an attempt to change the selected role. The endpoint denies requests while Auth0 is disabled, without a valid access token, or without MFA.

## Manual verification

1. Start PostgreSQL: `pnpm db:up`.
2. Add local Auth0 values to `apps/api/.env` and `apps/web/.env.local`.
3. Run `pnpm db:migrate` and `pnpm dev`.
4. Sign in as a buyer and seller using MFA.
5. Confirm each account is created once and has `UNVERIFIED` verification status.
6. Confirm an unsigned, non-MFA, expired, or wrong-audience token cannot provision an account.
