# Editor feature matrix

**Status:** active implementation inventory, 2026-09-26. The user requested the entire six-phase roadmap, including minor controls. This matrix describes what the current app actually does and what still needs engineering. It is not a claim of tldraw feature parity.

The target is a Gratitude-owned editing experience with comparable interaction quality where it serves a vision board. We must implement our own behavior or use components under suitable licenses. The [tldraw SDK license](https://tldraw.dev/community/license) permits development use by default and requires an active license key for production; its source availability does not make the SDK permissively licensed. The user previously chose to avoid that requirement, so the app uses MIT-licensed Fabric.js. We can study documented interaction patterns but should not copy tldraw code, assets, trademarks, or interface wholesale.

Legend: **✓** working and covered by current tests; **◐** partial; **—** not built. Each row needs acceptance checks on desktop, touch, keyboard, persistence, export, and accessibility before promotion to ✓.

## 1. Calm, reliable canvas

| Feature                                     | State | Work remaining                                                                                                      |
| ------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------- |
| Select, move, resize, rotate, multi-select  | ✓     | More precision and accessibility review                                                                             |
| Hand/Space pan, wheel pan, zoom, fit        | ✓     | Zoom-to-selection and minimap                                                                                       |
| Keyboard nudge, Escape, shortcuts           | ◐     | Shortcut help, duplicate/copy/paste, Delete, zoom shortcuts                                                         |
| Undo/redo across canvas and piece details   | ◐     | 30 in-memory steps now cover editor edits; add durable history and batching, verify cross-tab conflicts             |
| Autosave, reload, backup                    | ◐     | Browser-local edits now queue immediate ordered writes; server persistence and cross-tab conflict resolution remain |
| Grid visibility, snap, three spacing values | ✓     | Smart object guides, alignment/distribution, ruler/guides                                                           |
| Selection handles and contextual actions    | ◐     | More precise multi-select, touch gestures, object lock, hide, group/ungroup                                         |
| Performance with large boards               | —     | Virtualization/asset sizing, load tests, memory bounds, recovery stress tests                                       |

## 2. Meaningful pieces

| Feature                                         | State | Work remaining                                                                                                                        |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Image, text, symbol-like pieces                 | ◐     | Actual vector/decorative elements instead of text symbols; alt text                                                                   |
| Upload and replace while retaining meaning      | ✓     | Media library, licensing/provenance and storage lifecycle                                                                             |
| Crop and masks                                  | ◐     | Centered original, square, 4:3 and 16:9 crops now save and export; add drag-to-crop, freeform/aspect locks, circle/frame masks        |
| Layers and arrange                              | ◐     | Front/back and one-step forward/back work; add a visual layer list, group, lock, hide                                                 |
| Meaning tied to a piece                         | ✓     | Better in-canvas access and revisit prompts                                                                                           |
| Typography, color, opacity, rotation            | ◐     | Inter/Prata, size, text/card color, opacity, numeric rotation now persist; add alignment, weight, spacing, transparent cards, presets |
| Shapes, lines, arrows, frames, freehand, eraser | —     | Own shape/document model, gestures, hit testing, binding and undo semantics                                                           |
| Rich text, hyperlinks, embeds, video            | —     | Rights, safety, accessibility and export models first                                                                                 |

## 3. Hope connected to ordinary life

| Feature                                                              | State | Work remaining                                                            |
| -------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------- |
| Optional feeling, ordinary scene, action, obstacle, if-then response | ✓     | Test burden and comprehension with users                                  |
| Reflection-first and visual-first entry                              | ◐     | Legacy guided route exists, but current new-board journey is visual-first |
| Values/why prompts and process imagery                               | —     | Optional contextual prompts, skip/stop controls, user wording             |
| Goal conflict and resource tradeoffs                                 | —     | Optional, non-judgmental time/energy/money/relationship mapping           |
| Text-only and low-bandwidth creation                                 | ◐     | Text can be added; full non-canvas editing and upload fallbacks remain    |

## 4. Personal style

| Feature                                            | State | Work remaining                                                                                       |
| -------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------- |
| Few editable starter compositions                  | ◐     | Three photo starters exist; improve content quality and layout variety                               |
| Board backgrounds, palette and mood directions     | ◐     | Four colors and a custom color now save and export; add cohesive mood directions and contrast checks |
| Smart layouts, alignment, spacing, frames          | —     | Responsive templates and editable constraints                                                        |
| Image borders, shadows, crop, filters              | ◐     | Centered crop and horizontal/vertical flip work; borders, shadows and filters remain                 |
| Text hierarchy, style presets, detailed typography | ◐     | Basic per-text style now works; presets and advanced controls remain                                 |
| Mobile and keyboard parity                         | ◐     | Core flow tested; every new control needs equivalent access                                          |

## 5. Living, private board

| Feature                                                  | State | Work remaining                                                                                                 |
| -------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| Exploring/active/paused/evolving/completed/released      | ✓     | Status UI can be clearer in the board overview                                                                 |
| Private revisit prompts, progress notes, reframe/release | ◐     | Optional board-level notes can be saved and removed; add item-linked history, reframing, and a fuller timeline |
| Version history beyond one session                       | —     | Durable snapshots, restore UI, retention, conflict handling                                                    |
| Hide/archive/delete and data export                      | ◐     | Piece delete and board backup work; board archive/deletion/retention remain                                    |
| Reminders                                                | —     | Opt-in schedule, easy quiet, notification fatigue checks                                                       |
| Account sync and private sharing permissions             | —     | Auth, authorization, server persistence, access review                                                         |

## 6. Optional expression and assistance

| Feature                                | State | Work remaining                                                             |
| -------------------------------------- | ----- | -------------------------------------------------------------------------- |
| PNG and JSON backup                    | ✓     | More export formats and resolution controls                                |
| Wallpaper/story/social renditions      | —     | Destination-safe crops, meaningful captions, privacy exclusions            |
| Reel/story timeline, motion and audio  | —     | Rendering architecture, source rights, music licensing, accessible preview |
| AI suggestions and reflection mirror   | —     | Explicit opt-in, provenance, editable suggestions, privacy boundaries      |
| Selective share/collaboration          | —     | Auth, scoped links, permissions, abuse controls, consent                   |
| SVG/JPEG/WebP/PDF and clipboard export | —     | Font/media embedding, background controls, browser-limit handling          |

## Delivery order and gates

Build and validate 1–2 before adding complex composition. Next, complete image crop and richer shape/document primitives; then finish reflection entry, style/layout, durable revisits, and finally rights-aware expression and optional assistance. The research brief's privacy, agency, and non-claim boundaries apply to every phase. Do not expose a control in the UI until its save, reload, undo, and export behavior is understood. A working local prototype is not production-ready until authentication, authorization, persistence, asset lifecycle, observability, and deployment are implemented and tested.
