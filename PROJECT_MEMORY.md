# Vision Board project memory

Last updated: 2026-09-25.

## Current state

- User requested analysis of all three PDFs and persistent context before development.
- All 61 PDF pages were text-extracted and read, with rendered page contact sheets inspected. No application code existed in the workspace at intake; only the three PDFs were present.
- Analysis is complete. The user subsequently requested a production-oriented repository setup and the start of development. A local Git repository on `main`, npm workspaces, a working Next.js app, shared contracts, API foundation, SQL migrations, and CDK foundation are now implemented. No cloud resources are provisioned and no deployment has occurred.
- The first development slice now provides local board creation, a tldraw canvas, aspirations with optional meaning and next step, status editing, and reload recovery. Board metadata and meaning use browser localStorage; tldraw canvas state uses IndexedDB. There is no account, cloud synchronization, or backup yet. Production HTTPS use of the editor requires a tldraw license key.
- User feedback: the initial canvas-first UI was too complex and lacked beginner guidance. New boards now default to a three-step guided flow for an idea, personal meaning, and optional small step. Existing and new boards can switch between Guided and Canvas modes, and guided ideas can be edited without the canvas. Keep beginner clarity and progressive disclosure as a product requirement.
- Guided completion must show a saved-board view, including after reload. Returning immediately to question one felt like no progress. The completed view offers explicit Add another idea and Open canvas actions.
- The user rejected the questionnaire-based guided flow. The current redesign starts from the home Create vision board button, presents exactly two choices (Beginner mode and Reflector direct canvas), and lets beginners choose a feeling, select a visual scene, personalize a first piece, then see a board gallery. Editing and adding pieces remain available before using the full canvas. The guide should help a person think and create, not fill a survey.
- This is persistent workspace memory, not a claim of account-wide conversational memory.
- Detailed analysis: `docs/DEVELOPMENT_BRIEF.md`. Full searchable source text: `docs/source-text/`.
- All source PDFs and documentation now live under `docs/`. That folder is intentionally ignored by Git, Prettier, and ESLint as requested. The root `AGENTS.md` and this memory file remain available to guide development.
- Research citations were not independently validated during the PDF analysis. Framework, CDK, Playwright, GitHub Actions, and tldraw licensing documentation were checked during repository setup; keep checking relevant current official documentation when implementing features.

## Source register

| Key | File                                                   | Pages | Role                                                                     |
| --- | ------------------------------------------------------ | ----: | ------------------------------------------------------------------------ |
| E   | Vision_Board_Experience_Insights_Deep_Dive_2026.pdf    |    32 | Experience strategy, discovery, layouts, reels, revisits, social rituals |
| P   | Vision_Board_Psychology_Behavioral_Design_Research.pdf |     5 | Reflective UX, meaning, behavior design, evidence boundaries             |
| T   | Vision_Board_Web_App_Technical_Architecture.pdf        |    24 | Stated stack decisions, persistence, media, APIs, operations             |

## Product intent to preserve

Build a private, living vision board: personally meaningful imagery and words -> plausible future scenes -> optional small actions -> reflection and revision over time. The differentiation is meaning, authored visual composition, and reuse across stories/surfaces. Board creation alone is not the endpoint.

- Offer reflection-first and visual-first entry, with skippable prompts.
- Support up to three initial priorities and hero items. Every meaningful object can hold an optional meaning card; do not interrupt every image placement.
- Capture the user's interpretation, value/need, desired feeling, future scene, process cue, obstacle, if-then plan, and reflections as appropriate.
- States proposed in psychology report: exploring, active, paused, evolving, completed, released. Privacy is a separate dimension.
- Private by default; selective sharing; no public ranking, guilt streaks, forced disclosure, or manifestation/health guarantees.
- AI suggestions, if added, must be editable, attributable, optional, and distinguish user statements from model inference.
- Text-only, keyboard/screen-reader, and low-bandwidth paths matter; a canvas alone does not satisfy accessibility.

## Architecture baseline stated by T

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui; Vercel deployment.
- Editor: tldraw SDK with product-aware custom shapes. Zustand for transient UI state; Zod for contracts.
- Backend: AWS API Gateway + Lambda; Cognito identity; Aurora PostgreSQL Serverless v2.
- Media: private S3 storage + CloudFront delivery, presigned direct browser uploads, optimized image variants.
- Async work: SQS + Lambda initially; retries, idempotency, DLQ, durable job status.
- Operations: CloudWatch, Sentry, PostHog; CDK or Terraform remains a choice.
- PostgreSQL owns product metadata/permissions; tldraw owns geometry; compact JSONB snapshots initially; S3 owns media bytes and potentially large immutable snapshots.
- Autosave must be batched/debounced and recoverable. Small first payloads, paginated summaries, progressive optimized images. Never block board opening on all original media.
- Defer full multiplayer; avoid EC2/custom canvas/custom sync by default. Evaluate a persistent worker/runtime only when a workload needs it.

## Scope reconciliation (assistant proposal, not user-approved)

The reports have different roadmaps. E prioritizes rich discovery and reels early; T defers AI and multiplayer; P prioritizes meaning, privacy, and dual entry routes. Preserve all three, but build incrementally:

1. Prove tldraw custom shapes/cropping/export/accessibility and save/reload. Define domain contracts and local development setup.
2. Build one private flow: entry -> themes -> discover/upload -> compose -> optional meanings/action -> autosave/reopen -> wallpaper/image export -> revisit/status change.
3. Add Maximal Editorial, history, then Future Memory; subsequently Scrapbook Comes Alive and Board vs Reality when real history exists.
4. Later add AI, group rituals, annual recaps, monetization, and multiplayer as prioritized.

E's exact immediate prototype: Quick Board -> integrated discovery -> Maximal Editorial -> three hero meanings -> Future Memory reel -> wallpaper export -> 30-day revisit card. This remains an experience target, not an already-built feature.

## Important unresolved details

- Product name/branding, intended audience, relationship to the report's "Gratitude" brand, first release scope, mobile/desktop priority.
- tldraw current licensing and support for required clipping/masks, export, mobile interaction, accessible alternatives.
- Licensed image discovery provider, attribution/provenance, permitted imports; do not assume Pinterest scraping/API access.
- Video renderer, music rights, render cost/runtime; T does not specify the reel pipeline.
- Schema extensions for semantic items/meaning, reflections, state history, media reuse, job records, and rendition metadata.
- Save conflicts across tabs/devices, schema migrations, asset lifecycle, share/export privacy, deletion and retention.
- AWS region/capacity/budget, CDK vs Terraform, ORM, package manager, versions, deployment credentials.

## Next development action

Continue the first coherent board flow: add visual import/discovery and a richer meaning model, then integrate authenticated server persistence and recovery. Validate tldraw media/export/accessibility capabilities before committing to the next milestone. Resolve choices when they become implementation dependencies; do not ask the user to decide the entire backlog upfront.

## Implemented repository setup

- `apps/web`: Next.js App Router, React, TypeScript, Tailwind, shadcn configuration, accessible landing shell, liveness route, error/404 boundaries, basic security headers, local board list and editor, aspiration meaning form. Auth/upload UI and server persistence remain open.
- `packages/contracts`: strict Zod creation/meaning schemas; lifecycle and role types. Reflection is optional; ownership/visibility cannot be supplied through the creation input.
- `services/api`: Lambda liveness build target and server-side role policy. API endpoints/authentication are not deployed or integrated.
- `db/migrations`: users, private boards, membership, semantic vision items, board versions. Transactional checksum-verified migration runner with advisory lock; Compose PostgreSQL for local development.
- `infra`: TypeScript CDK selected over Terraform. Private retained S3, encrypted SQS/DLQ, DLQ alarm, protected Cognito user pool/client. No Aurora networking, API Gateway, CloudFront viewer delivery, worker, or alarm destination yet.
- Tooling: Node 22/npm 10; exact direct dependency versions and lockfile; ESLint 10 with compatible Next.js and React Hooks plugins; Prettier; Vitest; Playwright/axe; Husky/lint-staged; GitHub CI and Dependabot. GitHub Actions are pinned to verified release commit hashes.
- Decisions, commands, and release boundaries: `README.md`, `CONTRIBUTING.md`, `docs/adr/0001-repository-foundation.md`, `docs/DEPLOYMENT.md`.
- Git is local only. No remote hosting or branch protections are configured.
- Docker engine was unavailable during setup. Database migrations and constraints were verified against an isolated local PostgreSQL 18 instance; CI/Compose target PostgreSQL 17.6. The CI workflow itself has not run on a remote host.
- Setup verification: clean `npm ci`; formatting and lint; workspace and tooling TypeScript checks; 9 unit/infrastructure tests; production web/API builds; CDK synthesis; 4 Playwright tests including desktop/mobile axe checks; migration replay and database constraints. Install audit reported zero known vulnerabilities. The temporary database was stopped and removed. Original PDF fingerprints remain unchanged.
