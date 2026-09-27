import { VecLike } from '@tldraw/editor';
import type { StrokeOptions, StrokePoint } from './types';
/** Streamlined (smoothed) point coordinates. */
export declare let pointX: Float64Array<ArrayBuffer>;
export declare let pointY: Float64Array<ArrayBuffer>;
/** The original input coordinates (used for elbows and sharp corners). */
export declare let inputX: Float64Array<ArrayBuffer>;
export declare let inputY: Float64Array<ArrayBuffer>;
/** The input z (pressure channel) after clamping; kept for materializing StrokePoints. */
export declare let inputZ: Float64Array<ArrayBuffer>;
export declare let pressures: Float64Array<ArrayBuffer>;
export declare let distances: Float64Array<ArrayBuffer>;
export declare let runningLengths: Float64Array<ArrayBuffer>;
export declare let radii: Float64Array<ArrayBuffer>;
export declare let pointCount: number;
/**
 * Phase 1: ingest and streamline raw input points straight into the pipeline buffers.
 * Mirrors what getStrokePoints used to do with per-point objects, keeping every
 * order-sensitive step: the pressure clamp, near-start/near-end stripping, the two-point
 * simulated-pressure interpolation, the early-noise skip, and the short-stroke pressure
 * fixup.
 *
 * @internal
 */
export declare function ingest(rawInputPoints: VecLike[], options?: StrokeOptions): void;
/**
 * Resolve a taper option to a distance: `true` tapers over the whole stroke, `false` or
 * `undefined` not at all.
 *
 * @internal
 */
export declare function resolveTaper(taper: number | boolean | undefined, size: number, totalLength: number): number;
/**
 * Phase 2: compute each point's radius from its pressure, distance and running length.
 * Same recurrences as the object pipeline, with the taper pass folded into the main
 * radius loop.
 *
 * @internal
 */
export declare function computeRadii(options: StrokeOptions): void;
export declare let srcX: Float64Array<ArrayBuffer>;
export declare let srcY: Float64Array<ArrayBuffer>;
export declare let srcZ: Float64Array<ArrayBuffer>;
export declare let srcInputX: Float64Array<ArrayBuffer>;
export declare let srcInputY: Float64Array<ArrayBuffer>;
export declare let srcRadius: Float64Array<ArrayBuffer>;
export declare let srcRunningLength: Float64Array<ArrayBuffer>;
export declare let srcIsCap: Uint8Array<ArrayBuffer>;
export declare let srcCount: number;
/** Load the track source from materialized StrokePoints. @internal */
export declare function loadSrcFromStrokePoints(strokePoints: StrokePoint[]): void;
/** Load the track source from the whole pipeline. @internal */
export declare function loadSrcFromPipeline(): void;
/**
 * Load one elbow partition from the pipeline as the track source: boundary point `a`,
 * the surviving inner points `innerStart..innerEnd`, and boundary point `b`. Elbow
 * boundaries read the input coordinates instead of the streamlined ones. When a hard
 * elbow's duplicated end point survived cleanup (`dupQuirk`), the inner copy of `b` is
 * also marked as a cap point, matching the object pipeline where both array slots held
 * the same point object.
 *
 * @internal
 */
export declare function loadSrcPartition(a: number, aElbow: boolean, innerStart: number, innerEnd: number, b: number, bElbow: boolean, dupQuirk: boolean): void;
//# sourceMappingURL=core.d.ts.map