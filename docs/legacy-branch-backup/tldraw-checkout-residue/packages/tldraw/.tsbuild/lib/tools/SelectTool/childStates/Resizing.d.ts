import { SelectionCorner, SelectionEdge, StateNode, TLPointerEventInfo, TLShape, TLTickEventInfo, VecLike } from '@tldraw/editor';
export type ResizingInfo = TLPointerEventInfo & {
    target: 'selection';
    handle: SelectionEdge | SelectionCorner;
    isCreating?: boolean;
    creatingMarkId?: string;
    onCreate?(shape: TLShape | null): void;
    creationCursorOffset?: VecLike;
    onInteractionEnd?: string | (() => void);
};
export declare class Resizing extends StateNode {
    static id: string;
    static trackPerformance: boolean;
    info: ResizingInfo;
    markId: string;
    private didHoldCommand;
    private didFinish;
    creationCursorOffset: VecLike;
    private snapshot;
    onEnter(info: ResizingInfo): void;
    onTick({ elapsed }: TLTickEventInfo): void;
    onPointerMove(): void;
    onKeyDown(): void;
    onKeyUp(): void;
    onPointerUp(): void;
    onComplete(): void;
    onCancel(): void;
    private cancel;
    private complete;
    private handleResizeStart;
    private handleResizeEnd;
    private updateShapes;
    private updateEnclosureHints;
    private updateCursor;
    onExit(): void;
    private _createSnapshot;
}
//# sourceMappingURL=Resizing.d.ts.map