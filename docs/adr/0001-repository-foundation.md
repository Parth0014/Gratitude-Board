# ADR 0001: Development repository foundation

Date: 2026-09-25. Status: adopted for the repository setup; cloud deployment is not performed.

## Context

The technical PDF selects Next.js/TypeScript, AWS-managed backend services, relational metadata, object-storage media, and asynchronous jobs. The user requested a production-oriented development setup before feature implementation.

## Decisions

- Use a private npm-workspaces monorepo with a single lockfile. npm is installed on the development machine; no additional global package manager is needed.
- Use Node 22 and npm 10. The tested patch baseline is recorded in version files; update it alongside CI when upgrading.
- Use strict TypeScript including unchecked-index and exact-optional-property checks. ESLint, Prettier, Vitest, and Playwright provide separate quality gates.
- Use Next.js App Router, React, Tailwind CSS, and shadcn-compatible configuration. Include only a small landing shell now; do not disguise missing auth/editor features as a working product.
- Use a runtime-neutral shared Zod contract package. Keep ownership and visibility out of the board creation request; the future API assigns them.
- Use AWS CDK in TypeScript for infrastructure, aligning infrastructure and application tooling. Synthesis/tests work without an AWS account.
- Start with plain PostgreSQL SQL migrations and `pg` for migration execution. An ORM is not yet selected; do not add a data access abstraction before the first persistence workflow.
- Store ownership canonically in `boards.owner_id`. `board_members` grants editor/viewer access. Server policy derives the owner's role rather than maintaining two independently mutable owner records.
- Establish S3 privacy, Cognito, an encrypted queue/DLQ, and a DLQ alarm in the foundation stack. Retain stored data on stack deletion. No data-plane permissions are granted to application code yet.
- Defer Aurora networking/capacity, API Gateway integrations, CloudFront viewer authorization, workers, and deployment workflows to the first cloud-backed feature. Their design needs actual region, budget, identity, and access-path choices.
- Defer tldraw installation to the editor slice. Its production license and UI/export/accessibility feasibility need explicit implementation work; it remains the documented canvas choice.

## Consequences

A fresh clone can install, run the web shell, build, type-check, test, and synthesize infrastructure without credentials. Local PostgreSQL needs a running Docker engine. This setup provides quality gates and architectural boundaries; it does not mean the product is production-ready.

No GitHub remote, account, deployment, or branch protection is inferred from the presence of GitHub workflow files. The owner can host the repository elsewhere and adapt CI.

## Official references checked during setup

- [Next.js installation and linting](https://nextjs.org/docs/app/getting-started/installation): lint is an explicit gate rather than relying on the production build.
- [Next.js workspace transpilation](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages): compile shared TypeScript sources in the web application.
- [AWS CDK supported Node versions](https://docs.aws.amazon.com/cdk/v2/guide/node-versions.html): choose a supported LTS runtime.
- [Playwright CI setup](https://playwright.dev/docs/ci-intro): install browsers and exercise the built application.
- [tldraw license key](https://tldraw.dev/sdk-features/license-key): production use requires a valid license key.
- GitHub Actions are pinned to the release commits of [checkout v7.0.1](https://github.com/actions/checkout/releases/tag/v7.0.1), [setup-node v7.0.0](https://github.com/actions/setup-node/releases/tag/v7.0.0), and [upload-artifact v7.0.1](https://github.com/actions/upload-artifact/releases/tag/v7.0.1), with Dependabot configured to propose updates.
