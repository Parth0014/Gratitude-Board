# Interface research: making a vision board feel easy

Prepared 2026-09-25. This is a product-design synthesis from current official product/help pages and a source-code review of our app. It is a direction for the next design iteration, not a claim that users have validated it.

## Patterns worth learning from

| Product | Observed pattern | What it means for us |
| --- | --- | --- |
| Canva | People can preview a template, then customize it. The editor exposes a side panel for content and a toolbar whose options change with the selected element. | Show a real board preview before creation. Keep add-content and edit-selection actions distinct. Show image actions when an image is selected, not every setting at once. |
| Milanote | Its vision-board template starts with visual placeholders, accepts images/notes/quotes on a freeform board, includes image search, and supports explaining one's thinking. | Make the visual board the central object. Let people replace a starter image in place, then optionally attach meaning to it. The first task should feel like making a board, not completing a form. |
| Miro | Template previews explain the starting point and can offer prefilled or blank content. Templates remain reachable inside a board. | Starter boards should be visibly different compositions, not just different photo sets. Explain in one sentence what each starting point is for. Allow a later layout change without losing content. |
| FigJam | Its interface separates the board, file controls, and a grouped tool/object bar. Templates can be inserted from the toolbar. | Give the canvas the most room. Group creation actions. Keep file management out of the primary creative area. |

Official sources:

- Canva templates: https://www.canva.com/help/use-templates-variantb/
- Canva editor and contextual controls: https://www.canva.com/help/glow-up/
- Milanote vision board template: https://milanote.com/templates/moodboards/vision-board
- Miro templates and previews: https://help.miro.com/hc/en-us/articles/360017572134-Templates
- FigJam editor regions and toolbar: https://help.figma.com/hc/en-us/articles/15300412458647-Explore-FigJam-files

## Audit of our current implementation

The creation page now has three photo-based starter boards, which helps avoid a blank canvas. But the previews are four-image collages; they do not show the actual finished composition or which piece a user might change first. The first click immediately creates a board. A preview with a clear `Use this board` action would set expectations better.

The editor opens with the tldraw canvas and a long sidebar containing instructions, six stock photos, four symbols, upload, a four-item checklist, name form, add-text action, backup action, piece list, and (after selection) a meaning form. The three-step spotlight then adds another layer of instruction. This is likely the main source of cognitive load. Also, a template's preplaced photos already satisfy the checklist's `Add a photo` item before the person has done anything; that makes progress less meaningful.

The first visible instruction is to choose a photo even though four are already present. A better first action is `Choose one image you'd like to change` or `Add one image that feels like you`. Selection should reveal two obvious actions: `Replace image` and `What this means to me`. Moving and resizing can remain available with subtle direct-manipulation hints.

The canvas currently exposes tldraw's general-purpose editing UI. Some of its controls are useful for experts, but the product's primary actions are buried among drawing tools. The `Try a simple layout` action puts every shape into a three-column grid; it does not preview the change or preserve a designed template composition. It should not be presented as a beginner milestone yet.

On a narrow screen, the canvas is placed above the sidebar. The add-content shelf and meaning form can therefore be below the fold while a user is trying to edit an image. A bottom sheet or compact `Add`/`Edit` panel would keep the active action near the board.

These findings come from the current components and styles, not a usability study: `apps/web/src/app/boards/new/page.tsx`, `apps/web/src/components/board-editor.tsx`, and `apps/web/src/app/workspace.css`.

## Proposed interface direction

One creation flow, no beginner/expert mode decision. Start with a few distinct visual boards, and let experience level emerge through progressive controls. Each starter preview should show the actual layout and a one-line emotional invitation (for example, `A calmer everyday life`). Include a clear `Start blank` path for someone who already knows what they want.

In the editor, use three stable regions on desktop: a short top bar (board name, save state, export/menu), a narrow `Add` rail (Photos, Text, Symbols, My uploads), and the board. An `Edit` panel appears only when a piece is selected. Its first actions are `Replace`, `Write what it means`, and `Remove`; more controls can be collapsed under `More`. On mobile, show the board and one compact action bar, with add/edit tools in a bottom sheet.

Replace the modal spotlight with one in-context, dismissible prompt at a time. Initial prompt: `Pick one image to make this yours.` After the first selection: `Replace it, move it, or write why it matters.` After the first real edit, show a brief saved confirmation. Keep a `How this works` help entry available, but do not force a tour or completion checklist.

Meaning is a differentiator, but it should be invited at a natural moment. A selected piece could show `What does this picture stand for?` with one optional short field. `One small step` belongs in a later, optional reflection surface, not in the first image-edit interaction. Nothing should imply a user must disclose private feelings to finish a board.

Use vocabulary consistently: **board**, **image**, **text**, **meaning**. `Piece` is friendly in general copy but less precise for actions such as replacing a photo. Use labels on important controls, not icon-only buttons or hover-only tooltips. Show saved state in the header; place JSON backup under an overflow/file menu with a plain-language explanation that boards currently live in this browser.

## Suggested next design slice

1. Replace the creation cards with truthful full-board previews and a `Start blank` option.
2. Redesign the editor shell around canvas + compact add rail + contextual selected-image panel. Hide the general-purpose tldraw tools that are not part of our first-release workflow, while preserving access to move/resize/zoom.
3. Make `Replace image` work in place without making the user delete/re-add. Make the first-time hint follow the user's action rather than requiring `Next` clicks.
4. Move naming and backup to the top bar/menu. Move optional reflection behind the selected-image panel. Remove the checklist until progress can represent actual user actions.
5. Test the first board with 5 first-time users on desktop and mobile. Observe whether each can choose a starter, replace an image, add personal meaning, and find their saved board without coaching. Revise the design based on where they hesitate.

## Design principle

Borrow the useful interaction patterns from broad design tools, but keep this product smaller. The first session should have a visible board and one meaningful edit within a minute. The deeper tools should be discoverable when needed, without asking the user to learn a general-purpose design application first.

## Implementation note (2026-09-25)

The first studio redesign is implemented: compact header, left content rail/library, central canvas, contextual right inspector, mobile canvas-first order, in-place image replacement, and one dismissible inline hint. The earlier checklist and spotlight tour are removed from the active canvas UI. The six user reference images informed hierarchy and layout, but capabilities visible only in those images (reel editing, AI generation, music, collaboration, advanced crop/effects) were not presented as working actions.

Additional guidance reviewed: Apple's [sidebar guidance](https://developer.apple.com/design/human-interface-guidelines/sidebars), the public [apple-design skill](https://github.com/SudewaJay/apple-design-skill/blob/main/apple-design/SKILL.md), and [Canva's contextual editor description](https://www.canva.com/help/glow-up/). This guidance was applied as design reference; no external skill or plugin was installed into the environment.
