import { Vec, VecLike } from '@tldraw/editor';
import type { StrokeOptions, StrokePoint } from './types';
export declare let trackLeftX: Float64Array<ArrayBuffer>;
export declare let trackLeftY: Float64Array<ArrayBuffer>;
export declare let trackRightX: Float64Array<ArrayBuffer>;
export declare let trackRightY: Float64Array<ArrayBuffer>;
export declare let trackLeftCount: number;
export declare let trackRightCount: number;
/**
 * Build the left and right outline tracks for the stroke points currently loaded in the
 * track-source buffers, into the track buffers. This is the array core of
 * `getStrokeOutlineTracks`.
 *
 * `hasAnchor`/`anchorX`/`anchorY` carry the original predecessor of point 1 when the
 * caller has cut or altered the sequence in front of it (svgInk's elbow partitions): the
 * second point's vector is derived from the anchor rather than from point 0, preserving
 * the direction it had in the uncut stroke. It only applies when there are more than two
 * points; two-point sequences derive both vectors from each other.
 *
 * @internal
 */
export declare function buildTracks(options: StrokeOptions, hasAnchor: boolean, anchorX: number, anchorY: number): void;
/**
 * @internal
 *
 * `vectorAnchor` is the original predecessor of `strokePoints[1]` when the caller has cut or
 * altered the sequence in front of it (svgInk's elbow partitions): the second point's vector is
 * derived from the anchor rather than from `strokePoints[0]`, preserving the direction it had in
 * the uncut stroke. It only applies when there are more than two points; two-point sequences
 * derive both vectors from each other.
 */
export declare function getStrokeOutlineTracks(strokePoints: StrokePoint[], options?: StrokeOptions, vectorAnchor?: VecLike): {
    left: Vec[];
    right: Vec[];
};
/**
 * Build the full outline (tracks plus caps) for the stroke points currently loaded in the
 * track-source buffers. This is the shared core of `getStrokeOutlinePoints` and
 * `getStroke`.
 *
 * @internal
 */
export declare function outlineFromSrc(options?: StrokeOptions): Vec[];
/**
 * ## getStrokeOutlinePoints
 *
 * Get an array of points (as `[x, y]`) representing the outline of a stroke.
 *
 * @param points - An array of StrokePoints as returned from `getStrokePoints`.
 * @param options - An object with options.
 * @public
 */
export declare function getStrokeOutlinePoints(strokePoints: StrokePoint[], options?: StrokeOptions): Vec[];
//# sourceMappingURL=getStrokeOutlinePoints.d.ts.map