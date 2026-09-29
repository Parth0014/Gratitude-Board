# Gratitude Vision Studio: repository-wide Canva experience audit

Date: 29 September 2026  
Baseline reviewed: branch `route/excalidraw-fresh`, including commit `2523ef2` and the current working tree  
Product baseline: `Gratitude_Vision_Studio_Architecture_and_Asset_Library_Plan.pdf`

## Executive assessment

Gratitude Studio is no longer a lightly restyled Excalidraw application. It has a real product shell, a normalized asset system, a product document model, a canvas adapter, layouts, photo editing, typography, licensing metadata, attribution output and reel prototypes. The desktop surface has the beginnings of a Canva-style editor.

The product is not yet architecturally or experientially equivalent to a focused Canva-style creator. The largest issue is that the new product layer and the modified Excalidraw UI layer coexist. `excalidraw-app/App.tsx` remains a 1,746-line orchestration component with many direct imports from deep Excalidraw modules, while approximately 700 lines of editor UI and interaction changes were made inside the engine packages. This makes upgrades difficult and causes 160 upstream tests to fail because expected editor controls were removed globally.

The current state is best described as a strong functional prototype with a partially established product boundary.

### Overall scores

| Area | Score | Assessment |
| --- | --: | --- |
| PDF architecture alignment | 64/100 | Core contracts exist; dependency direction remains mixed. |
| Canva-style desktop experience | 68/100 | Strong visual shell and asset rail; workflows lack templates, recents, favorites and richer object controls. |
| Canva-style mobile experience | 42/100 | Responsive shell exists; the open asset sheet dominates the canvas and small controls remain. |
| Asset platform | 82/100 | Broad provider registry, normalization, failure isolation, license tiers and caching are implemented. |
| Editing depth | 63/100 | Useful photo/text/shape controls exist; several PDF editing capabilities and nondestructive pipelines remain incomplete. |
| Persistence and outputs | 58/100 | Versioned companion document and multiple downloads exist; canonical product persistence and production output pipelines are incomplete. |
| Reliability and testing | 46/100 | Product unit tests pass, but upstream regression coverage is badly out of alignment with the fork. |
| Performance | 61/100 | Providers and tools are lazy, but the editor remains large and image derivatives are limited. |
| Security and licensing | 78/100 | SVG sanitation, URL restrictions and provenance are strong; production provider policy needs explicit enforcement and review. |

## What was verified

This audit did not rely on file names or screenshots alone. It used:

1. Complete text extraction of all 19 PDF pages, including phases and acceptance criteria.
2. Repository history and diff analysis from the clean Excalidraw import commit `1a0ed50`.
3. Import and call-path tracing through the app, asset registry, providers, adapter, persistence and export code.
4. TypeScript, strict ESLint, product tests, the complete Vitest suite and a production Vite build.
5. Production browser rendering at 1440 x 900 and 390 x 844 using Playwright.
6. Runtime console capture, overflow checks, visible control counts and touch-target measurements.
7. Production bundle and service-worker precache measurement.

Repository facts:

- 4,148 tracked files.
- 2,471 files under `docs/legacy-branch-backup`.
- 334 tracked files under `tmp`.
- Approximately 12,142 lines in the active `excalidraw-app` TypeScript, TSX and SCSS files.
- Main orchestration files are large: `App.tsx` 1,746 lines, `canvasAdapter.ts` 790, `AssetPanel.tsx` 533, `GratitudeSelectionToolbar.tsx` 438 and `index.scss` 837.

## PDF phase completion

Percentages represent working product behavior and architecture, rather than the presence of similarly named source files.

| Phase | Completion | Verified implementation | Remaining gap |
| --- | --: | --- | --- |
| 0. Stabilize boundary | 62% | `CanvasAdapter`, product selection types, `VisionElement`, document v3, migration from v1/v2, selection/update/delete/layout/export methods. | `App.tsx` and `boardPage.ts` still use raw engine elements and deep internal APIs extensively. Engine UI was modified globally. No clean product package boundary. |
| 1. Asset foundation | 92% | Shared `GratitudeAsset` and `AssetProvider`, provider registry, normalization, license metadata, cache, unified panel, provider failure isolation. | Pagination is in the contract but the combined panel has no mature load-more workflow. Favorites and recents are absent. |
| 2. High-value safe assets | 78% | Iconify whitelist, Kenney, Noto Emoji, open illustrations, creative built-ins, patterns and curated fonts are registered. | Recoloring supported SVG assets is not a complete user workflow. Asset curation and visual consistency vary between sources. |
| 3. Photo discovery | 90% | Pexels, Openverse, Wikimedia, Smithsonian and Rijksmuseum search adapters; provenance persists into custom data and board assets. | Pexels is prioritized in the UI but search intent, pagination and quality controls remain basic. Production moderation is absent. |
| 4. Photo editing | 68% | Crop entry, fit/fill, rotate, flip, seven filters, brightness, contrast, saturation, warmth, blur and five frames. Parameters persist in custom data. | Exposure, highlights, shadows, shadow, border, grain, glow, fade and torn/arch/blob/heart/organic frames are absent. The generated display bitmap pipeline needs explicit original/derivative lifecycle guarantees. |
| 5. Typography and decoration | 61% | Six bundled fonts, fourteen remotely registered fonts, twelve presets, text controls, decorative providers, board patterns/textures. | Font licensing manifests and self-hosted deterministic export are incomplete. The panel needs Canva-style type combinations, hierarchy presets and visual previews. |
| 6. Structured layouts | 72% | Ten layouts, semantic slots, slot replacement and freeform board coexist. | There is no first-class template gallery, layout category/filtering, user preview with content, or explicit conversion workflow. |
| 7. More providers and attribution | 82% | Wikimedia, Smithsonian and Rijksmuseum are integrated; attribution details and attribution text download exist. | Attribution is a separate text download instead of being embedded into export workflows. Resolve methods for several remote providers intentionally cannot refetch by ID. |
| 8. Outputs | 44% | Full-board image export, selection export, attribution file, reel plan JSON and downloadable animated reel HTML. | No high-resolution print/polaroid pipeline, PDF, actual video rendering, output presets, export progress, or complete missing-asset decision UI. |

Weighted PDF implementation estimate: **72% for phases 0-7, 65% including production-ready outputs**.

## Architecture findings

### A1. The adapter exists but is not yet the only engine boundary - high

`excalidraw-app/vision/contracts.ts` defines the correct product-facing API. `canvasAdapter.ts` implements creation, selection, edits, layouts and output helpers. This is aligned with the PDF.

The product application still imports deep engine modules for dialogs, restore logic, libraries, elements, app state and reconciliation. `App.tsx` directly reads and mutates Excalidraw scenes and `boardPage.ts` is entirely engine-shaped. The dependency direction is therefore:

`Product UI -> App orchestration -> Excalidraw internals` and `Product UI -> CanvasAdapter -> Excalidraw internals`.

The target must be:

`Product UI -> Studio controller/use cases -> CanvasAdapter -> Excalidraw public API`.

**Action:** split `App.tsx` into a studio controller, persistence service, board constraints service, upload/drop service and export coordinator. Move `boardPage.ts` behind the adapter package. Product components should receive product state and commands only.

### A2. Too many global Excalidraw modifications - critical maintenance risk

The fork modifies toolbars, actions, mobile toolbar, layer UI, library menus, help UI, dragging and export rendering. Those changes make the current appearance possible, but they also redefine the reusable editor package for every host and break upstream assumptions.

The complete test run produced:

- 115 passing test files and 25 failing test files.
- 2,173 passing tests, 160 failing tests, 47 skipped and one todo.
- Failure clusters around controls removed globally: toolbar lock, shape properties, context menus, stats, Mermaid and other editor actions.

**Action:** restore reusable engine UI behavior and hide/replace it only through `renderEditorUI`, `UIOptions`, interaction configuration and adapter commands in Gratitude Studio. Keep a small documented patch ledger for behavior that public APIs cannot support.

### A3. Product model is a companion snapshot rather than the sole authority - medium

Document v3 correctly includes canvas data, semantic elements, assets, layout slots, fonts and reel configuration. It is rebuilt from the Excalidraw scene during changes. This protects provenance and enables migration.

The scene remains the operational authority. Compound product objects are flattened into broad `VisionElementBase & { type }` records, and the model does not yet express the rich discriminated types proposed by the PDF. A Polaroid or quote is therefore not reliably a single domain aggregate with one transaction boundary.

**Action:** introduce discriminated `VisionImage`, `VisionText`, `VisionQuote`, `VisionSticker`, `VisionFrame` and compound mappings. Persist product mutations first, then project them into a scene transaction.

### A4. Repository residue hides product code - high

More than half the tracked files are in a legacy backup, and hundreds of browser-profile or temporary files remain tracked. Ignore rules prevent these files from breaking lint now, but they still slow clone, search, review and tooling.

**Action:** preserve one compressed archive outside the active source tree, then remove tracked browser profiles, generated type-build output, Aider caches, temporary scripts and tldraw checkout residue in a dedicated cleanup commit.

## Canva-style UX assessment

### What already works

- Clear top header with board title, board setup and export.
- Dark category rail with recognizable content sections.
- Search, suggestions, upload and two-column asset cards.
- Click and drag placement paths.
- Large central board with restrained chrome.
- Contextual selection controls and bottom zoom/snap controls.
- Ten layout presets and twelve typography presets.
- Mobile safe-area usage and bottom-sheet direction.
- No desktop or mobile horizontal page overflow in browser tests.
- No unlabeled visible buttons in the initial rendered states.

### U1. Empty-board onboarding is too passive - high

Canva gives a new user an immediate starting decision: template, upload, recent design or guided content. Gratitude opens to an empty white board with the Photos section selected. The user must infer the creation sequence.

**Action:** create a board-start overlay inside the page with three large actions: use a layout, add photos and start from a guided vision template. Disappear after the first item is added. Include category-specific starter templates such as Travel, Home, Career and Wellness.

### U2. Missing templates, favorites and recents - critical product gap

The PDF specifically calls for favorites, recent and generated assets. The current asset navigation provides All, Photos, Stickers, Doodles, Frames, Patterns, Text, Layouts and Uploads. There are no favorite assets, recent assets, brand uploads, saved styles or reusable user templates.

**Action:** add persistent Recents and Favorites at the top of the asset rail, followed by Templates. Store lightweight asset references, not duplicate remote blobs. Add recently used fonts, colors and layouts.

### U3. Mobile opens with the canvas obstructed - high

At 390 x 844, the asset sheet occupies about 54% of viewport height and opens expanded. The board is only partially visible. The rail scrolls horizontally and later categories are clipped from the initial view. The brand label and board title disappear.

Runtime measurement found 37 visible controls with at least one dimension below 40 px.

**Action:** start mobile with the dock collapsed. Tapping a category opens a 45-70% draggable sheet with snap points. Preserve a compact board title, use 44 px minimum touch targets, and move selected-object editing into a dedicated contextual sheet. Do not show asset discovery and selection editing simultaneously.

### U4. Contextual editing is function-rich but cognitively dense - medium

The selection toolbar contains formatting, arrange actions, crop, fit/fill, filters, frames, flips and multiple sliders. On desktop this becomes a horizontal floating toolbar; on mobile it becomes horizontally scrollable. Canva uses grouped inspector sections and progressive disclosure.

**Action:** use a compact floating quick-actions bar for Delete, Duplicate, Position and Edit. Open a right inspector on desktop or bottom sheet on mobile for detailed controls. Group photo controls into Crop, Adjust, Filters, Effects and Frame tabs.

### U5. Asset cards lack fast Canva interactions - medium

Cards support add, drag and an information dialog. They lack favorite, more menu, related search, replace-selected, preview loading skeletons and clear insertion feedback.

**Action:** add hover/focus controls for Favorite and More, plus context-aware `Replace` when an image is selected. Show a placement skeleton and toast while the original downloads.

### U6. Visual design is coherent but token coverage is incomplete - medium

The palette and spacing are consistent enough to feel intentional, but many literal colors and dimensions remain in one 837-line stylesheet. Component states, elevations, radii and interactive sizes are not fully tokenized.

**Action:** define semantic tokens for surfaces, borders, text, accent states, shadows, radii, spacing and touch sizes. Split shell, asset panel, inspector, board controls and responsive rules into component styles or CSS layers.

## Asset platform findings

### Strengths

- Twelve providers share one registry and contract.
- Results are normalized before reaching UI.
- Providers fail independently through `Promise.allSettled`.
- Duplicate asset IDs are filtered and results are ranked.
- License tiers A-C are accepted; D/E are excluded.
- Preview and asset URLs require HTTPS or same-origin.
- Remote SVG is sanitized with size and element-count limits.
- Search uses memory and localStorage TTL caching; blobs use Cache Storage.
- Provider provenance is stored on placed elements and in the companion document.

### Gaps

- Search dispatches to every provider for broad queries, which can produce noisy results and unnecessary requests.
- Combined pagination and provider-specific continuation are not exposed properly.
- Cache eviction is delegated to the browser; there is no app-level quota strategy.
- Several provider `resolve()` methods cannot recover an asset by ID and depend on already saved provenance.
- No favorites, recents, collections, moderation or administrative provider controls.
- Search ranking is a small keyword/quality/license heuristic without intent classification or per-provider weighting.

**Canva-style target:** query only relevant providers per category, render curated results immediately, stream remote results afterward, preserve scroll state by category, and offer filters for orientation, style, color and license.

## Editing and output findings

### E1. Photo editing is useful but derivative handling needs strengthening - high

Photo edits are stored as parameters, but the adapter renders edited image files for display. The implementation should explicitly retain the immutable original asset, a display derivative and edit parameters as separate references. Repeated adjustments must always render from the original or a lossless working source.

### E2. Layout slots are functional but not templates - medium

There are ten semantic layouts and image placement detects layout slots. This satisfies much of phase 6. A Canva-style template includes starter typography, colors, decorations and content intent, not only empty rectangles.

**Action:** define `VisionTemplate` containing layout, sample elements, theme tokens, required asset roles and preview image. Applying a template should be one undoable transaction.

### E3. Reel export is a prototype - medium

The app exports a reel plan JSON and a standalone animated HTML file. This proves ordering and vertical composition, but it is not a downloadable MP4/WebM experience and has no timeline editing.

**Action:** rename the current option to `Animated web reel` until a real video pipeline exists. Add duration, ordering, transition and preview controls before video encoding.

### E4. Export needs a Canva-style output dialog - high

The current export menu exposes actions directly. The PDF requires deterministic high-resolution board, print and reel pipelines with explicit failed-asset handling.

**Action:** add an Export dialog with format, size, quality, background, attribution and output presets. Before rendering, show asset readiness and font readiness. Offer Retry, Export anyway and Cancel when failures exist.

## Performance and delivery

Production build findings:

- Main app chunk: approximately 1.65 MB minified, 525 KB gzip.
- Font subset shared chunk: approximately 1.82 MB minified, 739 KB gzip, lazy.
- Mermaid-to-Excalidraw: approximately 595 KB minified, lazy.
- Cytoscape: approximately 442 KB minified, lazy.
- Service-worker precache was reduced from 61 files / 4.81 MB to 23 files / 2.29 MB by caching optional editor tools after first use.
- Assistant font URLs generate build warnings despite the source files existing; this path should be normalized so font availability is deterministic.
- Browserslist data is 19 months old.

**Action order:** lazy-load the asset panel and detailed inspectors; split orchestration modules; ensure optional diagram/editor tools never enter the Gratitude initial route; add image thumbnail/derivative generation; resolve font build paths; update browser data.

## Accessibility findings

Positive evidence:

- Initial visible buttons are labeled.
- Snap-to-edges uses switch semantics and checked state.
- Asset cards and many toggles expose accessible names and pressed state.
- Focus-visible styling exists.
- The page does not overflow horizontally at tested sizes.

Risks:

- Mobile contains 37 visible controls with a dimension below 40 px.
- The asset details overlay uses dialog-like visuals but should be verified for `role=dialog`, `aria-modal`, initial focus, focus containment and Escape behavior.
- Horizontally scrolling editing controls are difficult for keyboard and touch users to discover.
- The desktop rail uses small text and 56 px buttons; labels should remain readable at browser zoom and translated lengths.
- No automated axe test is in the current product suite.

## Testing strategy

Current product coverage consists primarily of:

- Eight asset tests.
- Three adapter tests.
- Four document tests.

These 15 tests pass. They validate normalization, license filtering, placement metadata, edge constraints, layout slots and document creation/migration.

Missing high-value coverage:

1. AssetPanel search states, independent provider failures, pagination, add and drag/drop.
2. Shell navigation, mobile sheet state and keyboard behavior.
3. Board settings and background upload.
4. Selection inspector commands and nondestructive image edits.
5. Save, reload and offline restoration with assets.
6. Export failure decisions and attribution output.
7. A production Playwright journey: choose layout -> search -> place -> edit -> reload -> export.
8. Axe checks at desktop and mobile widths.
9. Visual regression snapshots for the empty board, populated board, selection inspector and mobile sheet.

Do not delete upstream tests merely because the product hides controls. First restore package-level behavior and move hiding to the host. Then upstream tests become a useful upgrade safety net again.

## Verified corrections to the earlier Claude audit

| Claude claim | Verification |
| --- | --- |
| Assets are wired | Correct. The complete search -> registry -> provider -> fetch -> adapter placement path exists. |
| Only two Vitest failures | Incorrect for the full repository. The full run has 160 failures across 25 files. The two collab failures were only a small run or narrow interpretation. |
| One circular import | Was correct and has been fixed by placing `VisionTextPreset` in contracts. |
| Six formatting warnings | Was correct at that point and is fixed; strict ESLint now passes. |
| Dead standalone files exist | Likely correct for `StudioIcon`, app `CustomStats`, TTD storage and share entry points based on zero-import tracing. Deletion still needs a deliberate cleanup change because some files form internally connected dormant modules. |
| Mermaid and Cytoscape ship | Partly correct. They are generated as lazy build chunks. They were unnecessarily precached and are now runtime-cached after first use. |
| PWA precaches 4.8 MB | Was correct; reduced to 2.29 MB. |
| Canva is not integrated | Correct if “integrated” means the Canva API. The intended requirement is a Canva-style product experience, and no external Canva API is required for that. |
| No UI runtime verification | Correct for Claude's pass. This audit rendered and inspected desktop and mobile production builds. |

## Recommended implementation sequence

### Milestone 1: restore a clean engine boundary

1. Create `StudioController` and services for persistence, board constraints, uploads and export.
2. Move raw element access from `App.tsx` and `boardPage.ts` behind adapter methods.
3. Restore upstream package UI behavior and configure Gratitude's custom UI at the host layer.
4. Document the remaining engine patches with purpose and upgrade risk.
5. Re-establish upstream test compatibility.

Exit criterion: product components import no deep Excalidraw modules, and the upstream suite no longer fails because Gratitude removed generic editor controls.

### Milestone 2: Canva-style creation loop

1. Add Templates, Recents and Favorites.
2. Add an empty-board starter experience.
3. Add Replace-selected and insertion progress.
4. Preserve category search and scroll state.
5. Add richer template previews and content themes.

Exit criterion: a first-time user can create a coherent board in under two minutes without understanding the underlying canvas engine.

### Milestone 3: contextual editing and mobile

1. Replace the long horizontal inspector with grouped desktop panels.
2. Implement mobile dock plus draggable contextual sheets.
3. Enforce 44 px touch targets and validate safe-area positioning.
4. Add complete photo Adjust, Filters, Effects and Frame groups.
5. Add keyboard and accessibility tests.

Exit criterion: the mobile canvas remains visible and editing any selected object requires no horizontal control hunting.

### Milestone 4: production persistence and outputs

1. Make the product document canonical and add explicit migrations.
2. Guarantee immutable originals and controlled display derivatives.
3. Add export readiness checks and a full export dialog.
4. Add high-resolution image and print pipelines.
5. Turn the reel prototype into a timeline and encoded output workflow.

Exit criterion: saved boards round-trip reliably, outputs match the editor, and failed assets can never disappear silently.

## Final conclusion

The current codebase has enough foundation to continue. Rebuilding from scratch would waste meaningful work. The correct next move is a controlled architecture pass that moves Gratitude behavior out of global Excalidraw modifications, followed by the Canva-style creation loop: templates, recents, favorites, guided empty state, replace flow, contextual inspectors and a mobile sheet model.

The most important product principle remains the PDF's north star: users should experience a vision-board studio with a quiet canvas engine underneath, rather than an Excalidraw fork with additional panels.
