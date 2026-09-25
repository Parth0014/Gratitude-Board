# Security notes

The repository is a foundation, not a launched service. Private boards and user content must not be exposed until server-side authorization and private media delivery are implemented and tested.

Report vulnerabilities privately to the repository owner using the hosting platform's private reporting channel once configured. Do not put secrets or personal board content in public issues.

Before release, verify token issuer/audience/expiry, object-level authorization, upload type/size limits, export/share field filtering, dependency advisories, request limits, and deletion/retention behavior. Configure telemetry redaction, alert destinations, backups and restore procedures. See `docs/DEPLOYMENT.md` for the remaining deployment work.
