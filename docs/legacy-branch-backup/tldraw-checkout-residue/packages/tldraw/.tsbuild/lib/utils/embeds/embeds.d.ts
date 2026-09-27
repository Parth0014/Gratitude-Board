import { TLEmbedDefinition } from '../../defaultEmbedDefinitions';
/** @public */
export declare function matchEmbedUrl(definitions: readonly TLEmbedDefinition[], url: string): {
    definition: TLEmbedDefinition;
    url: string;
    embedUrl: string;
} | undefined;
/** @public */
export declare function matchUrl(definitions: readonly TLEmbedDefinition[], url: string, embedConfig?: Record<string, unknown>): {
    definition: TLEmbedDefinition;
    embedUrl: string;
    url: string;
} | undefined;
/** @public */
export type TLEmbedResult = {
    definition: TLEmbedDefinition;
    url: string;
    embedUrl: string;
} | undefined;
/**
 * Tests whether an URL supports embedding and returns the result. If we encounter an error, we
 * return undefined.
 *
 * @param inputUrl - The URL to match
 * @param embedConfig - Optional per-embed config, keyed by embed type, passed to `toEmbedUrl`
 * @public
 */
export declare function getEmbedInfo(definitions: readonly TLEmbedDefinition[], inputUrl: string, embedConfig?: Record<string, unknown>): TLEmbedResult;
/**
 * Given an embed shape's current size and a newly-resolved aspect ratio, return the size it should
 * be corrected to, or `null` when no change is needed — either because there's no resolved ratio or
 * the shape is already at it. The correction preserves the box's area, so a portrait video takes the
 * same visual footprint as a landscape one instead of ballooning the shape's height.
 *
 * @param opts - The current `w`/`h` and the `resolvedRatio` (`width / height`) discovered at runtime.
 * @internal
 */
export declare function getCorrectedEmbedSize({ w, h, resolvedRatio, }: {
    w: number;
    h: number;
    resolvedRatio: number | undefined;
}): {
    w: number;
    h: number;
} | null;
//# sourceMappingURL=embeds.d.ts.map