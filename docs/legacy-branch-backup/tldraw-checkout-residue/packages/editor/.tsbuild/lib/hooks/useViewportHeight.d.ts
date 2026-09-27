/*!
 * BSD License: https://github.com/outline/rich-markdown-editor/blob/main/LICENSE
 * Copyright (c) 2020 General Outline, Inc (https://www.getoutline.com/) and individual contributors.
 *
 * Returns the height of the viewport.
 * This is mainly to account for virtual keyboards on mobile devices.
 *
 * N.B. On iOS, you have to take into account the offsetTop as well so that you get an accurate position
 * while using the virtual keyboard.
 */
/**
 * The height of the visible viewport, including the visual viewport's own offset.
 *
 * @deprecated Read `window.visualViewport` directly: this flattens the visible rectangle to a
 * single scalar, and keeping UI clear of the software keyboard usually needs the other edges too.
 * Unused since v3.14; will be removed in a future release.
 *
 * @public
 */
export declare function useViewportHeight(): number;
//# sourceMappingURL=useViewportHeight.d.ts.map