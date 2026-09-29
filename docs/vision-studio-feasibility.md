# Vision Studio architecture feasibility

Assessment against the current Gratitude Excalidraw fork, 28 September 2026.

## Feasible now

- The editor exposes `updateScene`, `addFiles`, selection, viewport and export dialog controls through `ExcalidrawImperativeAPI`. These support an adapter without new engine patches.
- Element `customData` is serialized with scenes. Asset provenance and a stable Gratitude object ID can travel with placed objects through the current local save/reload path.
- The existing `GratitudeResources` panel already owns photo insertion, while `GratitudeShell` owns export entry. Both can be migrated incrementally.
- Bundled photos and local uploads offer a small first provider and placement path. Search can run against provider contracts without loading a large catalog.

## Gaps and constraints

- `App.tsx`, `GratitudeResources.tsx`, `BoardSettings.tsx`, `GratitudeSelectionToolbar.tsx`, `GratitudeWelcomeScreen.tsx` and `boardPage.ts` import Excalidraw internals. The current persistence, collaboration, board layers and selection logic also work in raw scene types. A full separation is a staged migration, not a one-file swap.
- The first adapter covers image insertion, selection, deletion and the current export dialog. Text, shapes, updates, grouping, compound object history and viewport helpers still need to move behind it.
- `VisionBoardDocument` is now saved as a versioned companion to the raw Excalidraw scene, with a read/upgrade path for legacy scenes. The raw scene remains the source used to reopen boards until the semantic format covers every board feature and migration is verified.
- The three bundled photo files have no confirmed source or license record in the repository. They are tagged as provenance unverified and require review before public distribution.
- Remote image and SVG sources need verified provider terms, URL policy, sanitization and attribution UI before they are enabled. Those are not supplied by the current editor.
- A compound product object can map to multiple raw elements, but the fork has no Gratitude transaction layer yet. Verify undo and selection behavior before relying on compound objects.

## First increment

The initial increment added product and asset contracts, a provider registry, and a canvas adapter. The temporary photo assets were removed. A new Asset panel now provides generated Gratitude stickers, on-demand Tabler search through Iconify, and user photo uploads. External SVG is sanitized and rasterized before placement. Existing scene storage remains unchanged, including images already placed on saved boards.

## Next implementation order

1. Add a read/upgrade path from existing raw scenes into a versioned `VisionBoardDocument`, without overwriting old saves.
2. Move text, shapes, selection and board settings mutations into adapter methods; keep app persistence and collaboration behavior stable.
3. Add a curated, license-verified vector provider and an SVG sanitizer with tests before enabling vector placement.
4. Add a Gratitude inspector for asset information and attribution, then consider a remote image provider with license filtering.
