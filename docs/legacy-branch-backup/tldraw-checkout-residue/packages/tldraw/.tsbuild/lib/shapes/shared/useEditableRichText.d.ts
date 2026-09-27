import { ExtractShapeByProps, TLRichText, TLShapeId } from '@tldraw/editor';
/** @public */
export declare function useEditableRichText(shapeId: TLShapeId, type: ExtractShapeByProps<{
    richText: TLRichText;
}>['type'], richText?: TLRichText): {
    handleFocus: () => void;
    handleBlur: () => void;
    handleInputPointerDown: (e: React.PointerEvent) => void;
    handleDoubleClick: (e: Event | {
        nativeEvent: Event;
    }) => void;
    handlePaste: (e: ClipboardEvent | React.ClipboardEvent<HTMLTextAreaElement>) => void;
    isEditing: boolean;
    isReadyForEditing: boolean;
    rInput: import("react").RefObject<HTMLDivElement | null>;
    handleKeyDown: (e: KeyboardEvent) => void;
    handleChange: ({ richText }: {
        richText: TLRichText;
    }) => void;
    isEmpty: boolean | undefined;
};
//# sourceMappingURL=useEditableRichText.d.ts.map