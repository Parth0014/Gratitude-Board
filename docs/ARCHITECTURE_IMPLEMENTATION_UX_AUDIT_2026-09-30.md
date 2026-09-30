# Gratitude Studio: architecture, implementation, and UI/UX audit

**Date:** 30 September 2026  
**Reviewed revision:** `ec37e1a` (`route/excalidraw-fresh`)  
**Scope:** Current Excalidraw-based application, product contracts, persistence, image editing, asset providers, exports, responsive CSS, accessibility, deployment configuration, and relevant tests. Historical source backups were not treated as the running application.

## 1. Executive assessment

The project has a useful editor foundation and a recognizable product layer, but several important user journeys are incomplete or internally inconsistent. The largest problems are **preserving editable photos across sessions, coordinating asynchronous changes with undo, exposing essential editor commands, and making all exports follow the same rules**.

The code compiles and builds. That does not establish that a user can reliably create, revisit, edit, and export a board. Existing tests predominantly verify small, isolated operations; they miss several cross-layer failures reproduced during this audit.

**Recommendation:** prioritize a reliability and interaction pass before expanding the provider list or adding more effects. Retain the editor engine, strengthen the product boundary, and establish one persistence/export contract.

### Repair status

The first repair batch has been started on the current working tree:

- **F01 partial:** added shared `collectReferencedFileIds()` coverage for originals/derivatives across local file saving, startup loading, cleanup reachability, JSON export, clipboard, and backend upload.
- **F02 partial:** image-edit derivatives now rescale an existing crop rectangle into derivative pixel coordinates; a regression test covers a downsampled crop.
- **F03 partial:** background image/texture commits now re-read the current scene and reject superseded operations instead of applying a stale scene snapshot.
- **F07 partial:** optional background photo/texture layers are no longer restored as mandatory protected layers during undo; permanent page/base-background protection remains.

Remaining work in these findings includes end-to-end reload/file-manager coverage, invalidating in-flight photo edits on replacement/undo, and validating background updates through browser interaction tests.

### Highest-priority findings

| ID | Priority | Finding | Evidence level |
| --- | --- | --- | --- |
| F01 | P1 | Edited photos lose access to their originals after reopening; cleanup can subsequently delete those originals | Reproduced + traced |
| F02 | P1 | Image downsampling leaves crop coordinates in the old pixel coordinate system | Source-confirmed |
| F03 | P1 | Background-image completion can overwrite newer canvas edits | Source-confirmed race |
| F04 | P1 | Pending image edits can overwrite replacement/undo results | Source-confirmed race |
| F05 | P1 | Persistence is split, non-transactional, and can silently fail | Source-confirmed |
| F06 | P1 | Repeated presets and duplicates collapse into one semantic item | Reproduced |
| F07 | P1 | Scene protection reverses legitimate background undo | Reproduced at invariant boundary |
| F08 | P2 | Send to back can place content beneath background photos/textures | Reproduced |
| F09 | P2 | Fit → Fill loses the original frame size | Reproduced |
| F10 | P2 | Several photo-frame controls do not implement their advertised appearance | Source-confirmed |
| F11 | P2 | Filled layouts lose semantic identity; templates accumulate headings | Reproduced |
| F12 | P1 | License acceptance is broader than the export policy can support | Reproduced + traced |
| F13 | P1 | Export paths disagree on missing images, credits, and resource limits | Source-confirmed |
| F14 | P2 | Reel plan, HTML reel, and video describe different products | Source-confirmed |
| F15 | P1 | Host UI drops the engine's menu/tool slots without equivalent controls | Source-confirmed |
| F16 | P1 | Mobile footer positioning loses to desktop CSS; tablet panels squeeze the editor | CSS-confirmed; visual check pending |
| F17 | P2 | Search/pagination races and hidden filters produce misleading results | Source-confirmed |
| F18 | P2 | Favorites beyond 30 disappear after reload | Reproduced |
| F19 | P2 | SVG sanitization changes supported artwork and can break preview-to-placement fidelity | Reproduced for gradients |
| F20 | P2 | Image processing and caches have uneven resource controls | Source-confirmed risk |
| F21 | P1 | The supposedly canonical document cannot independently reconstruct a board | Architecture-confirmed |
| F22 | P2 | Product behavior remains concentrated in large host/adapter files and engine patches | Architecture-confirmed |
| F23 | P1 | Docker/static production serving omits the API layer required by providers | Configuration-confirmed |
| F24 | P1 | Vercel-hosted builds can report to the inherited upstream Sentry destination | Conditional configuration risk |
| F25 | P2 | UI feedback, accessibility, and mobile task coverage are incomplete | Source-confirmed; assistive-tech checks pending |
| F26 | P2 | Documentation and regression coverage disagree with the current product | Verified |

**Priority definitions:** P1 = resolve before relying on the affected workflow in a public release; P2 = important correctness, usability, or maintainability work. No P0 exploit or total-loss incident was demonstrated. “Source-confirmed race” means the vulnerable interleaving is explicit in code, not that a live-browser reproduction was completed.

## 2. Method and verification

### Checks actually run

| Check | Result |
| --- | --- |
| Initial `git status --short` | Clean working tree |
| `node node_modules/typescript/bin/tsc --noEmit --pretty false` | Passed |
| `node node_modules/vitest/vitest.mjs run excalidraw-app/vision excalidraw-app/assets --reporter=dot` | 7 files, 28 tests passed |
| `node node_modules/vitest/vitest.mjs run excalidraw-app/tests --reporter=dot` | 3 passed, 2 failed |
| Temporary targeted audit probes under Vitest/jsdom | 12 observations reproduced |
| From `excalidraw-app`: `node ../node_modules/vite/bin/vite.js build --outDir ../tmp/gratitude-audit-build` | Passed; build reported 45.59 seconds |

The two existing failures are in `excalidraw-app/tests/collab.test.tsx`:

- Line 133: expected 2 ephemeral increments, received 7.
- Line 179: expected the old two-element scene snapshot; received additional Gratitude board-layer state.

These prove the existing suite is not green. They do **not**, by themselves, prove a production collaboration failure: collaboration is disabled in the current host and the test assumptions predate board invariants.

The 12 temporary probes asserted observed behavior: original-file save omission, edit failure with a reload-equivalent file map, duplicate semantic identity, repeated-preset identity, template heading accumulation, Fit/Fill geometry, background ordering, scene-guard undo interference, lost filled-layout identity, missing ShareAlike metadata, favorites truncation, and gradient removal. Passing these probes means the defects were reproduced, not that correct behavior passed regression tests. The probe fixture initially lacked `selectedGroupIds`; that fixture was corrected before the final 12/12 run. Temporary probe source was removed after the audit.

### Limits

- Live built-in browser navigation timed out. The development server did start successfully, but a browser walkthrough and fresh screenshots could not be obtained through the available browser connection.
- Responsive and accessibility findings below are based on current JSX/CSS and control flow, not measured browser geometry, screen-reader output, or a formal WCAG audit.
- Production deployment, real provider accounts, live provider availability, dependency vulnerability databases, and the entire upstream engine test suite were not verified.
- The build command verified the Vite production bundle, not the separate version-generation script or a deployment to Vercel/Docker.
- Older smoke screenshots and historical audit reports are not current-runtime evidence.

## 3. Actual architecture and intended boundaries

### Current execution path

1. `excalidraw-app/index.tsx` loads React, the application, Sentry, and production service-worker registration.
2. `excalidraw-app/App.tsx` orchestrates initialization, browser synchronization, scene repair, board settings, asset placement, local saving, and engine composition.
3. `components/GratitudeShell.tsx`, `AssetPanel.tsx`, and `GratitudeSelectionToolbar.tsx` provide the product interface.
4. `vision/canvasAdapter.ts` translates product commands into engine operations, processes photos, renders exports, builds HTML reels, and records video.
5. `assets/registry.ts` aggregates providers; search metadata uses memory/localStorage and binary assets use memory/Cache Storage.
6. Scene and app state are saved in localStorage; image files are saved separately in IndexedDB; a semantic companion document is saved under another localStorage key.
7. Provider HTTP requests go through Vite middleware locally and `api/*.mjs` handlers on the intended serverless deployment path.
8. `packages/excalidraw` and `packages/element` own spatial interaction, rendering, history, and several Gratitude-specific behaviors.

### Positive foundations worth retaining

- Product UI components largely use product-facing contracts; a boundary test exists.
- TypeScript strict mode is enabled, and the reviewed code typechecks.
- Provider normalization, server-side API-key use, SVG rebuilding, and local fallback assets are meaningful foundations.
- The engine supplies mature selection/history/rendering primitives.
- The app has started introducing explicit scene invariants and provenance metadata.

### Core misalignments

| Intended claim | Actual implementation | Consequence |
| --- | --- | --- |
| Canonical, engine-independent product document | Incomplete projection of an engine scene | Recovery and future migrations still depend on raw engine state |
| Immutable originals and reversible photo editing | Only active `fileId` participates in load/save/cleanup | Edited photos stop being editable across sessions |
| One undoable product operation | Async processing plus reactive repair outside one transaction | Undo can be reversed or stale operations can commit later |
| Safe assets with export-aware licensing | Broad Tier C admission and independent export implementations | Some outputs omit necessary policy information |
| Curated editor with accessible basic tasks | Engine menu/tools are omitted from host rendering | Save/open/draw/note workflows lose visible entry points |
| Mobile editor | Layered, conflicting responsive overrides | Controls can be obscured or reduced below intended touch sizes |
| Consistent deployment | Vite/serverless and static-only Docker paths | An image search working locally can fail in production |

## 4. Detailed implementation findings

### F01 — Original photo files are outside persistence reachability

**P1 · Reproduced**

**Evidence:** `vision/canvasAdapter.ts:825-835,973-979`; `data/FileManager.ts:99-113`; `App.tsx:915-921,948-967`; `data/LocalData.ts:56-69` (paths relative to `excalidraw-app/` unless otherwise stated).

Photo editing changes the element's `fileId` to a derivative and records `originalFileId` in `customData.gratitudeImageEdits`. File saving and startup loading iterate only the active `element.fileId`. Cleanup also receives only active file IDs. A metadata reference is therefore not considered a live file dependency.

**User impact:** an edited photo may display correctly after reopening but subsequent filter/reset operations throw “The original photo is unavailable.” If the original was never saved before the first edit, it may never reach IndexedDB. If it was saved, startup cleanup may later remove it as obsolete after the age threshold.

**Reproduction:** upload a photo, apply a filter, wait for saving, reload, and adjust/reset the same photo. The audit independently reproduced both the save omission and the adapter exception with a reload-equivalent file map.

**Fix:** implement a shared `collectReferencedFileIds` used by save, load, garbage collection, editable export, and synchronization. Include original and derivative dependencies. Await successful file persistence before marking the corresponding document revision committed.

**Acceptance:** edit → reload → edit/reset works offline; a board older than 24 hours retains its originals; immediate editing after insertion cannot bypass original persistence.

### F02 — Photo derivatives invalidate crop coordinates

**P1 · Source-confirmed**

**Evidence:** `vision/canvasAdapter.ts:113-131,719-725,842-849,950-980`; `packages/element/src/renderElement.ts:540-547,607-617`.

Crop rectangles are expressed in source-image pixels. Image processing downsamples a large original to a maximum dimension of 2048, then assigns the derivative file without transforming the existing crop rectangle. The renderer passes those crop coordinates directly to `drawImage` against the new, smaller bitmap.

For example, a 6000×4000 original filling a square can have a 4000×4000 source crop beginning at x=1000. A derivative is approximately 2048×1365, but the crop still asks for the old source rectangle.

**Impact:** incorrect framing, partial/blank areas, or apparent zoom changes after applying a filter to a cropped/layout photo.

**Fix:** store normalized crop coordinates or transform the crop to derivative dimensions on every file change. Keep original dimensions and current-render dimensions explicit. Test both crop-before-filter and filter-before-crop with a large image.

### F03 — Background processing can replace a newer scene with an older snapshot

**P1 · Source-confirmed race**

**Evidence:** `App.tsx:653-683,717-750`.

`setBackgroundImage` captures `elements`, `page`, and the previous background before awaiting file reading and decoding. Its eventual `updateScene` is constructed from that captured array. Any insertion, movement, deletion, or resize performed while processing is in progress can be overwritten.

Concurrent background uploads or texture changes also have no generation check, so completion order can win over the user's latest choice.

**Reproduction scenario:** begin a large background upload and immediately add or move an item. When decoding finishes, compare the item with its latest state. Delaying the decoder makes the interleaving deterministic.

**Fix:** capture only stable intent/IDs before the await; reread the current scene before committing a targeted update. Validate board ID and revision, use operation tokens, and cancel superseded background requests.

### F04 — Async photo edits are not invalidated by replacement or undo

**P1 · Source-confirmed race**

**Evidence:** `vision/canvasAdapter.ts:769-807,825-835,930-987`; `App.tsx:1589-1608`; `components/GratitudeSelectionToolbar.tsx:198-201,493-499`.

The image-edit generation check only detects a newer `updateImageEdits` call. Replacing a photo or undoing a change does not invalidate an in-flight edit. When an old edit completes, it applies the old bitmap to whatever image currently has the same element ID.

`replaceSelectedImage` also builds its replacement from an element captured before asynchronous decoding. The host downloads an asset before the adapter captures selection, so a changed selection can receive the replacement instead of the originally intended image.

Errors from toolbar edit/reset promises are discarded with `void`; the user can receive no meaningful error state. Failed edits can leave entries in `pendingImageEdits`.

**Fix:** commands should carry explicit target IDs and source-file versions. Invalidate operations on replacement, undo, delete, and board changes. Check target identity immediately before commit; clear pending state in a guarded `finally`; report failures in the UI.

**Acceptance:** delayed filter A cannot overwrite replacement B; undo remains effective after processing completes; changing selection during a download does not retarget the command.

### F05 — Save state is non-transactional and sometimes silently unsuccessful

**P1 · Source-confirmed**

**Evidence:** `data/LocalData.ts:75-121,131-146,219-240`; `vision/repository.ts:22-31`; `App.tsx:375-400,1044-1069`; `index.tsx:42-58`.

- Scene, app state, semantic document, and files are written separately. A failure can leave mismatched revisions.
- `VisionDocumentRepository.save` returns `false`, but callers ignore it. A semantic-document failure can be followed by clearing the quota warning and publishing a state-version update.
- File write failures are recorded in a map but are not translated into a product-level save status.
- The board title has an independent write path, while tab synchronization imports scene/app state without refreshing React's `boardTitle`. Another tab can later save its stale title over the new one.
- Accessing `ownerWindow.localStorage` before entering the repository can itself throw. Initial title/library reads and startup `sessionStorage` use are not consistently protected.

**Impact:** users cannot distinguish durable saving from in-memory success; reload can reveal partial state; a restricted-storage environment can fail before the intended fallback path.

**Fix:** use an IndexedDB transaction for a committed board revision and its file references, or a staged commit protocol across stores. Return structured save results and show “Saving / Saved on this device / Save failed.” Separate storage-unavailable, quota-exceeded, and corrupt-data states. Synchronize document title and revision together.

### F06 — Semantic IDs are reused across independent instances

**P1 · Reproduced**

**Evidence:** `vision/canvasAdapter.ts:1101-1133,1183-1189,1309-1315`; `vision/document.ts:249-272`; `packages/element/src/duplicate.ts:103-133`.

Text presets use `preset.id` as the instance's semantic ID. Duplicating an element copies its semantic ID. Document serialization merges all engine elements with that ID as a compound object.

**Observed:** inserting the same text preset twice produced two visible text elements but one semantic item. Duplicating a preset text produced the same mismatch. Asset-image duplication has the same copied-ID mechanism.

**Impact:** incorrect counts/bounds, merged metadata, ambiguous future selection and aspiration associations, and unreliable reel ordering.

**Fix:** separate definition IDs (`presetId`, `templateId`, `assetId`) from unique placed-instance IDs. Remap semantic IDs during all duplication paths, including engine keyboard/Alt-drag duplication, while preserving intentionally compound membership.

### F07 — Scene repair conflicts with legitimate undo

**P1 · Reproduced at invariant boundary**

**Evidence:** `vision/engine/sceneGuard.ts:71-106`; `App.tsx:733-750,1206-1231`.

The guard treats a missing previously protected image/texture as accidental deletion. The one-shot `allowBoardLayerReplacementRef` is set for a direct background command, not for history replay. Undoing a background insertion removes that layer; the guard restores it with a non-history update.

**Impact:** undo does not reliably undo Board setup changes. History and rendered state diverge in ways that look arbitrary to users.

**Fix:** protect against direct interactive deletion at the command boundary. History replay should restore a previously valid state, including “no background photo.” Make protection rules distinguish permanent board roots from optional background layers.

**Acceptance:** upload/replace/remove photo and add/change/remove texture each undo and redo exactly once without repair loops.

### F08 — Send to back crosses the protected-background boundary

**P2 · Reproduced**

**Evidence:** `vision/canvasAdapter.ts:1135-1157`.

The z-order command protects only the page and base rectangle. Background photographs and textures remain in `remaining`, so “back” places selected content before them.

**Impact:** the selected item can disappear beneath an opaque background photo even though the intent was to move it behind other content.

**Fix:** define one shared ordered set of board layers and constrain content reordering above all of them. Preserve frame ownership and binding/group ordering through an engine-supported reorder operation.

### F09 — Fit and Fill mutate the container instead of describing its content fit

**P2 · Reproduced**

**Evidence:** `vision/canvasAdapter.ts:1021-1069`.

“Fit” shrinks the element box to match the original aspect ratio. “Fill” then computes a crop against that already-shrunken box. The former slot dimensions are not retained.

**Observed:** a 400×400 element with a 2:1 source becomes 400×200 after Fit and remains 400×200 after Fill.

**Fix:** represent a stable frame/container rectangle separately from image content geometry. Fit/Fill should modify the content transform/crop, not destroy the target rectangle.

### F10 — Photo frames and reset are only partially implemented

**P2 · Source-confirmed**

**Evidence:** `vision/canvasAdapter.ts:135-144,945-990`; `packages/element/src/renderElement.ts:517-623`; `packages/element/src/utils.ts:528-533`; `packages/common/src/constants.ts:440`.

- Circle and rounded both use proportional roundness. The engine radius is 25% of the shorter side, rather than the 50% required for a circle. The bitmap clipping helper does not handle `circle`.
- Polaroid/film set image `strokeColor`/`strokeWidth`, but the canvas image renderer draws the image and does not draw that frame border in this branch.
- Heart/blob/organic switch the element to a square without a corresponding general fit/crop model; this can stretch content or conflict with a previous crop.
- Reset rerenders default edits but does not restore prior geometry, crop, or rotation. Once a frame has squared the element, “Reset photo” does not recover the earlier rectangle.

**Fix:** implement masks/borders as explicit image render data shared by canvas and export. Decide whether reset means “effects only” or full original geometry and label it accordingly. Use visual fixtures for each supported frame in landscape, portrait, and cropped states.

### F11 — Layout state disappears when filled; template application is additive

**P2 · Reproduced**

**Evidence:** `vision/canvasAdapter.ts:748-761,1205-1207,1253-1255,1318-1321`; `vision/document.ts:209-218,313-317`.

Filling a slot removes its placeholder and transfers identity to `gratitudeLayoutPlacement`. Serialization only reads `gratitudeLayoutSlot`, so it no longer recognizes the filled slot. Once all placeholders are gone, a structured board is serialized as freeform with no layout ID.

Applying a template removes old placeholders but keeps previous template headings and filled content. Repeated application creates overlapping headings and can add a new set of slots over old photographs.

**Fix:** persist layout instances and slot assignments independently of placeholder visibility. Define template application modes explicitly, such as replacing a template-owned structure or adding a new section, with an undoable preview.

### F12 — Asset acceptance outruns the license policy

**P1 · Reproduced + source-confirmed**

**Evidence:** `assets/providers/wikimedia.ts:23-60`; `assets/registry.ts:79-87`; `assets/contracts.ts:21-29,96-105`; `assets/providers/rijksmuseum.ts:23-33`; `server/rijksmuseum.mjs:80-88`; `GRATITUDE_IMPLEMENTATION_STATUS.md:19-22`.

Wikimedia treats every non-public-domain license as Tier C, including unknown “Open license” metadata. It does not propagate ShareAlike or implement an explicit supported-license allowlist. The registry admits Tier C. A mock CC BY-SA 4.0 result was accepted with no `shareAlike` marker.

The Rijksmuseum adapter assigns a generic open-data policy label without carrying per-image rights from the server response. Dataset openness and an individual image's reuse conditions are not equivalent evidence. Asset normalization also guesses a tier for invalid/missing tier values.

**Impact:** the UI's “Any safe license” promise is stronger than the implemented policy; downstream exports cannot reliably enforce rights that were never normalized.

**Fix:** use an explicit license-policy model: recognized license/version, permitted uses, required notices, attribution fields, modification indication, and ShareAlike handling. Reject or quarantine unsupported/unknown rights. Keep provenance distinct from a verified reuse decision. This finding concerns missing policy enforcement; it is not a determination that any particular exported board violates a license.

### F13 — Export safety and fidelity differ by output path

**P1 · Source-confirmed**

**Evidence:** `vision/canvasAdapter.ts:345-493,513-547,1357-1379,1488-1517,1570-1624`; `App.tsx:1462-1519`; `components/GratitudeShell.tsx:95-98`.

- High-resolution/print/video use `renderBoard`; selected PNG uses `renderSelection`; HTML reel directly interpolates scene content. The host's `onExport` hook is not a shared gate for these direct adapter methods.
- A missing HTML-reel image falls into the generic-shape branch instead of blocking export, despite the dialog promising readiness checks.
- Selected PNG and HTML reel omit the board renderer's credit footer and do not automatically include a credit companion file.
- Board footer credits include title/author/license label but not source/license URLs or edit information. The separate credit text omits `licenseUrl` and is optional.
- Selected export has no counterpart to the board's 16-million-pixel limit. Board export adds credit-footer pixels after calculating that limit.
- Board validation scans all scene images rather than a clearly defined exported set; a missing off-board image can block a board-frame export.

**Fix:** build a shared export plan containing the exact included elements, resolved binaries/fonts, crop/mask transforms, dimensions, license requirements, and warnings. Every encoder should consume the same preflight result. Budget the final output, including any credit area. Display actual pixel dimensions before download.

**Acceptance:** equivalent content is exported across formats; missing included images block every relevant output; off-board unrelated images do not; required credits follow each output automatically.

### F14 — The three reel outputs have incompatible semantics

**P2 · Source-confirmed**

**Evidence:** `vision/document.ts:326-336`; `vision/canvasAdapter.ts:1419-1486,1527-1624`.

The semantic document defines element order and duration. The JSON reel plan derives a different ordering from raw `customData.reelOrder`. HTML iterates raw scene order and uses generic image/text/shape cards, losing crop, flip, typography, and much of the board styling. Background photos/textures are not excluded by the HTML/plan filters.

Video is a fixed 4.5-second zoom on one whole-board screenshot, not the plan's per-element sequence. If WebM is unsupported but MediaRecorder supports another format, the recorder falls back to its default while the output is still labeled `video/webm` and `.webm`. There is no recorder error rejection, cancellation, or comprehensive failure cleanup.

**Fix:** specify whether the product offers a board animation or a sequenced story. Use one versioned reel plan for HTML and video, negotiate the actual MIME/container, implement error/cancel cleanup, and provide duration/progress. Label different products distinctly if both are retained.

## 5. UI/UX findings

### F15 — Essential commands are defined but not exposed in the host shell

**P1 · Source-confirmed**

**Evidence:** `App.tsx:1736-1777`; `packages/excalidraw/components/LayerUI.tsx:236-243,473-496,632-677`; `components/AppMainMenu.tsx:11-21`; `components/AssetPanel.tsx:425-451`.

The engine supplies `tools`, `properties`, and `menu` slots to `renderEditorUI`. The host renders only `history` and `zoom`. Supplying `renderEditorUI` disables the normal fixed-side UI and mobile menu. `AppMainMenu` supplies tunnel content, but the host omits the menu slot containing its outlet.

**Consequences:** the shell has no visible equivalent entry points for opening/saving an editable scene, clearing/starting over, drawing tools, native shapes, or sticky notes. The “Frames” asset category inserts rasterized assets; it is not an equivalent native shape-creation tool. Some keyboard/context-menu paths may remain, but they do not solve discoverability or touch access.

**Recommendation:** establish a product-owned Board menu (New, Open, Save editable copy, recovery) and a compact creation toolbar (select, photo, text, note, shapes, draw). Reuse engine slots where appropriate. Verify reachability with pointer, keyboard, and touch tests.

### F16 — Responsive CSS contains concrete cascade conflicts

**P1 · CSS-confirmed; fresh visual verification pending**

**Evidence:** `index.scss:988-999,1138-1278,1313-1322,1562-1592,1627-1629,1816-1821,2034-2057`.

1. `.gratitude-editor .gratitude-editor-footer` sets `bottom: 16px` with two-class specificity. The mobile `.gratitude-editor-footer` sets a higher offset with only one-class specificity, so it loses. The fixed mobile asset rail has higher z-index and occupies the bottom region: undo/zoom/Fit page are at risk of being covered.
2. Mobile toolbar controls initially get 44px minimum height, but a later ≤900px rule sets the same selectors to 34px, undoing that improvement.
3. Desktop-style side panels persist until 700px. At a 768px viewport, the 376px asset area plus the 300px inspector leave only 92px before borders/padding; the effective canvas can be even narrower.
4. Asset-panel closing is a phone-only control. Tablet users cannot reclaim the large fixed asset area through the same affordance.

**Recommendation:** consolidate responsive rules beside each component; explicitly reserve bottom-rail space; choose an inspector overlay/collapse breakpoint based on the minimum useful canvas width, not only the phone breakpoint. Validate at 390×844, 700px, 768px, 900px, and desktop widths, including both panels open.

### F17 — Asset search state can become inconsistent

**P2 · Source-confirmed**

**Evidence:** `components/AssetPanel.tsx:301-408,526-557,621-625`; `assets/registry.ts:130-163`; `assets/providers/iconify.ts:81-103`.

- Initial searches use an `active` flag, but `loadMore` has no query-generation guard. An old page can append results/cursors after the user changes category/query.
- Orientation/license filters are hidden outside Photos/All but remain active in every search. For example, “Credit required” can silently eliminate no-credit stickers.
- `online` changes update the notice but do not appear in the search effect's dependencies. Reconnecting does not automatically restore remote results as the copy implies.
- `Promise.allSettled` waits for every provider before returning any results. One stalled direct provider can delay already-ready local assets; browser requests have no shared cancellation/deadline contract.

**Recommendation:** use a query-keyed search controller with generation IDs and AbortSignals, render local and remote results progressively, scope filters per category, and refetch on connectivity transitions. Preserve provider-specific errors in expandable details instead of only a generic notice.

### F18 — Favorites are silently truncated on reopening

**P2 · Reproduced**

**Evidence:** `assets/libraryState.ts:5-6,38-41,59-66`.

Favorite insertion has no limit, but loading applies `MAX_RECENTS` (30) to favorites as well. The session can show 31 or more favorites that disappear after reload.

**Fix:** separate retention policies. Favorites should persist until deliberately removed, or have a clearly enforced/explained limit at insertion. The audit round-tripped 31 favorites and read back 30.

### F19 — Asset previews and placed artwork can differ materially

**P2 · Reproduced for safe gradients; other provider examples need visual fixtures**

**Evidence:** `assets/sanitizeSvg.ts:2-41,70-108,121-139,150-157`; `components/AssetPanel.tsx:734-743`; `App.tsx:1543-1549`.

The sanitizer intentionally removes executable content, but also removes `defs`, gradients, masks, `use`, styles, and any `url(...)`, including safe local gradient references. The audit confirmed a valid red-to-blue gradient becomes a rectangle with no fill attribute. SVG-to-PNG always uses a square 512px canvas, reducing effective resolution and changing aspect-ratio handling for nonsquare artwork.

Recoloring touches descendants with explicit fill/stroke but not root/inherited colors. Click insertion applies the selected recolor; drag serialization sends the original asset without that customization, so the two insertion methods can differ.

**Recommendation:** keep executable-content defenses, but use a documented supported SVG subset with safe local-reference handling or a controlled conversion service. Validate every curated asset through the same conversion pipeline used for placement. Preserve aspect ratio, expose compatible resolution choices, and share one customized insertion payload between click and drag.

### F20 — Processing and caching are bounded inconsistently

**P2 · Source-confirmed performance/resource risk**

**Evidence:** `vision/canvasAdapter.ts:813-987`; `assets/cache.ts:7-10,101-138`; `assets/registry.ts:46,89-95,250-267`; `App.tsx:1617-1621,1659-1672`; `server/rijksmuseum.mjs:41-76`.

- Every slider event can decode the original, allocate two canvases, encode PNG, hash it, and create a data URL. The stale-generation check comes near the end, so superseded work still spends most of its CPU/memory.
- Blob memory limits are entry counts, not bytes. Forty allowed 20MB assets could alone approach 800MB before decoded image/canvas allocations.
- Reading a persisted blob adds it to memory without the write path's eviction loop. `resolvedAssets` has no bound.
- General asset size checks occur after downloading the complete body. Upload byte limits do not limit decoded megapixels; the background-upload path lacks even the regular upload's byte limit.
- One Rijksmuseum search can fan out into up to 12 additional record requests. The checked-in API wrappers have no application-level rate/quota middleware; deployment-level protection was not verified.

**Recommendation:** debounce/coalesce preview work; use worker/OffscreenCanvas processing where supported; commit one history step per completed interaction; cancel stale work early. Apply byte-based LRU limits on reads and writes, decoded-pixel limits, bounded downloads, and public API request budgets. Benchmark on a representative low-memory phone before claiming responsiveness.

### F25 — Feedback, accessibility, and task completeness need a dedicated pass

**P2 · Source-confirmed; real-device/assistive-tech checks pending**

**Evidence:** `components/GratitudeShell.tsx:18-51,80-95,298-310`; `components/AssetPanel.tsx:218-250,277-299,835-910`; `components/GratitudeSelectionToolbar.tsx:198-201`; `components/TopErrorBoundary.tsx:34-35`; `index.scss:1263-1265,1779-1784`.

| Problem | User consequence | Recommended correction |
| --- | --- | --- |
| Board name is hidden below 700px with no replacement rename control | Phone users cannot perform the same naming task | Put rename in a mobile Board menu |
| No persistent saving indicator or visible editable-backup flow | Users cannot know what survives closing/reloading | Show save scope/state and an editable backup action |
| Error boundary claims “Your board is still saved locally” unconditionally | Reassurance can be false after save failure or unsaved changes | Base recovery copy on the last committed revision |
| Placement/replacement host catches resolve normally | AssetPanel can record a failed placement as Recent | Return a result or rethrow; update recents only after success |
| No per-asset placement progress or busy guard | Repeated clicks can queue duplicates during slow downloads | Show loading/inserted/retry state on the selected card |
| Export dialog's `aria-labelledby` is on its inner section, not the dialog | Dialog container has no explicit accessible name | Associate the dialog itself with its heading |
| Modal focus is moved in but not restored on close; page is not made inert | Keyboard/screen-reader position and modal isolation are incomplete | Use a shared dialog primitive with focus restoration/inert handling |
| Photo edit promises have no visible failure channel | Controls appear to do nothing after reload/storage problems | Inline error + retry/replace actions |
| Skeleton/reel animation has no reduced-motion alternative in these implementations | Motion preferences are not respected | Add reduced-motion handling and pause controls |
| Product strings are hard-coded while upstream language infrastructure remains | Mixed-language interface when locale changes | Localize the product shell or explicitly scope supported languages |
| Seven export choices are shown at the same level | Technical choices distract from the main sharing task | Primary PNG/print; advanced story/manifest/credits section |

Also review photo-tool semantics: `filterCss` (`vision/canvasAdapter.ts:81-110`) implements highlights/shadows as global contrast/brightness adjustments and negative warmth as a sepia/hue rotation. Those are not tonal-range or color-temperature corrections. Either improve processing or use labels that accurately describe the effect.

### Journey-level UX assessment

1. **Start:** welcoming copy and template/layout shortcuts are useful, but users cannot readily discover drawing, native shapes, or notes. The starter overlay has no explicit “start blank” dismissal.
2. **Add:** local fallbacks help, but providers should progressively load; show actual insertion progress and keep click/drag results consistent.
3. **Arrange:** background layer rules and undo must be predictable. A small Layers control would also help recover covered or off-board content.
4. **Edit:** prioritize correct crop/fit/reset and durable originals over adding more named effects. Show a processing state without flooding history.
5. **Return:** explain “saved on this device,” supply editable backup/reopen controls, preserve title/favorites, and make missing-image recovery actionable.
6. **Export:** show the exact output preview, dimensions, included credits, and format. Avoid calling unrelated whole-board and per-element animations the same reel.

## 6. Architecture and operational findings

### F21 — “Canonical document” is currently a lossy projection

**P1 · Architecture-confirmed**

**Evidence:** `vision/model.ts:1-58`; `vision/document.ts:176-339`; `vision/repository.ts:8`; `App.tsx:200-218,375-384`.

The semantic model records bounds, type, engine IDs, limited metadata, assets, and reel hints. It does not contain text content, complete shape styling, path points, complete image/file linkage, binding/group relationships, or background image/texture references sufficient to reconstruct the board. Startup restores the engine scene; the repository is primarily consulted for the title/metadata.

This is a useful **companion index**, but it is not yet an independent authoritative document. Treating it as canonical invites a future save/export/migration implementation to lose user content.

Additional consistency issues: `quote` metadata is not preserved as a semantic quote by the current type selection, and `reelConfig` defaults are regenerated rather than using all previously stored configuration. Validation is structural but does not deeply validate image edit metadata or repair uniqueness/reference integrity.

**Recommendation:** explicitly choose the authority. Near term, keep a versioned engine-scene payload and a versioned product metadata index in one board envelope. Long term, either make the semantic model reconstructable with tested migrations or continue describing it honestly as a projection. Do not maintain two independently writable “truths.”

### F22 — Boundaries exist on paper but orchestration is still highly coupled

**P2 · Architecture-confirmed**

**Evidence:** `App.tsx` (1,884 physical lines), `vision/canvasAdapter.ts` (1,635), `components/AssetPanel.tsx` (915), `index.scss` (2,058); `vision/architecture.test.ts:11-19,33-39`; `packages/excalidraw/components/App.tsx:2182,11031,11443-11446`; `docs/EXCALIDRAW_PATCH_LEDGER.md`.

The adapter is responsible for command translation, image processing, browser downloads, print windows, credits, HTML generation, video recording, and layout creation. The React host owns board mutation and migrations outside that boundary. Scene `onChange` both observes and mutates, repeatedly scanning and sometimes repairing the same scene.

The architecture test checks a `from "@excalidraw/` regex only in `assets` and `components`. It does not prove that persistence/export semantics are isolated, that `vision` is engine-independent, or that product-specific engine patches are controlled. Raw Gratitude metadata remains hard-coded in engine input/rendering logic.

**Risks:** unrelated changes interact, reentrant updates become hard to reason about, and upstream merges require behavioral archaeology. Legacy collaboration/Firebase paths also remain in the host despite collaboration being disabled.

**Recommendation:** extract cohesive services around invariants, not arbitrary line counts:

- `BoardRepository`: durable revisions, migration, recovery, referenced-file reachability.
- `BoardCommands`: insert/replace/resize/layout intent with target IDs and transaction boundaries.
- `ImagePipeline`: originals, normalized crop, derivatives, cancellation, worker processing.
- `AssetSearchController`: query generations, cancellation, provider status, policy decisions.
- `ExportPlanner` and format-specific encoders: one validated scene snapshot and policy contract.
- A smaller engine adapter that implements commands and maps selection/render state.

Keep engine extensions configurable and record every supported patch with rationale and tests. Run migrations once at load/version boundaries instead of continuously rewriting user-editable layout colors in `onChange` (`App.tsx:1270-1346`).

### F23 — Deployment paths do not provide equivalent functionality

**P1 · Configuration-confirmed**

**Evidence:** `Dockerfile:16-20`; `docker-compose.yml:14-20`; `excalidraw-app/package.json:49-53`; `excalidraw-app/vite.config.mts:201-347`; `api/*.mjs`; `vercel.json:43-44`.

The Docker runtime is nginx with static build files. It has no Node API service or reverse proxy configuration for `/api/pexels`, `/api/openverse`, and the other provider routes. The documented `start:production` path uses `http-server`, also static-only. By contrast, Vite dev/preview explicitly install provider middleware and Vercel has separate function handlers.

**Impact:** the app can build successfully and serve its shell while core remote asset discovery returns 404/HTML. Local assets can mask the partial failure. Docker's runtime environment variables and mounts do not turn the nginx container into a running Vite/API service.

**Recommendation:** declare supported deployment modes. Either deploy a provider API alongside static hosting and configure its base URL/proxy, or explicitly offer an offline/local-assets-only static mode. Add endpoint smoke checks to each deployment recipe. Consolidate the repeated dev/preview route registration around the same handlers.

### F24 — Monitoring ownership has not been fully migrated

**P1 for a deployment where enabled · Conditional risk**

**Evidence:** `sentry.ts:5-24,33-38`; `components/TopErrorBoundary.tsx:18-22`; `excalidraw-app/package.json:46-47`.

Sentry's environment map includes any hostname containing `vercel.app`, and the DSN remains a hard-coded upstream destination. Unless `VITE_APP_DISABLE_SENTRY=true` is supplied, a Gratitude Vercel deployment can initialize that destination and capture errors/console errors. Docker explicitly disables Sentry; the normal app build script does not itself guarantee that flag.

**Impact:** telemetry ownership and privacy expectations can be wrong. This audit did not verify actual deployed flags, destination ownership, or any transmitted user content.

**Recommendation:** make the DSN an explicitly owned environment setting, default to no collection when unset, use exact deployment-environment matching, and document/redact the fields sent. Remove upstream production destination defaults.

### F26 — Documentation and test evidence overstate completion

**P2 · Verified**

**Evidence:** `GRATITUDE_IMPLEMENTATION_STATUS.md:5-15`; `GRATITUDE_MIGRATION_TASKS.md:3-14`; `docs/DEPLOYMENT.md:5-9,22,30-32`; `docs/smoke-gratitude.cjs:10-21`; `vision/canvasAdapter.test.ts:67-133`; `.github/workflows/test.yml`; `.github/workflows/test-coverage-pr.yml`.

- Every implementation phase is labeled Complete, but persistence/export/layout failures above contradict the corresponding acceptance claims.
- The migration checklist says there is no Gratitude app yet and leaves major current features unchecked.
- Deployment documentation describes Next.js, CDK, Cognito, and `apps/web`; the current project is a Vite/Excalidraw app with serverless provider endpoints.
- The smoke script uses `.tl-image` and old screens, so it does not validate the current editor.
- The adapter's existing test file contains only three tests and exercises no real image-processing/reload/export paths.
- CI does have PR coverage and lint/typecheck workflows; the problem is inadequate relevant assertions and existing failing assumptions, not an absence of CI configuration.

**Recommendation:** archive superseded documents explicitly; maintain one current architecture/deployment guide and a feature matrix with implementation, regression-test, and browser-verified status separately. Update old tests for intentional board layers while preserving meaningful history assertions.

### Build and maintenance observations

The production build passed but emitted a large-chunk warning. Measured emitted artifacts included:

| Artifact | Minified size | Gzip size |
| --- | --- | --- |
| Main App JavaScript chunk | 1,699.68 kB | 539.84 kB |
| App CSS | 227.00 kB | 36.96 kB |
| Mermaid conversion chunk | 594.87 kB | 172.89 kB |
| Font subset shared chunk | 1,823.88 kB | 738.71 kB |

These are artifact sizes, not measured first-load network transfer or responsiveness. Several optional chunks are already excluded from service-worker precaching. The service-worker build reported 23 precache entries totaling 2352.95 KiB. Profile the actual startup dependency graph before removing useful international fonts or optional engine capabilities.

The tooling also warned that its TypeScript ESLint parser officially supports `<5.2` while the project uses TypeScript 5.9.3, and Browserslist data was 19 months old. Align the tooling versions deliberately; a green typecheck does not eliminate unsupported-parser risk. The root also contains both Yarn and npm lockfiles while documenting Yarn as authoritative; establish one reproducible install path.

## 7. Recommended repair sequence

### Stage 1 — Protect work and restore core task access

1. Repair original/derivative reachability across save, load, export, and cleanup (F01).
2. Correct crop coordinate conversion and define source/derivative geometry (F02).
3. Make async mutation commits target/revision-aware and integrate them with history (F03/F04/F07).
4. Expose Board menu and creation tools; repair mobile undo/zoom positioning (F15/F16).
5. Surface real save failure states and provide an editable backup path (F05/F25).
6. Close the license-policy/export gaps before admitting unsupported assets (F12/F13).
7. Verify API availability and owned telemetry on the actual deployment target (F23/F24).

### Stage 2 — Make editing predictable

1. Fix unique placed-instance identity, layout persistence, and template application (F06/F11).
2. Correct layer ordering, Fit/Fill, frames, and reset semantics (F08-F10).
3. Fix search generation/cancellation, filter scope, reconnection, and favorites retention (F17/F18).
4. Resolve SVG preview/placement inconsistencies with visual fixtures (F19).
5. Add tablet/mobile task parity, modal focus behavior, clear progress/errors, and reduced-motion support (F16/F25).

### Stage 3 — Reduce architectural and operating cost

1. Establish one authoritative board envelope and shared export plan (F21/F13).
2. Extract image processing and command/persistence services from host/adapter monoliths (F22).
3. Introduce resource budgets and measure device performance (F20).
4. Unify reel semantics or clearly split the products (F14).
5. Replace obsolete docs/smoke tests and document supported engine patches (F26).

## 8. Proposed acceptance and regression matrix

| Workflow | Required evidence |
| --- | --- |
| Upload → filter → reload → reset offline | Original retained, derivative restored, no missing-original error |
| Large image → crop/layout fill → filter | Pixel framing remains stable in canvas and PNG |
| Slow background upload while editing | Newer user edits survive completion |
| Slow filter → replace/undo/delete | Old async result cannot overwrite newer intent |
| Background photo/texture undo/redo | One command equals one history step; guard does not reinsert undone layers |
| Insert same preset twice and duplicate | Unique semantic instance IDs and independent metadata |
| Fill all layout slots; reopen | Layout ID, slot assignments, and fit geometry survive |
| Apply a second template | Documented, predictable treatment of headings, photos, and slots |
| Fit → Fill → Reset | Stable container geometry and clearly defined reset behavior |
| Credit-required / unsupported-license assets | Policy applied consistently across board, selection, HTML, and video exports |
| Missing image inside/outside export selection | Correct scope-aware blocking and actionable recovery |
| Save failure / blocked storage / two tabs | Truthful save state; no stale title or silent partial commit |
| Search → load more → change query/category | No mixed results or old cursors; filter state remains visible |
| Save 31+ favorites → reload | Favorites retained or limit explicitly enforced before acceptance |
| Phone 390×844 and tablet 768px | Undo/zoom/create/rename/backup reachable with panels open and closed |
| Keyboard-only export/details dialogs | Correct name, focus trap, Escape, focus restoration, background isolation |
| Docker/static/Vercel deployment smoke | Shell, provider APIs, reload persistence, and exports verified for each supported mode |

## 9. Final conclusion

The main engineering risk is **cross-layer inconsistency**, rather than the choice of Excalidraw itself. Product metadata, image dependencies, history, storage, and exports currently make different assumptions about what constitutes a board and a completed operation.

A focused reliability pass can address the most serious defects without replacing the editor foundation. The most valuable next milestone is a demonstrably complete journey: **create a board, edit a large photo, undo safely, close and reopen offline, then export the same result with correct credits and accessible controls on desktop and phone.**
