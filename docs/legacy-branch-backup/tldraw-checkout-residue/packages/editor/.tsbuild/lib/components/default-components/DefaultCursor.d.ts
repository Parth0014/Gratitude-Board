import { VecModel } from '@tldraw/tlschema';
/** @public */
export interface TLCursorProps {
    userId: string;
    className?: string;
    point: VecModel | null;
    zoom: number;
    color?: string;
    name: string | null;
    chatMessage: string;
}
/**
 * The default collaborator cursor: the arrow glyph plus a name tag or chat bubble. The arrow is a
 * `<use>` of a shared `<defs>` symbol that `LiveCollaborators` renders, so a `DefaultCursor`
 * used outside that layer draws no arrow.
 *
 * @public @react
 */
export declare const DefaultCursor: import("react").MemoExoticComponent<({ className, zoom, point, color, name, chatMessage, }: TLCursorProps) => import("react/jsx-runtime").JSX.Element | null>;
//# sourceMappingURL=DefaultCursor.d.ts.map