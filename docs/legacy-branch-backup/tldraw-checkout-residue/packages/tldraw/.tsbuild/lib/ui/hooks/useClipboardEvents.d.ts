import { Editor, TLClipboardWriteInfo, VecLike } from '@tldraw/editor';
import { TLUiEventSource } from '../context/events';
/**
 * Resolves paste modifier keys into plain-text and position behavior.
 * Alt/Option inverts the paste-at-cursor user preference.
 *
 * @param isShift - Whether the Shift key is pressed (indicates plain text paste)
 * @param isAlt - Whether the Alt/Option key is pressed (inverts paste position preference)
 * @param pasteAtCursorPref - The user's preference for pasting at the cursor (true) or center (false)
 *
 * @internal
 */
export declare function resolvePasteModifiers(isShift: boolean, isAlt: boolean, pasteAtCursorPref: boolean): {
    isPlainText: boolean;
    pasteAtCursor: boolean;
};
/**
 * Extract iframe src and dimensions from an HTML string containing an iframe element.
 * Tries width/height HTML attributes first, then falls back to pixel values in the
 * style attribute, then to sensible defaults.
 * Returns null if no valid iframe is found.
 * @internal
 */
export declare function extractIframeFromHtml(html: string): {
    src: string;
    width: number;
    height: number;
} | null;
/** @public */
export declare function isValidHttpURL(url: string): boolean;
export { putPastedExternalContent } from './clipboard/putPastedContent';
/**
 * Handle a paste using event clipboard data. This is the "original"
 * paste method that uses the clipboard data from the paste event.
 * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardEvent/clipboardData
 *
 * @param editor - The editor
 * @param clipboardData - The clipboard data
 * @param point - The point to paste at
 * @internal
 */
export declare function handlePasteFromEventClipboardData(editor: Editor, clipboardData: DataTransfer, point?: VecLike): Promise<void>;
/**
 * Handle a paste using items retrieved from the Clipboard API.
 * https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem
 *
 * @param editor - The editor
 * @param clipboardItems - The clipboard items to handle
 * @param point - The point to paste at
 * @internal
 */
export declare function handlePasteFromClipboardApi({ editor, clipboardItems, point, fallbackFiles, clipboardPasteSource, }: {
    editor: Editor;
    clipboardItems: ClipboardItem[];
    point?: VecLike;
    fallbackFiles?: File[];
    clipboardPasteSource: 'native-event' | 'clipboard-read';
}): Promise<void>;
/**
 * When the user copies or cuts, write the contents to the clipboard.
 *
 * @public
 */
export declare function handleNativeOrMenuCopy(editor: Editor, context?: TLClipboardWriteInfo): Promise<boolean>;
/** @public */
export declare function useMenuClipboardEvents(): {
    copy: (source: TLUiEventSource) => Promise<void>;
    cut: (source: TLUiEventSource) => Promise<void>;
    paste: (data: DataTransfer | ClipboardItem[], source: TLUiEventSource, point?: VecLike) => Promise<void>;
};
/** @public */
export declare function useNativeClipboardEvents(): void;
//# sourceMappingURL=useClipboardEvents.d.ts.map