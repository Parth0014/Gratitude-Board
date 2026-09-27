# Deployment boundaries and next steps

## Available now

`npm run build` produces the Next.js production build and the API health handler bundle. `npm run infra:synth` generates a CloudFormation assembly for the foundation stack without deploying resources. Supported CDK stages are `dev`, `staging`, and `prod`; the local default is `dev`.

The current stack defines a private versioned S3 bucket with enforced TLS, encrypted SQS jobs/dead-letter queues, a DLQ alarm, and a Cognito user pool/browser client with no client secret. Stored data and identities are retained. Cognito deletion protection is enabled.

The alarm has no notification destination yet. The queue has no worker attached. Cognito is not wired into the web UI. The Lambda health bundle is not deployed. The web health endpoint reports liveness only, not database readiness.

## Before a cloud-backed feature

1. Select the AWS account/region, stage budgets, and environment ownership.
2. Add Aurora PostgreSQL Serverless v2 with private networking, connection limits/pooling, Secrets Manager, backup retention, and restore verification. Give migration and application roles separate privileges.
3. Integrate Cognito login and verified JWT authorization in API Gateway/Lambda. Test cross-user object access.
4. Add presigned uploads, image processing, asset lifecycle records, and authorized CloudFront delivery. S3 origin access control alone is not viewer authorization; use signed URLs/cookies or an equivalent authenticated delivery path.
5. Add workers with idempotency, durable job status, bounded retries, and properly matched Lambda timeout/queue visibility settings. The current queue visibility value must be revisited for the actual worker.
6. Configure Sentry/CloudWatch/PostHog with redaction and consent appropriate to intimate content. Route alarms to an owned notification channel.

## Before public release

- Resolve tldraw licensing and verify actual editor/export behavior.
- Configure domain/TLS, auth callback URLs, allowed CORS origins, upload quotas, and rate limits.
- Add a tested CSP once canvas/image/embed sources are known; current headers cover MIME sniffing, framing, referrers, and unnecessary device permissions. Revisit microphone permission when voice recording becomes a feature.
- Revisit the shell's `robots: noindex` setting for the public marketing site. Keep private application routes out of indexing.
- Validate privacy for exports, shares, reflections, media variants, and old snapshots.
- Set backup, restore, retention/deletion, incident response, cost monitoring, and ownership procedures.
- Enable remote branch protections and required CI checks. Prefer short-lived OIDC deployment credentials and protected environments.

## Vercel monorepo deployment

When a remote and Vercel project are configured, set the project root to `apps/web`, use the repository root lockfile/workspace installation, and allow source files outside the project root so `packages/contracts` can be compiled. Test the exact build settings in a preview deployment before production. No Vercel project has been created by this setup.

## Rollback

Promote immutable web/API build artifacts and keep a known-good release. Database changes should remain backward compatible with the previous application version until a later cleanup migration. Restore from tested backups when needed; do not treat `cdk destroy` or volume deletion as rollback.
