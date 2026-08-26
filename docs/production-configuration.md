# Production configuration checklist

Do these steps only after the application pull request is merged and local tests pass.

## Required services

1. **PostgreSQL**: Create a managed PostgreSQL database. Set `DATABASE_URL` as a deployment secret. Run the Prisma migration as part of deployment.
2. **Auth0**: Create a web application and API. Configure callback and logout URLs for the deployed web URL. Enable email verification and MFA for Buyer and Seller access. Set `AUTH0_ENABLED=true` and disable local auth. Provide `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, client identifiers, and server-side secret values only in the host secret store.
3. **Azure Blob Storage**: Create a private storage account and containers for listing images, identity documents, and inspection reports. Grant the API least-privilege access. Set Azure storage values in deployment secrets. Replace local file metadata storage with short-lived upload and download URLs before launch.
4. **DocuSign production**: Create a production account and integration key. Configure a secured HTTPS webhook. Store integration credentials and webhook secret as deployment secrets. Replace the local signing-completion endpoint with signature status verification before launch.
5. **Attorney-reviewed templates**: Obtain approved templates for each launch jurisdiction. Confirm when attorney review is required, load the approved version, and establish a template update process.
6. **Email and operations**: Configure a verified transactional email provider, log retention, audit review, error monitoring, backups, incident response, and privacy notices.

## Deployment checks

- Keep all secrets outside Git.
- Run database migration, `pnpm build`, tests, and a production health check.
- Verify authorization with a buyer, seller, and administrator account.
- Test email verification, MFA, private file access, offer expiry, signing webhook replay protection, and backups.
- Obtain legal and regulatory review for the launch state and market before accepting live transactions.
