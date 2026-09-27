import { BaseBoxShapeUtil, TLEmbedShape, TLEmbedShapeProps, TLResizeInfo } from '@tldraw/editor';
import { DefaultEmbedConfig, TLEmbedDefinition } from '../../defaultEmbedDefinitions';
import { TLEmbedResult } from '../../utils/embeds/embeds';
import { ShapeOptionsWithDisplayValues } from '../shared/getDisplayValues';
/** @public */
export interface EmbedShapeUtilDisplayValues {
    showShadow: boolean;
}
/** @public */
export interface EmbedShapeOptions extends ShapeOptionsWithDisplayValues<TLEmbedShape, EmbedShapeUtilDisplayValues> {
    /** The embed definitions to use for this shape util. */
    readonly embedDefinitions: readonly TLEmbedDefinition[];
    /**
     * Per-embed configuration, keyed by embed type. Passed to each definition's `toEmbedUrl` when
     * building its embed URL — for example, an API key for the default Google Maps embed:
     *
     * ```ts
     * EmbedShapeUtil.configure({ embedConfig: { google_maps: { apiKey: '...' } } })
     * ```
     */
    readonly embedConfig?: DefaultEmbedConfig & Record<string, unknown>;
}
/** @public */
export declare class EmbedShapeUtil extends BaseBoxShapeUtil<TLEmbedShape> {
    static type: 'embed';
    static props: import("@tldraw/tlschema").RecordProps<TLEmbedShape>;
    static migrations: import("@tldraw/tlschema").TLPropsMigrations;
    options: EmbedShapeOptions;
    canEditWhileLocked(shape: TLEmbedShape): boolean;
    private static legacyEmbedDefinitions;
    /** @deprecated - Use `EmbedShapeUtil.configure({ embedDefinitions: [...] })` instead. */
    static setEmbedDefinitions(embedDefinitions: readonly TLEmbedDefinition[]): void;
    private getEmbedDefs;
    getEmbedDefinitions(): readonly TLEmbedDefinition[];
    getEmbedDefinition(url: string): TLEmbedResult;
    /**
     * Resolve the embed's true aspect ratio (for definitions with `sizeToContentAspectRatio`) and
     * correct the shape's size to match. The dimensions come from the URL's OpenGraph metadata via
     * the editor's url asset handler (the same "unfurl" path bookmarks use). The correction is
     * applied without adding to the undo history.
     */
    resolveAspectRatio(shape: TLEmbedShape): Promise<void>;
    /**
     * Resolve the content's aspect ratio from the URL's OpenGraph metadata, fetched through the
     * editor's url asset handler (the "unfurl" service). Returns `undefined` if no usable dimensions
     * are available (e.g. no unfurl service is configured, or the page reports no image size).
     */
    private getContentAspectRatio;
    getText(shape: TLEmbedShape): string;
    getAriaDescriptor(shape: TLEmbedShape): string | undefined;
    hideSelectionBoundsFg(shape: TLEmbedShape): boolean;
    canEdit(shape: TLEmbedShape): boolean;
    canResize(shape: TLEmbedShape): boolean;
    canEditInReadonly(shape: TLEmbedShape): boolean;
    getDefaultProps(): TLEmbedShape['props'];
    getGeometry(shape: TLEmbedShape): import("@tldraw/editor").Geometry2d;
    isAspectRatioLocked(shape: TLEmbedShape): boolean;
    /**
     * The minimum width/height a resize of `shape` is allowed to reach. When the embed's aspect ratio
     * is locked, the longer axis's minimum is inflated by the current aspect ratio so that shrinking
     * to the floor keeps the shorter axis at or above the base minimum.
     */
    private getResizeMinBounds;
    onResize(shape: TLEmbedShape, info: TLResizeInfo<TLEmbedShape>): TLEmbedShape;
    component(shape: TLEmbedShape): import("react/jsx-runtime").JSX.Element | null;
    getIndicatorPath(shape: TLEmbedShape): Path2D;
    getInterpolatedProps(startShape: TLEmbedShape, endShape: TLEmbedShape, t: number): TLEmbedShapeProps;
}
//# sourceMappingURL=EmbedShapeUtil.d.ts.map