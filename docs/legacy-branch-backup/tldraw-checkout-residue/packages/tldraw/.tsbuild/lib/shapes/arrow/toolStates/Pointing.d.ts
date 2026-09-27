import { StateNode, TLArrowShape } from '@tldraw/editor';
export declare class Pointing extends StateNode {
    static id: string;
    shape?: TLArrowShape;
    isPrecise: boolean;
    isPreciseTimerId: number | null;
    markId: string;
    onEnter(info: {
        isPrecise?: boolean;
    }): void;
    onExit(): void;
    onPointerMove(): void;
    onPointerUp(): void;
    onLongPress(): void;
    onCancel(): void;
    onComplete(): void;
    onInterrupt(): void;
    cancel(): void;
    createArrowShape(): void;
    updateArrowShapeEndHandle(): void;
    private startPreciseTimeout;
    private clearPreciseTimeout;
}
//# sourceMappingURL=Pointing.d.ts.map