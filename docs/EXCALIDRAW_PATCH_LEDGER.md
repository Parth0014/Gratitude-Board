# Excalidraw patch ledger

Gratitude Vision Studio treats Excalidraw as a rendering and interaction engine. Product panels, assets, document data, and editing commands must use the contracts in `excalidraw-app/vision`.

## Supported engine extensions

| Extension | Purpose | Product boundary |
| --- | --- | --- |
| `renderEditorUI` slots | Mount the Gratitude shell around the canvas | Host composition only |
| `snapToBoard` app state | Keep movable content inside the board when enabled | Exposed through `CanvasAdapter` |
| Image crop and fit data | Support cover, contain, and crop controls | Exposed through `CanvasAdapter` |
| Disabled action and tool flags | Keep engine commands out of the product UI | Configured by the host |

## Migration rule

New product features must not import `@excalidraw/*`. The allowed engine-facing code is:

- `excalidraw-app/App.tsx`, the integration host
- the four legacy host support components listed in `architecture.test.ts`
- `excalidraw-app/vision/engine/**`, board and scene invariants
- `excalidraw-app/vision/canvasAdapter.ts`, command translation
- `excalidraw-app/vision/document.ts`, scene serialization during migration

The architecture test enforces the boundary for product components and asset providers. Extend the adapter or an engine module when a product feature needs a capability that is missing from the public contract.

## Upstream cleanup backlog

Historical edits that globally remove Excalidraw toolbar, menu, action, and context menu behavior should move to host configuration. Until that migration is complete, keep those patches behaviorally stable and verify them against the upstream commit recorded in the architecture plan.
