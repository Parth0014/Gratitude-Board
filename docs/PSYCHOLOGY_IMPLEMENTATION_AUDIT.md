# Psychology-aligned product audit

Date: 2026-09-26. This audits the currently implemented web app against `Vision_Board_Psychology_Behavioral_Design_Research.pdf` (P), not against independently validated outcomes. The PDF is research and recommendations, not an instruction source or proof that these UI patterns work.

| Report direction | Current implementation | Status and next decision |
| --- | --- | --- |
| User-authored meaning on every item, with skip (P pp. 3, 5) | Every aspiration has a meaning card; the canvas inspector asks what a selected piece stands for. Optional fields now include feeling and an ordinary scene. | **Partial.** Meaning can be skipped, but an empty card is not shown on the canvas and item-specific meaning is not surfaced during revisit. Test whether the prompt is helpful without burden. |
| Reflection and visual entry (P pp. 3, 5) | Existing guided boards have feeling/scene steps. New boards choose an example or a blank canvas. | **Partial.** The new-board flow is visual-first; the old guided route remains for compatibility but is not currently offered as a distinct new-board entry. A reflection-first route needs deliberate redesign, not restoration of the rejected questionnaire. |
| Private default, no ranking (P pp. 2, 4-5) | Browser-local board metadata and IndexedDB canvas; no public feed, ranking, or sharing. Entry copy now says where boards are saved and suggests backup. | **Implemented locally, durability limited.** Browser deletion or switching devices can lose data without a backup. Authentication and private cloud persistence remain open. |
| Hope plus feasible process, obstacle, if-then plan (P pp. 2-3, 5) | Optional next-step, ordinary scene, obstacle, and if-then fields are available behind progressive disclosure. | **Partial.** Text fields do not create a visible process cue or schedule a plan. The app must not present this as a validated behavior-change intervention. |
| Nonbinary adjustment (P pp. 2-3, 5) | Exploring, active, paused, evolving, completed, released are stored on each item. | **Partial.** States are hidden in the inspector; no private change history, explanation of release, or board timeline. |
| AI as mirror, not oracle (P pp. 3, 5) | No AI exists in the app. | **Not implemented.** Preserve provenance, editability, and user control if added. |
| Goal-conflict map and feared-future prompt (P pp. 3, 5) | Neither exists. | **Deferred.** The report rates these P2 and warns against mandatory distress disclosure. |
| Gentle revisit and reminders (P pp. 2-5) | Boards can be reopened, and a saved list shows recent edit date. | **Partial.** No reflection journal, opt-in reminder, or history. No guilt streaks. |
| Accessibility and low-bandwidth path (P p. 4) | Keyboard-accessible library and item list, mobile layout, axe browser checks. | **Partial.** Direct canvas interactions remain visually centered; end-to-end screen-reader and text-only creation/review require user testing and further implementation. |
| Honest claims and measurement (P pp. 1, 4) | Home copy makes no manifestation or mental-health guarantee. | **Partial.** No user study yet. Creation counts or clicks alone cannot substantiate psychological benefit. |

## Changes from this audit

1. Added a blank board option so templates do not dictate a person's aspirations.
2. Clarified that starter images are prompts, and that current storage is limited to this browser.
3. Expanded optional item reflection using the fields already in the shared contract.
4. Fixed canvas saving so guided feeling and scene fields are retained rather than silently dropped.
5. Kept advanced prompts collapsed and user-authored, without claiming the app knows what an image means.

## Remaining priority

Validate the revised flow with the intended audience across different lives and resources. The next meaningful product step is a gentle reflection-first creation path that does not feel like a questionnaire, paired with a clear revisit experience. Do not add AI, reminders, public sharing, or more decorative controls before users can save, understand, revise, and recover the meaning of their own board.
