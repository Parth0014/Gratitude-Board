# Asset library status

The first asset milestone is wired into the Gratitude app without changing the Excalidraw engine.

## Available now

- Four small Gratitude-generated SVG stickers are available immediately and require no network request.
- Searching queries the Iconify API for the `tabler` collection only. Results are loaded on demand, with no icon catalog bundled into the app. Tabler's icon set is MIT licensed. The selected icon ID, source URL, creator and license are saved with the placed element.
- Photo search uses Pexels through a server endpoint. Set `PEXELS_API_KEY` in a root `.env.local` and restart the dev server. The key stays out of the browser bundle. Search results retain photographer, source and Pexels License metadata. On Vercel, set the same environment variable in the project settings.
- PNG, JPEG and WebP uploads can be placed from the same panel. Their metadata is marked as user provided.
- External SVGs are parsed and rebuilt from drawing primitives, then rasterized to PNG before they enter the existing image pipeline. This prevents scripts, external references and unsupported markup from being stored in the board.
- Selecting a placed library item opens Gratitude's source and license inspector. The current local scene save path preserves the element metadata in `customData`.

## Current limits

- Stickers are rasterized on placement. They can be moved and resized, but their paths cannot yet be recolored or edited independently.
- Iconify search requires an internet connection. Generated stickers and previously saved image binaries remain available without it.
- The current board still reopens from the Excalidraw scene. A versioned `VisionBoardDocument` is now saved beside it with mapped objects and an asset manifest; it is a compatibility bridge, not yet the canonical persistence format.
- Tabler icons are covered by the Tabler MIT license. Include the full copyright and license notice in a production distribution that ships copies of those icons.
- Pexels photos download from its image CDN when placed. If a browser cannot fetch an image, placement fails with a visible toast; a server image proxy can be added if needed.
- Attribution-required sources are excluded until attribution UI and export rules are complete.

## Next increments

1. Extend the semantic board document with canvas settings and a scene importer, then make it the canonical save format after migration checks.
2. Add resilient photo downloads, clear offline status, and source-license verification controls.
3. Add frame, pattern, texture and font providers, then non-destructive editing controls.
4. Add layout templates, print and reel exports after the asset and save paths are stable.

API and license references: https://iconify.design/docs/api/search.html, https://iconify.design/docs/api/svg.html, https://tabler.io/license, https://www.pexels.com/api/documentation/, https://www.pexels.com/license/.
