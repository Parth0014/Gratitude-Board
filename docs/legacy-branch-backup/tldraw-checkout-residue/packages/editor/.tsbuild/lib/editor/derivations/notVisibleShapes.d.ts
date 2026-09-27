import { TLShapeId } from '@tldraw/tlschema';
import type { Editor } from '../Editor';
/**
 * Non visible shapes are shapes outside of the viewport page bounds.
 *
 * @param editor - Instance of the tldraw Editor.
 * @returns Incremental derivation of non visible shapes.
 */
export declare function notVisibleShapes(editor: Editor): import("@tldraw/state").Computed<Set<TLShapeId>, unknown>;
//# sourceMappingURL=notVisibleShapes.d.ts.map