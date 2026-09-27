import { TLAnyBindingUtilConstructor, TLAnyShapeUtilConstructor, TLAssetStore, TLEditorSnapshot, TLImageExportOptions, TLPageId, TLStoreSnapshot, TLTextOptions, TldrawOptions } from '@tldraw/editor';
import { TLUiAssetUrlOverrides } from './ui/assetUrls';
/** @public */
export interface TldrawImageProps extends TLImageExportOptions {
    /**
     * The snapshot to display.
     */
    snapshot: Partial<TLEditorSnapshot> | TLStoreSnapshot;
    /**
     * The image format to use. Defaults to 'svg'.
     */
    format?: 'svg' | 'png';
    /**
     * The page to display. Defaults to the first page.
     */
    pageId?: TLPageId;
    /**
     * Additional shape utils to use.
     */
    shapeUtils?: readonly TLAnyShapeUtilConstructor[];
    /**
     * Additional binding utils to use.
     */
    bindingUtils?: readonly TLAnyBindingUtilConstructor[];
    /**
     * The license key.
     */
    licenseKey?: string;
    /**
     * Asset URL overrides.
     */
    assetUrls?: TLUiAssetUrlOverrides;
    /**
     * The asset store to use for resolving the snapshot's assets, matching the `assets` prop on
     * {@link Tldraw}. Without one, assets that aren't stored inline (as data URLs) can't be
     * resolved and won't appear in the image.
     */
    assets?: TLAssetStore;
    /**
     * Options for the editor.
     */
    options?: Partial<TldrawOptions>;
    /**
     * Text options for the editor.
     *
     * @deprecated Use `options.text` instead. This prop will be removed in a future release.
     */
    textOptions?: TLTextOptions;
}
/**
 * A rendered SVG image of a Tldraw snapshot.
 *
 * @example
 * ```tsx
 * <TldrawImage
 * 	snapshot={snapshot}
 * 	pageId={pageId}
 * 	background={false}
 *  darkMode={true}
 *  bounds={new Box(0,0,600,400)}
 *  scale={1}
 * />
 * ```
 *
 * @public
 * @react
 */
export declare const TldrawImage: import("react").MemoExoticComponent<(props: TldrawImageProps) => import("react/jsx-runtime").JSX.Element>;
//# sourceMappingURL=TldrawImage.d.ts.map