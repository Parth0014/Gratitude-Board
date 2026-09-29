# Gratitude Vision Studio PDF implementation checklist

Status: implemented in the local editor. Authentication and account ownership are intentionally excluded by the current product decision.

## Architecture and persistence

- Product components depend on `CanvasAdapter`; the architecture test prevents new engine imports in product UI and providers.
- `VisionBoardDocument` is versioned and stored through `VisionDocumentRepository`.
- Product elements retain stable IDs, engine IDs, asset provenance, edit settings, reel order and layout metadata.
- Engine elements sharing a Gratitude ID serialize as one compound `VisionElement`.
- Board migrations and the Excalidraw patch boundary are documented and tested.

## Asset library

- One normalized provider contract backs built-in and remote sources.
- Built-in art, Iconify, Kenney, Noto Emoji, open illustrations, Pattern Monster, Pexels, Openverse, Wikimedia, Smithsonian and Rijksmuseum are registered.
- Search supports ranking, pagination, orientation and license filters, independent provider failures, cached results, favorites and recents.
- Asset URLs and SVG content are validated before rendering.
- Recolorable SVG assets have a user-facing color workflow.
- The panel reports offline state and distinguishes cached results from unavailable external content.
- Placed assets retain their provider, source and license metadata.

## Editing and design

- Photo crop entry, fit/fill, rotation, flipping and resizing are exposed.
- Filters and brightness, exposure, contrast, saturation, highlights, shadows, warmth, blur, fade and grain persist and export.
- Frames include rounded, circle, Polaroid, film, arch, heart, blob, organic and torn treatments.
- Border, shadow, glow, original preview, reset and photo replacement are implemented.
- Curated typography, font categories, text presets, decorative assets, patterns and textures are available.
- Font family, source and license information persists in the board manifest.
- Templates and more than ten semantic layouts coexist with freeform editing and slot replacement.

## Output and reliability

- Board PNG, 3x high-resolution PNG, selected transparent print-piece PNG, browser print/PDF, animated HTML reel, WebM reel, reel plan and attribution download are available.
- Attribution-required assets add a visible credit footer to generated board, print and reel canvas outputs.
- Exports fail visibly when an image or required font is unavailable.
- Large photo derivatives are capped for responsive editing while the original remains available for resets and replacements.
- Export dialogs expose progress, errors, keyboard focus management and Escape handling.

## Experience and acceptance coverage

- Desktop and mobile layouts use the Gratitude shell, asset rail, contextual editor and board footer.
- Tap-to-add, drag-to-add, selected-photo replacement, zoom, fit-page and board-boundary snapping are connected.
- Interactive controls have labels, pressed states and touch-sized targets.
- Type checking, strict linting, document/repository/provider tests and an automated browser smoke script cover the main boundaries.

## Explicitly outside the current scope

- Authentication.
- Account ownership and account-scoped cloud authorization.

Collaboration remains an optional future capability in the source PDF rather than an exit criterion for the local editor phases.
