# AV Real Estate Solutions

A platform that helps buyers and sellers complete residential real-estate transactions without a realtor.

## Prerequisites

- Node.js 22 or later
- pnpm 9 or later
- Docker Desktop

## Local setup

```bash
corepack enable
pnpm install
cp .env.example .env
docker compose up -d db
pnpm db:migrate
pnpm dev
```

The web application runs at `http://localhost:3000`. The API health endpoint is at `http://localhost:3001/health`.

## Validation

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## External services

The application validates Auth0 and Azure Blob Storage configuration only when the relevant integration is enabled. Add credentials to a local `.env` file or deployment secret store. Do not commit secrets.
