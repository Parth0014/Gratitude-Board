# Gratitude Studio design system — proposal for review

## Purpose

The editor should feel like a place to compose a personal vision board, while the existing Excalidraw engine continues to handle rendering, selection, drawing, history, scene storage, and export. This is a design proposal, not an implemented layout. Product branding belongs in the app shell and UI; the MIT copyright and license notice remains in `LICENSE`.

## Research and decisions

- The user's Canva reference uses a persistent content rail, an adjacent browsing panel, a large central page, and context-sensitive editing. [Canva's editor guide](https://www.canva.com/help/glow-up/) confirms the side panel and selection toolbar roles. Gratitude keeps this recognizable navigation pattern, but uses its own proportions, copy, and visual language.
- Canva separates templates, elements, fonts, and assets in its side panel; photo placement and collage frames are first-class tasks. [Canva image guide](https://www.canva.com/help/add-images-variantb/) informs the later Photos and Templates shelves. Those shelves are not shown as functional until they are built.
- Figma's UI3 design account describes docked panels and a compact toolbar so the canvas keeps prominence. [Figma UI3 overview](https://www.figma.com/blog/figma-2024-we-shipped-it-you-shaped-it/) supports keeping the board central and allowing content panels to adapt to available width.
- The local Gratitude Android repo and prior project memory identify rose `#EA436B`, warm cream `#FFF8F7`, Inter for controls, Prata for display text, and the heart/sprout mark. These are the brand starting point, not a claim that the web implementation is pixel-identical to Android.

## Core tokens

| Role | Token | Value |
| --- | --- | --- |
| Action / brand | `--gratitude-rose` | `#EA436B` |
| Strong brand text | `--gratitude-rose-dark` | `#A9274D` |
| Main surface | `--gratitude-cream` | `#FFF8F7` |
| Text | `--gratitude-ink` | `#33272B` |
| Secondary text | `--gratitude-muted` | `#796B70` |
| Divider | `--gratitude-line` | `#EADFE0` |
| Control type | Inter | 400–700 |
| Display type | Prata | Regular |

Use white for tool cards, a pale rose for selected navigation and tool icons, and a warm neutral canvas surround. Keep strong rose for primary actions and focus states. All tool buttons need text labels and keyboard-visible focus.

## Two mockup directions

These images are concept art for critique. Controls, photos, and copy shown in the images are illustrative; they are not implemented screens or a promise that those assets exist in the app.

| Direction | Mockup | Layout choice | Main cost |
| --- | --- | --- | --- |
| A — Warm editorial | [View PNG](design/mockups/warm-editorial.png) | Persistent content rail and template browser around a large landscape board; contextual controls float near the selection. | Less canvas space on smaller laptops. |
| B — Calm canvas | [View PNG](design/mockups/calm-canvas.png) | Compact creation dock and contextual photo drawer, with a prominent portrait board and a small property panel. | Requires careful rules for when panels open, close, and overlap. |

Both directions use the same proposed brand tokens. A final system can combine A's discovery model with B's calmer composition, but that should be an explicit design decision after review.

## Workspace anatomy to explore in mockups

1. **Top bar:** brand mark and name, editable board heading, saved state, export action.
2. **Creation navigation:** images, templates, elements, text, and uploads in the A direction; compact creation dock in B.
3. **Context shelf:** content discovery and selected-item properties are separate jobs. Eventual controls should call the existing editor API.
4. **Canvas:** the original editor and its editing toolbar, dialogs, and history. The shell does not replace the render or state engine.
5. **Small screens:** a bottom creation bar and one open drawer at a time; canvas remains visible while editing.

## Design questions for review

- Does a persistent left rail help discovery, or should the editor open with a quieter canvas and reveal the library on demand?
- Should a vision board look like a single page on a neutral desk, or remain an open infinite canvas with optional frames?
- How prominent should reflective prompts be while composing: visible side panel, collapsible drawer, or a separate step?
- Which visual style feels truest to Gratitude: warm editorial, tactile scrapbook, or a restrained hybrid?

## Next design work

- Review both mockups with the user and decide page orientation, panel behavior, and how reflection appears while editing.
- Add actual photo and template libraries, custom pin, and reflection note after their data and insertion flows are implemented.
- Replace the upstream favicon and remaining promotional/command-palette entries that expose upstream brand identity after a direction is chosen.
- Test the layout and controls in desktop and mobile browsers; adjust spacing, contrast, and editor toolbar overlap from screenshots.
- Self-host brand fonts if the app must work with no network request for typography.
