/**
 * The collaborator cursor layer: a DOM layer stacked as a sibling of the canvas — above all canvas
 * content, below the in-front layer and the UI panels — hosting each visible collaborator's cursor
 * (arrow, name tag, chat message). Off-viewport collaborators are the canvas-drawn hint arrows' job
 * (CollaboratorHintOverlayUtil), not this layer's.
 *
 * Cursors are DOM rather than canvas-drawn so their chrome styles and composes like the rest of
 * the UI. Re-render traffic is kept narrow: per-cursor positioning writes `transform` directly
 * (see `useTransform`), so a pointer move re-renders only the moved cursor; the camera transform
 * is written imperatively below, so a pure pan re-renders only cursors whose viewport visibility
 * flips (an equality-gated boolean per cursor); a zoom change re-renders every visible cursor,
 * because each one rescales by `1/zoom`.
 *
 * @public @react
 */
export declare const LiveCollaborators: import("react").NamedExoticComponent<unknown>;
//# sourceMappingURL=LiveCollaborators.d.ts.map