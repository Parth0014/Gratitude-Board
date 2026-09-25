# Development workflow

1. Read `PROJECT_MEMORY.md` and relevant design decisions before changing behavior.
2. Create a focused branch from `main`, for example `feat/board-editor` or `fix/upload-retry`.
3. Keep geometry in the editor, semantic product data in domain records, and media bytes in object storage.
4. Run `npm run check`. Run `npm run test:e2e` for browser/routing changes and database verification for schema changes.
5. Describe the concrete problem, resulting behavior, validation, and any migration/rollout details in the pull request.

## Code boundaries

- `apps/web` owns presentation and transient UI state. Browser code must not import infrastructure, database clients, or AWS secrets.
- `packages/contracts` stays runtime-neutral. Validate untrusted payloads at service boundaries; client validation is only a usability aid.
- `services/api` owns server authorization and orchestration. Derive identity from verified tokens, and derive access from database ownership/membership, never request-provided roles.
- `infra` defines cloud resources. Do not deploy as part of ordinary CI or at install time.
- `db/migrations` is append-only once applied to a shared environment. Use backward-compatible expand/migrate/contract changes for rollout.

## Product constraints

Private defaults, skippable reflection, neutral goal adjustment, and accessible alternatives are baseline requirements. Do not add public ranking, guilt streaks, inferred psychological labels, or unqualified outcome claims. Meaning/reflections are not analytics properties. Do not record raw editor state in logs or session replay.

## Tests and dependencies

Test behavior at boundaries: authorization, ownership, conflict handling, data validation, recovery, and critical user flows. Avoid tests that only duplicate constants or JSX. Add dependencies for a concrete need, pin direct versions, commit the lockfile, and review license/security implications. Use `npm ci` in CI.

## Secrets and local data

Commit only example environment values. Do not include `.env`, AWS credentials, private media, signed access URLs, customer data, or logs in pull requests. The local PostgreSQL account is not suitable for a deployed database.

Once a Git hosting remote exists, enable required CI checks, protected `main`, pull-request review, and restricted deployment environments there. These remote settings are not configured by local files.
