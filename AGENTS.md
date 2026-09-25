# Project context

Before development work, read `PROJECT_MEMORY.md`. Read `docs/DEVELOPMENT_BRIEF.md` for the complete synthesis of the three source PDFs, source page references, proposed delivery sequence, and unresolved decisions.

The source PDFs are in `docs/` alongside the project documentation. Searchable UTF-8 extractions are in `docs/source-text/`; form-feed characters separate PDF pages. The PDFs are authoritative if extraction formatting is ambiguous. The `docs/` folder is intentionally ignored by Git and tooling.

Keep document-stated decisions, assistant proposals, and later user decisions distinct. Update project memory when the user makes a decision or implementation changes the project state. Do not treat the research reports' references to an existing prototype as evidence that prototype code exists here.

## Development

Read `README.md`, `CONTRIBUTING.md`, and `docs/adr/0001-repository-foundation.md` for the implemented setup. Use npm workspaces and the committed lockfile. Run `npm run check` for code/configuration changes and relevant browser/database checks for affected behavior. `npm run infra:synth` is local synthesis only; production deployment is a separate task.

Keep client code, shared runtime-neutral contracts, backend authorization, and infrastructure separated. Preserve private defaults and keep intimate content out of telemetry. Do not claim the shell has working cloud authentication, board editing, or media persistence until those are implemented.
