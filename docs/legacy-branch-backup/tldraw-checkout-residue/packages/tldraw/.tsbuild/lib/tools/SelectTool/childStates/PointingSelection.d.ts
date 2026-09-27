import { StateNode, TLClickEventInfo, TLPointerEventInfo } from '@tldraw/editor';
export declare class PointingSelection extends StateNode {
    static id: string;
    info: TLPointerEventInfo & {
        target: 'selection';
    };
    onEnter(info: TLPointerEventInfo & {
        target: 'selection';
    }): void;
    onPointerUp(info: TLPointerEventInfo): void;
    onPointerMove(info: TLPointerEventInfo): void;
    onLongPress(info: TLPointerEventInfo): void;
    private startTranslating;
    onDoubleClick(info: TLClickEventInfo): void;
    onCancel(): void;
    onComplete(): void;
    onInterrupt(): void;
    private cancel;
}
//# sourceMappingURL=PointingSelection.d.ts.map