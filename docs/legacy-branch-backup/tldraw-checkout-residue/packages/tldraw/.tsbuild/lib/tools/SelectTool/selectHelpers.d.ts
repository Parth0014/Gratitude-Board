import { Editor, ExtractShapeByProps, TLEventInfo, TLRichText, TLShape, TLShapeId } from '@tldraw/editor';
/** @internal */
export declare function hasRichText(shape: TLShape): shape is ExtractShapeByProps<{
    richText: TLRichText;
}>;
/**
 * Start editing a shape that has rich text, such as text, note, geo, or arrow shapes.
 * This will enter the editing state for the shape and optionally select all the text.
 *
 * @param editor - The editor instance.
 * @param shapeOrId - The shape to start editing. This shape must have a richText property with a TLRichText value.
 * @param options - Options: selectAll or info (TLEventInfo)
 *
 * @public
 */
export declare function startEditingShapeWithRichText(editor: Editor, shapeOrId: TLShape | TLShapeId, options?: {
    selectAll?: boolean;
    info?: TLEventInfo;
}): void;
/**
 * Start editing any editable shape. Shapes with rich text go through
 * `startEditingShapeWithRichText`; editable shapes without it (frame, video, embed) would
 * make that helper throw, so they enter the editing state directly.
 *
 * @internal
 */
export declare function startEditingShape(editor: Editor, shape: TLShape, options?: {
    selectAll?: boolean;
    info?: TLEventInfo;
}): void;
//# sourceMappingURL=selectHelpers.d.ts.map