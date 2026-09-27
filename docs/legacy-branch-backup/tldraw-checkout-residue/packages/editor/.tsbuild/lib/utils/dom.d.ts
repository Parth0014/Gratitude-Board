/** @public */
export declare function loopToHtmlElement(elm: Element): HTMLElement;
/**
 * This function calls `event.preventDefault()` for you. Why is that useful?
 *
 * Because if you enable `window.preventDefaultLogging = true` it'll log out a message when it
 * happens. Because we use console.warn rather than (log) you'll get a stack trace in the inspector
 * telling you exactly where it happened. This is important because `e.preventDefault()` is the
 * source of many bugs, but unfortunately it can't be avoided because it also stops a lot of default
 * behaviour which doesn't make sense in our UI
 *
 * @param event - To prevent default on
 * @public
 */
export declare function preventDefault(event: React.BaseSyntheticEvent | Event): void;
/** @public */
export declare function setPointerCapture(element: Element, event: React.PointerEvent<Element> | PointerEvent): void;
/** @public */
export declare function releasePointerCapture(element: Element, event: React.PointerEvent<Element> | PointerEvent): void;
/**
 * Calls `event.stopPropagation()`.
 *
 * @deprecated Use {@link Editor.markEventAsHandled} instead, or manually call `event.stopPropagation()` if
 * that's what you really want.
 *
 * @public
 */
export declare function stopEventPropagation(e: any): any;
/** @internal */
export declare function setStyleProperty(elm: HTMLElement | null, property: string, value: string | number): void;
/**
 * Move an element into a new parent, preserving its state where the platform allows it.
 *
 * Uses `Node.moveBefore` (Chromium 133+, Firefox 144+) when both the element and parent are
 * connected to the same document — this moves the element without resetting its state, so
 * iframes don't reload and media keeps playing. Otherwise (older browsers, disconnected nodes,
 * or a cross-document move) it falls back to `appendChild`, which moves the element but resets
 * its state like an iframe reload.
 *
 * This is the primitive tldraw uses to adopt `ShapeUtil.getAppOwnedElement` elements, exposed so
 * apps can perform symmetric state-preserving moves from `ShapeUtil.onReleaseAppOwnedElement` —
 * for example moving an element to an off-canvas parking lot between editor sessions.
 *
 * @param parent - The element to move `element` into, as its last child.
 * @param element - The element to move.
 * @public
 */
export declare function moveElementInto(parent: HTMLElement, element: HTMLElement): void;
/** @internal */
export declare function elementShouldCaptureKeys(el: Element | null, includeButtonsAndMenus?: boolean): boolean;
/**
 * Returns the global `document`. Use this instead of bare `document` to satisfy lint rules.
 *
 * When you have a DOM node or editor instance, prefer the scoped versions instead:
 * - `getOwnerDocument(node)` – the document that owns a specific DOM node
 * - `editor.getContainerDocument()` – the document where the editor is mounted
 *
 * @internal
 */
export declare function getGlobalDocument(): Document;
/**
 * Returns the global `window`. Use this instead of bare `window` to satisfy lint rules.
 *
 * When you have a DOM node or editor instance, prefer the scoped versions instead:
 * - `getOwnerWindow(node)` – the window that owns a specific DOM node
 * - `editor.getContainerWindow()` – the window where the editor is mounted
 *
 * @internal
 */
export declare function getGlobalWindow(): Window & typeof globalThis;
/** @internal */
export declare function activeElementShouldCaptureKeys(includeButtonsAndMenus?: boolean, doc?: Document): boolean;
//# sourceMappingURL=dom.d.ts.map