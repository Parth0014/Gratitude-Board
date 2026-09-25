# Vision Board

A private, evolving space for meaningful aspirations, small actions, and reflection.

This repository contains a working Next.js application, shared validation contracts, an API package, PostgreSQL migrations, and an AWS CDK foundation. Creating a board begins with exactly two choices: Beginner mode or Reflector direct canvas. Beginner mode helps someone choose a feeling, imagine a scene, personalize a first visual piece, and see their board taking shape. They can add or revise pieces and open the full canvas when ready. Boards and notes are stored in browser localStorage; canvas data is stored in IndexedDB. This is single-browser development storage, with no account, sync, or backup yet. Authentication integration, upload endpoints, and production deployment are the next implementation milestones.

## Quick start

Use Node.js 22 (22.19.0 minimum; `.nvmrc` records the tested baseline) and npm 10.9.3. Run commands from the repository root.

```sh
npm ci
npm run dev
```

Open <http://localhost:3000> and choose **Create vision board**. The local board flow runs without cloud credentials or a database. On Windows, use `npm.cmd` if PowerShell restricts script execution. A production HTTPS deployment of the tldraw editor requires `NEXT_PUBLIC_TLDRAW_LICENSE_KEY`.

## Local database

Start Docker Desktop or another Docker engine first. Copy `.env.example` to `.env`, then:

```sh
npm run db:up
npm run db:migrate
node --env-file=.env scripts/check-db.mjs
```

PostgreSQL is bound only to `127.0.0.1:5432`. Credentials in Compose are for local development only. `npm run db:down` stops the service while preserving its named data volume. The shell currently has no database dependency; these commands prepare backend development.

Migrations are ordered SQL files in `db/migrations/`. The runner serializes concurrent executions with a PostgreSQL advisory lock, applies each migration transactionally, and rejects changed checksums for previously applied migrations. Add migrations instead of editing deployed ones. It does not auto-run destructive down migrations. `updated_at`, snapshot revision preconditions, and transactional writes must be handled by the future repositories/API layer.

## Repository map

```text
apps/web/             Next.js App Router, Tailwind, shadcn configuration
packages/contracts/   Shared Zod input schemas and inferred types
services/api/         Lambda build target and authorization policy
infra/                AWS CDK: private media bucket, jobs/DLQ, Cognito
db/migrations/        Versioned PostgreSQL schema
scripts/              Migration runner and database verification
tests/e2e/            Playwright tests against the production web build
docs/                 Local research PDFs, analysis, and development notes (Git ignored)
```

Workspaces consume TypeScript source internally. Next.js transpiles the contracts package and esbuild bundles API entry points. Nothing is published to npm.

## Commands

| Command               | Purpose                                                              |
| --------------------- | -------------------------------------------------------------------- |
| `npm run dev`         | Local Next.js server                                                 |
| `npm run check`       | Format, lint, all workspace types, unit tests, builds, CDK synthesis |
| `npm run format`      | Apply formatting                                                     |
| `npm test`            | Contract, authorization, and infrastructure tests                    |
| `npm run test:watch`  | Watch unit tests                                                     |
| `npm run build`       | Production web build and bundled API                                 |
| `npm start`           | Serve the production web build                                       |
| `npm run test:e2e`    | Browser tests; run build and install Chromium first                  |
| `npm run infra:synth` | Generate CloudFormation locally; does not deploy                     |
| `npm run db:migrate`  | Apply migrations using `DATABASE_URL`                                |

Before browser tests:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

Playwright starts its own production server on port 3000; stop any development server on that port. CI additionally checks runtime dependency advisories and runs database migrations twice against PostgreSQL to validate replay.

## Development conventions

Read [CONTRIBUTING.md](CONTRIBUTING.md), [project memory](PROJECT_MEMORY.md), and the [development brief](docs/DEVELOPMENT_BRIEF.md). Decisions for this setup are in [ADR 0001](docs/adr/0001-repository-foundation.md). Deployment boundaries are in [deployment notes](docs/DEPLOYMENT.md).

`docs/` is intentionally excluded from Git and tooling. Share it separately if a collaborator needs the PDFs or detailed notes.

All packages are private. `.env` files, build outputs, credentials, and dependency caches are ignored. Husky runs lint-staged on commit; CI is the authoritative quality gate. No Git remote is assumed, no cloud resources are deployed, and no external telemetry is enabled by the application.
