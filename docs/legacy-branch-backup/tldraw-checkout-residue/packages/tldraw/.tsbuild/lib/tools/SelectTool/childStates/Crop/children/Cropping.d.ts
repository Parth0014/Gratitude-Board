import { SelectionHandle, StateNode, TLPointerEventInfo } from '@tldraw/editor';
export declare class Cropping extends StateNode {
    static id: string;
    static trackPerformance: boolean;
    info: TLPointerEventInfo & {
        target: 'selection';
        handle: SelectionHandle;
        onInteractionEnd?: string | (() => void);
    };
    markId: string;
    private snapshot;
    onEnter(info: TLPointerEventInfo & {
        target: 'selection';
        handle: SelectionHandle;
        onInteractionEnd?: string | (() => void);
    }): void;
    onPointerMove(): void;
    onKeyDown(): void;
    onKeyUp(): void;
    onPointerUp(): void;
    onComplete(): void;
    onCancel(): void;
    onExit(): void;
    private updateCursor;
    private updateShapes;
    private reconcileSnapIndicators;
    private complete;
    private cancel;
    private createSnapshot;
}
//# sourceMappingURL=Cropping.d.ts.map