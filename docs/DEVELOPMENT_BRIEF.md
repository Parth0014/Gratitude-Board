# Vision Board: analysis and development brief

Prepared 2026-09-25 from three user-provided PDFs, 61 pages total. This brief distinguishes **document statements**, **synthesis/proposals**, and **open implementation decisions**. It is a development reference, not independent validation of the reports' external research or current vendor capabilities.

## 1. Sources and coverage

| Key | Source | Coverage |
| --- | --- | --- |
| E | [Experience Insights Deep Dive 2026](Vision_Board_Experience_Insights_Deep_Dive_2026.pdf) | All 32 pages; experience strategy, behavioral rationale, source atlas, priorities |
| P | [Psychology and Behavioral Design Research](Vision_Board_Psychology_Behavioral_Design_Research.pdf) | All 5 pages; evidence review, reflective flows, experiments, principles |
| T | [Technical Architecture](Vision_Board_Web_App_Technical_Architecture.pdf) | All 24 pages; stack/ADRs, architecture, suggested schema/API, launch checklist |

References such as E p.26 use the physical PDF page number. Text extractions retain page separators and source references. All pages were rendered and visually surveyed in contact sheets to cross-check diagrams, tables, and extracted structure. Original PDFs were not modified.

The experience report mentions a current prototype, existing crop issues, and a Gratitude brand. No corresponding implementation or brand assets were present in this workspace. Treat those as context from the report, not verified project state.

## 2. Combined product thesis

The product helps someone articulate a desired life, represent it meaningfully, take a feasible step, and revisit what changed. A single underlying collection should support a board, wallpaper, story, reflection, and eventual recap without requiring repeated rebuilding. [E pp.2-6, 24, 32; P pp.1-3]

Three layers work together:

1. **Reflective layer:** context, values, feelings, scenes, personal meaning, obstacles, action, revision.
2. **Creative layer:** integrated discovery, structured and expressive compositions, reliable crops, authored stories and destination-specific renditions.
3. **Technical layer:** responsive editor, durable compact documents, relational metadata, direct media delivery, queued expensive work.

The first two distinguish this product from a generic collage editor. The third makes those experiences reliable.

## 3. Psychology report analysis

### Evidence boundaries

P explicitly calls direct vision-board evidence sparse and largely qualitative. The classroom study had 10 final-survey respondents; the cited Cornell work had 22 focus-group participants and a qualitative evaluation with 11 young adults and 7 professionals. These inform design hypotheses, not causal efficacy. [P p.1]

The reports draw on adjacent research: process imagery, self-concordant goals, future-self continuity, episodic future thinking, mental contrasting, implementation intentions, progress monitoring, goal adjustment, narrative identity, and social comparison. P cites a 94-test implementation-intention meta-analysis, a 21-study MCII meta-analysis, and 138 experiments on progress monitoring. E reports 15,907 participants for the MCII review and 47 studies for an episodic-future-thinking meta-analysis. Those sample counts are reported by the supplied PDFs, not independently checked here. [P pp.1-2, 5; E pp.4-6, 29]

Preserve these distinctions in future product copy:

- Evidence for an underlying mechanism does not validate this app or the proposed interface.
- The reflection-first ordering, Why Ladder, Goal Conflict Map, and outcome/process pairing are product hypotheses to test.
- Platform growth, creator views, and competitor marketing are directional signals, not proof of psychological benefit.
- Avoid claims that viewing images causes outcomes, guarantees success, manifests events, or treats mental health problems.

### UX consequences

| Mechanism / requirement | Product implication | Source |
| --- | --- | --- |
| Self-concordance | Ask why an aspiration matters and whether it reflects the user's wishes | P pp.1-2 |
| Concrete future scenes | Ask about an ordinary day, people, place, routine, and desired feeling | P pp.1-2 |
| Process + obstacles | Offer a process cue, small first step, obstacle, and optional if-then plan | P pp.2-3 |
| Adaptive goal adjustment | Support pause, reframe, completion, release, and a private timeline | P pp.2-3 |
| Personal meaning | Let the user explain the image; do not infer traits or hidden motives | P pp.2-3 |
| Agency | Skippable questions, visual-first escape route, editable wording | P pp.3-4 |
| Social comparison/privacy | Private defaults; no popularity rankings or luxury/body-ideal defaults | P pp.2-4 |
| Accessibility | Complete text-only, screen-reader, and low-bandwidth alternatives | P p.4 |

Optional desire lenses are Have, Do, Experience, Become, Feel, and Contribute. They can overlap and must not become diagnostic categories. A feared-future prompt is optional and framed as a helpful boundary, not catastrophe rehearsal. [P pp.2-3]

The Why Ladder offers up to three optional why questions, with "I am not sure" and a stopping option. The Goal Conflict Map surfaces demands on time, money, energy, relationships, and timing; users can sequence, shrink, combine, or pause goals. [P p.3]

### Recommended journey

Arrive -> Reflect -> Imagine -> Choose -> Represent -> Prepare -> Revisit -> Revise. Welcome offers reflection-first or visual-first entry; initial theme selection is limited to up to three priorities. Optional prompts should remain available after creation. [P pp.2, 4]

AI, when introduced, may summarize supplied words, suggest alternate interpretations, and ask clarifying questions. It should expose provenance, distinguish quotation from inference, invite correction, and avoid diagnosis, life-purpose assignment, success prediction, or hidden-motive invention. [P pp.3-5]

## 4. Experience report analysis

### Discovery and composition

The central friction is repeatedly leaving the board to search, download, upload, and crop. E proposes one source drawer covering stock, visual search, user media, saved items, generated scenes, quotes, and cutouts. A selected slot supplies aspect ratio and semantic context; a 3-5 candidate shortlist allows reversible selection. These are proposed capabilities, not chosen provider integrations. [E pp.7-10, 23]

Layout families should change composition behavior, not merely colors:

- Structured: the report proposes 10 zero-gap, tap-to-fill layouts.
- Maximal Editorial: 25-60 assets, hero hierarchy, variable scale, controlled overlap, no dead space, protected focal subjects.
- Scrapbook: cutouts, handwriting, paper, personal marks; avoid identical canned decoration on every board.
- Clean Editorial: restrained palette, serif typography, margins, fewer hero images.
- Freeform: transform controls and reliable pan/zoom/crop bounds.
- Adaptive remix: preserve meaning, grouping, and crop choices while reflowing into another composition. [E pp.8-11, 23]

The reported 2026 Canva search-growth figures (including 527% lo-fi and 90% DIY/scrapbook) are contextual design signals. They are not universal demand measurements and were not revalidated in this task. [E p.11]

### Reels and narrative

E uses Apple Memories for narrative sequencing, CapCut for authored templates, and Spotify Wrapped for personal modular stories. Proposed controls are music, length, mood, text level, and focal order, with corrections for crop, recentering, skipping, and inclusion. [E pp.13, 16-17]

Twelve retained concepts: Future Memory; Enter the Board; Before -> Becoming; Letter From Future Me; Future Wrapped; Scrapbook Comes Alive; Vision -> Obstacle -> Plan; Board vs Reality; One Feeling, Many Scenes; Day In My Future; The Making Of; Vision Board Night Recap. [E pp.19-21]

A reel needs a beginning, development, and payoff. Sequence by meaning, reveal imagery before text, use one dominant movement per beat, respect subjects/text-safe zones, allow emotional images time, and end deliberately. [E p.22]

The first three engines proposed in E are Future Memory, Scrapbook Alive, and Board vs Reality. Board vs Reality depends on genuine later evidence and history. Imagined future scenes must stay distinguishable from actual memories or achievements. [E pp.19-20, 26; last sentence is synthesis]

### Retention, surfaces, and social

One board should be reinterpreted for phone/desktop wallpaper, 9:16 reel, 4:5 post, A4/A3 print, Polaroids, and widget cards. Each needs composition suitable for its destination, rather than a simple crop. [E pp.9-10]

The living-board loop is Create -> Pin Meaning -> Do One Thing -> Capture Life -> Match Progress -> Reflect -> Evolve. Proposed revisits include daily excerpts, weekly micro-stories, monthly relevance checks, quarterly remixes, and an annual archive. These are optional surfaces/cadences, not permission to send reminders. [E p.24]

Gratitude integration is "Then / Now / Next": current appreciation, desired growth, and one next step. Annual recaps include evolution and release as well as achievement. Store real provenance and choices; do not fabricate personalized statistics. [E pp.14-16, 24]

Vision Board Night is a later ritual concept: 2-8 participants, 20/30/45-minute sessions, private individual canvases, optional prompt rounds, voluntary reveals, and a private seven-day action. It does not require simultaneous shared-canvas editing. [E p.25]

## 5. Technical report analysis

### Stated baseline

| Concern | Document choice | Implementation implication |
| --- | --- | --- |
| Web | Next.js + React + TypeScript, App Router | Client-heavy editor island at `/board/[boardId]` |
| UI | Tailwind CSS + shadcn/ui | Product-specific panels and dialogs |
| Canvas | tldraw SDK | Reuse editor primitives; custom product shapes |
| State/contracts | Zustand / Zod | Transient UI state / validated shared payloads |
| Identity | Amazon Cognito | Authenticated principal, server-side authorization |
| API | API Gateway + Lambda | Short stateless coordination and CRUD |
| Database | Aurora PostgreSQL Serverless v2 | Relational metadata, roles, compact snapshots |
| Media | S3 + CloudFront | Direct upload and optimized CDN delivery |
| Jobs | SQS + Lambda | Image transforms, exports, eventual AI |
| Ops | CloudWatch + Sentry + PostHog | Infrastructure, app errors, product events |
| Deployment | Vercel frontend; AWS backend/data | Separate deployment concerns |
| IaC | CDK or Terraform | Choice remains open |
| Later | SES, Stripe, managed collaboration or Fargate | Add when the corresponding requirement exists |

[T pp.1, 3-7, 11, 14-17]

The document does not specify exact library versions, an ORM, infrastructure region, capacities, package manager, or a video-rendering technology. This brief does not silently choose them.

### Data and persistence

T proposes users, boards, board_members, board_versions, assets, goals, templates, comments, and subscriptions. Initial board snapshots may live in JSONB, with larger or immutable snapshots in S3. Store geometry/visual state in the editor document; normalize queryable product concepts only. [T pp.8-9, 20, 22]

Indexes start with boards(owner_id, updated_at desc), board_members(user_id, board_id), assets(board_id, created_at), and board_versions(board_id, version desc). Measure actual plans and workloads. [T pp.22-23]

Autosave is optimistic, batched/debounced, and should survive refresh/crash scenarios. T does not define conflict handling or a local recovery implementation. Those still require design. [T pp.7, 21]

### Media and jobs

Upload: authorize board/file -> create pending asset and presigned URL -> browser uploads to S3 -> event/queue -> transform worker -> optimized variants and metadata -> ready asset -> CloudFront. Show a local object URL immediately while uploading. Keep original media private. Suggested variant widths include 256, 512, and 1024 pixels, with larger variants as needed. [T p.10]

Slow operations return job IDs; workers use idempotency, explicit retry behavior, and a dead-letter queue. UI-visible jobs need durable QUEUED/RUNNING/SUCCEEDED/FAILED state; SQS is the delivery queue, not a substitute for a queryable status store. The final clause is an implementation inference. [T pp.11, 14, 21]

Full multiplayer is deferred. T recommends a purpose-built synchronization layer if needed, with a persistent runtime such as Fargate when self-hosting requires it; it rejects inventing shared-editor sync over raw Lambda WebSockets. [T pp.14-15]

### API surface in the document

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | `/boards` | Paginated summaries / create board |
| GET / PATCH | `/boards/{id}` | Open board / update metadata |
| PUT | `/boards/{id}/snapshot` | Save compact snapshot/version |
| POST | `/boards/{id}/assets/upload-url` | Authorize direct upload |
| POST | `/assets/{id}/complete` | Confirm upload and optionally queue processing |
| GET | `/boards/{id}/assets` | Paginated asset metadata |
| POST | `/boards/{id}/exports` | Queue export |
| GET | `/jobs/{id}` | Authorized job status/result |
| POST | `/boards/{id}/members` | Invite or set role |
| DELETE | `/boards/{id}/members/{userId}` | Remove access |

[T p.23; authorization of job results is a synthesis of the security requirement.]

Meaning/reflection/history/deletion endpoints are not fully specified. Neither are error formats, snapshot preconditions, pagination envelopes, or schema migration behavior.

### Performance and operational requirements

Document targets are aspirations, not measured results: useful dashboard content around 1 second; usable board shell around 0.5-1.5 seconds on typical broadband; immediate perceived image placement; no editor stall during save; simple-read p95 in the low hundreds of milliseconds. Define device/network/test conditions before treating these as release gates. [T p.13]

Fetch 20-50 summaries initially rather than hundreds of full records. Load compact board data before visible/nearby optimized images. Trace network, function startup, connection wait, SQL, serialization, transfer, parsing, rendering, and image decoding separately. The "750-post lesson" is a diagnostic example, not a measured workload in this workspace. [T pp.11-13, 23-24]

Launch requirements include server-side owner/editor/viewer checks, private media delivery, scoped upload permissions, type/size validation, quotas, secrets outside the browser, indexes, access-control tests, queue replay safety, recovery, backups, lifecycle rules, observability, and cost alerts. [T pp.13-14, 16-17, 21]

## 6. Cross-document gaps and proposed resolutions

| Tension / missing detail | Proposed resolution, pending implementation decisions |
| --- | --- |
| E makes AI part of P0 discovery; T places AI in phase 5 | Establish one drawer and provider boundary early. Start with user assets/curated licensed content; add AI when prioritized. Keep E's complete target visible. |
| E prioritizes narrative reels; T specifies image/PDF exports without a video pipeline | Treat a reel as a distinct rendition of shared semantic data; choose/prove rendering and music handling before promising delivery. |
| P offers meaning on every object; E says avoid interruption on every save | Make meaning available on relevant objects, optional at creation, with focused prompts for three hero items. Decorative shapes need not become goals. |
| T starts with a capable freeform canvas; E favors guided structured layouts | Use tldraw beneath a guided product interface and presets. Freeform remains an option. |
| Private introspection vs shareable stories | Separate meaning/reflection access from rendered board access; preview the exact items and fields included in an export/share. |
| Immutable archive vs user deletion | Preserve historical snapshots during ordinary edits, while defining deletion/redaction and retention paths across derivatives. |
| E lists "private" alongside aspiration statuses | Keep visibility separate from lifecycle. Proposed canonical lifecycle: exploring/active/paused/evolving/completed/released. |
| T's goals table is too small for P and E | Add stable semantic records for meanings, scenes, actions, reflections, and history; link canvas shapes by ID. |
| An asset can belong to several themes/years, but T shows one board_id | Design associations and reference-aware cleanup before cross-board reuse; avoid duplicating bytes by default. |
| T phase 2 postpones direct uploads/variants while earlier sections require them | Include the safe direct-upload path from the first cloud-backed upload; progressively add performance sophistication. |
| Single active editor still permits two browser tabs | Use explicit revision preconditions/conflict behavior and recovery rather than silent overwrite. |
| Canvas interaction vs P's accessibility requirement | Provide a semantic list/details path and keyboard actions; validate the complete task flow. |

## 7. Proposed domain extensions

These are conceptual contracts, not a finalized SQL schema or extra committed features.

- **Vision item:** stable ID, board association, canvas shape references, title, themes, hero flag, user-authored meaning, value/need, desired feeling, future scene, optional desire lenses, lifecycle state, timestamps.
- **Action bridge:** item reference, process cue, next action, obstacle, if-condition and then-response; optional throughout.
- **Reflection / status event:** item or board reference, date, user note, state transition, linked evidence media, changed meaning. Preserve what mattered then and now.
- **Asset metadata:** storage identity, variants/dimensions/size, processing state, source/provenance, attribution, generated flag, associations. Resolve expiring delivery URLs at access time rather than treating them as permanent identity.
- **Board version:** revision, editor schema version, snapshot location, author/time, matching semantic snapshot or version references. History must include meaning, not only old coordinates.
- **Rendition:** source board version, destination, layout/story preset and version, included items, crop/focal choices, safe zones, optional music/narration references, output and job reference.
- **Job:** owner/board, type, idempotency key, state, progress, result reference, error and timestamps.
- **Consent/preferences:** reminder choices, selective sharing, AI processing/retention choices when relevant.

Keep geometry and semantics separate with stable references; preserve transaction/version consistency between them. This follows T's separation rule while supporting E and P.

## 8. Proposed development sequence and acceptance criteria

### Foundation and feasibility

Confirm current tldraw integration/licensing, custom shapes, clipping/crop behavior, export fidelity, and accessible alternatives. Establish a TypeScript app, shared contracts, persistence adapter, migrations, and reproducible development configuration.

Exit: one representative board with text/images/meaning saves and reloads correctly; crops and export agree; basic keyboard and semantic access work. Cloud provisioning choices can be resolved as they become necessary.

### First complete user flow

Welcome with two entry routes -> up to three themes -> source drawer/upload -> guided composition -> optional hero meaning/action -> save/reopen -> wallpaper/image export -> user-led revisit and state change.

Include private defaults, visible save/upload/error states, image optimization for cloud media, a paginated dashboard, and one coherent preset. A small set of strong layouts is a proposed first implementation scope, not a replacement for E's longer-term layout catalog.

Exit criteria:

- User can complete the flow without answering reflection prompts.
- Meaning, media, geometry, and state changes persist after reload.
- Failed uploads and failed saves are visible and recoverable.
- A second user cannot fetch private boards, assets, or jobs by identifier.
- Wallpaper matches preview with protected subject/text boundaries.
- Board opening does not fetch all original media.
- Review allows pause/reframe/release without failure language.

### Differentiated experience

Add Maximal Editorial, durable history, and the Future Memory story engine. Preserve the exact E p.32 target: Quick Board -> integrated discovery -> Maximal Editorial -> three hero meanings -> Future Memory -> wallpaper -> 30-day revisit card. Extend with Scrapbook Comes Alive and Board vs Reality when history and user-selected evidence exist.

Exit: renditions retain item meaning and identity across formats; privacy exclusions are respected; stories can be corrected with a few controls; users can return without rebuilding the board.

### Later capabilities

AI reflection/generation, Goal Conflict Map, future-self imagery, voice, personalized reminders, Vision Board Night, Vision Wrapped, monetization, invited access, and full collaboration remain separately prioritizable. Preserve T's default of deferring full multiplayer and adding infrastructure only for demonstrated workloads.

## 9. Measurement and validation

P recommends testing reflection-first vs visual-first, image-only vs meaning cards, optional action bridges, user-led vs light reminders, and AI mirror vs static prompts. Measures include clarity/self-concordance at creation and 30 days, meaning recall, first steps at 2-4 weeks, review/adjustment at 8-12 weeks, autonomy, and correction ease. Track burden, frustration, pressure/shame, notification fatigue, privacy concern, and overreliance alongside benefits. [P p.4]

Use interviews and repeated measures, not just click-through or daily opens. Pre-register primary outcomes for research experiments and do not interpret usage as mental health improvement. Technical metrics should cover board-open timing, API latency/error rates, save/upload success, queue age/DLQ, DB connection wait/query time, and CDN cache behavior. [P p.4; T p.16]

Suggested product event names, not implemented: board_created, meaning_saved, action_plan_saved, export_completed, reflection_added, aspiration_status_changed. Record minimal identifiers/properties; keep intimate free text and raw board media out of analytics and session replay by default.

## 10. Decisions to resolve when starting development

1. First milestone: functional editor foundation versus the complete E prototype; audience and primary device.
2. Product name, visual identity, and whether Gratitude integration is actual project scope.
3. tldraw license/feasibility, current package versions, package manager, ORM, and test tooling.
4. AWS region, dev/prod isolation, budget, Aurora connectivity/capacity, CDK or Terraform.
5. Image discovery provider and allowed ingestion/attribution; no assumed Pinterest access.
6. Export dimensions/formats, video pipeline, music rights, and render quotas.
7. Snapshot conflicts, local recovery, meaning history, deletion/retention, sharing semantics, and asset reuse.
8. AI provider/data handling only when AI becomes in-scope.

None prevents saving this analysis or beginning a local feasibility slice. They should not be mistaken for already-approved implementation decisions.
