# Local development mode

The application runs without external provider accounts while `LOCAL_AUTH_ENABLED=true` and `AUTH0_ENABLED=false`.

Use these headers with protected API calls:

- `x-dev-role`: `BUYER`, `SELLER`, or `ADMIN`
- `x-dev-email`: a unique test email address
- `x-dev-subject`: a unique local identity subject

Local mode is for development and tests only. Production startup must use Auth0 and managed provider credentials. Files and signature events use local metadata until Azure Blob Storage and DocuSign are enabled.
