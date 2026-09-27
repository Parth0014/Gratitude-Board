import type { Editor } from '../editor/Editor';
/**
 * The CSS `transform` that puts a 1px-sized html layer into page space under the current camera.
 * Shared by every camera-tracked DOM layer (the canvas's shape layer, the collaborator cursor
 * layer) so they line up exactly and can't drift apart.
 *
 * The offset compensates for the layer's 1px width/height when zoomed, so it registers precisely
 * with the other layers.
 *
 * @internal
 */
export declare function getHtmlLayerTransform(editor: Editor): string;
//# sourceMappingURL=getHtmlLayerTransform.d.ts.map