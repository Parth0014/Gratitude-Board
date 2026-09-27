import { OverlayUtil, TLOverlay } from '@tldraw/editor';
/**
 * @public
 * @deprecated Collaborator cursors are rendered as DOM elements rather than drawn to the overlay
 * canvas. Use `TLCursorProps`, the props of the `CollaboratorCursor` editor component.
 */
export interface TLCollaboratorCursorOverlay extends TLOverlay {
    props: {
        x: number;
        y: number;
        color: string;
        name: string | null;
        chatMessage: string;
    };
}
/**
 * Overlay util for collaborator cursors (arrow + name tag + chat message).
 *
 * @public
 * @deprecated Collaborator cursors are no longer drawn to the overlay canvas, so this util is no
 * longer part of `defaultOverlayUtils`. They render as DOM elements instead, customizable through
 * the `CollaboratorCursor` editor component. To keep drawing cursors to the canvas, pass this util
 * (or a subclass of it) to `overlayUtils` and set `components={{ CollaboratorCursor: null }}` so the
 * DOM layer doesn't draw them a second time.
 */
export declare class CollaboratorCursorOverlayUtil extends OverlayUtil<TLCollaboratorCursorOverlay> {
    static type: string;
    options: {
        zIndex: number;
        fontSize: number;
        nameMaxWidth: number;
        chatMaxWidth: number;
    };
    private _truncateCache;
    isActive(): boolean;
    getOverlays(): TLCollaboratorCursorOverlay[];
    render(ctx: CanvasRenderingContext2D, overlays: TLCollaboratorCursorOverlay[]): void;
    /** Name tag (no chat) - colored background with white text */
    private _drawNameTag;
    /** Name title (when chat is present) - text with shadow, no background */
    private _drawNameTitle;
    /** Chat bubble - colored background with white text */
    private _drawChatBubble;
    renderMinimap(ctx: CanvasRenderingContext2D, overlays: TLCollaboratorCursorOverlay[], zoom: number): void;
    private _truncateText;
    private _setTruncatedTextCache;
}
//# sourceMappingURL=CollaboratorCursorOverlayUtil.d.ts.map