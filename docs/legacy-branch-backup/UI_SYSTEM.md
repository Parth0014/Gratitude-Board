# Gratitude Studio UI system

**Status:** implemented foundation, September 2026. The product still uses the working name “Vision Board” in the interface. “Gratitude Studio” names the visual and interaction language, not a decided product rename.

## Experience principle

The workspace should feel immediately usable to someone familiar with Canva: tools on the left, the board in the center, editing controls near the selected piece, and a contextual inspector on the right. Gratitude's character comes from warm paper, an open-petal mark, gentle editorial type, and language that helps someone notice what matters. The board belongs to the user; interface decoration must never compete with their photos or words.

The product is a place to imagine and revise, not a promise of manifestation. Prompts are optional, editable, and free of judgments about wealth, bodies, or achievement. Keep personal meaning private by default. These are product decisions informed by `docs/DEVELOPMENT_BRIEF.md` §3, which treats the psychology evidence as design hypotheses rather than proof of app outcomes.

## Foundations

The source of truth for implemented values is [`apps/web/src/app/design-tokens.css`](apps/web/src/app/design-tokens.css). Components should use semantic roles instead of new hex values.

| Role        | Token                            | Value                 | Use                                    |
| ----------- | -------------------------------- | --------------------- | -------------------------------------- |
| Main ink    | `--g-ink`                        | `#201A1B`             | Primary text and icons                 |
| Soft ink    | `--g-ink-soft`                   | `#58494D`             | Supporting copy and metadata           |
| Brand rose  | `--g-rose`                       | `#EA436B`             | Brand identity and decorative accents  |
| Action rose | `--g-rose-action`                | `#C52C55`             | Filled primary actions                 |
| Hover rose  | `--g-rose-hover`                 | `#A91F45`             | Hovered primary actions                |
| Rose ink    | `--g-rose-ink`                   | `#B5224B`             | Small colored text and focus accents   |
| Rose wash   | `--g-rose-wash`                  | `#FFF1F4`             | Selected navigation, gentle highlights |
| Paper       | `--g-paper`                      | `#FFFBFF`             | Page background                        |
| Surface     | `--g-surface`                    | `#FFF8F7`             | Panels and cards                       |
| Canvas      | `--g-canvas`                     | `#FFFFFF`             | Editable board, image backing          |
| Workspace   | `--g-workspace`                  | `#F6F1F4`             | Neutral area around the canvas         |
| Line        | `--g-line`                       | `#EADDE1`             | Dividers and subtle borders            |
| Sage        | `--g-sage-ink` / `--g-sage-wash` | `#3E6655` / `#E9F0E4` | Saved and settled states               |
| Honey wash  | `--g-honey-wash`                 | `#FFF2DF`             | Reflective note accents                |

Inter is the interface font: controls, navigation, inspector labels, body text, and canvas tooltips. Prata is reserved for editorial moments such as the entry heading and reflective cards. Do not use display type in dense controls. Use the spacing scale (`--g-space-*`), three radius roles, and the two shadow roles. Shadows mark floating or elevated surfaces; side panels rely on borders, not heavy shadows. Motion uses `--g-motion-fast` or `--g-motion-standard` and respects reduced-motion preferences.

## Anatomy and behavior

1. **Entry:** one clear create action, a small example board, and a short reassurance that anything can change. The example illustrates possibility rather than a lifestyle standard.
2. **Start:** a few editable examples plus a visible blank board option. Choosing an example is a starting point, never a locked template.
3. **Studio header:** brand/return, editable title, honest save state, and export. Keep task controls stable as selection changes.
4. **Left rail and library:** tool categories stay in the same location. The active category has a rose wash and inset marker. Library items should show what will be inserted before selection.
5. **Center canvas:** neutral white board on a soft workspace. Pointer movement, selection, and drag must stay responsive; decoration belongs outside the editing surface.
6. **Contextual inspector:** show controls for the selected piece, with a calm empty state when nothing is selected. Start with the action most likely needed next. Optional meaning fields can be revealed without blocking editing.
7. **Mobile:** keep the canvas first, then tools and inspector. Controls need comfortable touch targets and the same accessible names as desktop.

### Component rules

- Primary action: filled action rose, white text, pill or control radius depending on context; only one visually dominant action per region.
- Secondary action: paper or surface fill, visible line, dark text; hover adds a rose wash.
- Selected state: combine fill with a border or indicator so color is not the only signal.
- Fields: explicit labels, field-line border, clear error text, visible focus ring. Placeholder text cannot stand in for a label.
- Cards: one radius and one spacing rhythm within a group. Visual previews have consistent image treatment.
- Tooltips: describe the result of an icon control. Never make the tooltip the only way to discover a core action.
- Empty states: name the next concrete action. No guilt, ranking, forced positivity, or pressure to fill every area.
- Save and export: say exactly where data lives and what format is produced. Do not display success before persistence succeeds.

## Voice and psychology

Use invitations (“What matters here?”), not instructions about the user's life. Celebrate authorship and change: “Replace this,” “Keep what feels true,” “You can come back.” Let people skip a question, use images before words, or leave an aspiration unresolved. Ask for a small next step only when it helps; do not turn every vision into a productivity goal. Personal meaning is written by the user, never inferred from a photo.

The intended audience includes midlife women in Western markets, but the visual language must avoid assumptions about gender, family, income, beliefs, or appearance. Test comprehension and comfort with actual users rather than relying on aesthetic stereotypes.

## Implementation and review

- The open-petal mark is code-native in [`brand-mark.tsx`](apps/web/src/components/brand-mark.tsx) and reused across entry, board list, and studio.
- Global foundations and entry styles live in [`globals.css`](apps/web/src/app/globals.css); workspace styles live in [`workspace.css`](apps/web/src/app/workspace.css). New patterns should use tokens and existing shadcn/Radix primitives.
- Check desktop and narrow mobile widths, keyboard order, visible focus, contrast, screen-reader names, and reduced motion. `npm run check` and the Playwright browser suite are the minimum code gates.
- Next design-system work: extract repeated editor controls into shared components; define selected/hover/disabled/empty states for every tool; make contextual inspector sections consistent; visually review imported and user-generated boards at several sizes.

Layout familiarity is informed by [Canva's editor guidance](https://www.canva.com/help/glow-up/) and [template editing guide](https://www.canva.com/design-school/resources/using-and-customizing-templates/). Semantic tokens follow the role-based approach described in [Atlassian Design System](https://atlassian.design/foundations/design-tokens/). These are interface references, not copied assets or a claim of feature parity.
