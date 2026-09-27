import { StateNode, TLPointerEventInfo, TLRotationSnapshot } from '@tldraw/editor';
export declare class Rotating extends StateNode {
    static id: string;
    static trackPerformance: boolean;
    snapshot: TLRotationSnapshot;
    info: Extract<TLPointerEventInfo, {
        target: 'selection';
    }> & {
        onInteractionEnd?: string | (() => void);
    };
    markId: string;
    onEnter(info: TLPointerEventInfo & {
        target: 'selection';
        onInteractionEnd?: string | (() => void);
    }): void;
    onExit(): void;
    onPointerMove(): void;
    onKeyDown(): void;
    onKeyUp(): void;
    onPointerUp(): void;
    onComplete(): void;
    onCancel(): void;
    private update;
    private cancel;
    private complete;
    _getRotationFromPointerPosition({ snapToNearestDegree }: {
        snapToNearestDegree: boolean;
    }): number;
}
//# sourceMappingURL=Rotating.d.ts.map