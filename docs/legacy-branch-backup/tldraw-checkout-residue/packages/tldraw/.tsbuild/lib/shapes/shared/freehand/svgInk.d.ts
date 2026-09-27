import { VecLike } from '@tldraw/editor';
import { StrokeOptions } from './types';
/**
 * Render a freehand stroke as svg path data in a single pass, from raw input points to a filled
 * outline with round caps. This is the path used by tldraw's draw shape when drawing with ink.
 *
 * @param rawInputPoints - The raw input points (as `{x, y, z}`, where `z` is pressure).
 * @param options - An object with options.
 * @public
 */
export declare function svgInk(rawInputPoints: VecLike[], options?: StrokeOptions): string;
//# sourceMappingURL=svgInk.d.ts.map