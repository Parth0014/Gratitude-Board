import { StateNode, TLPointerEventInfo, TLTextShape } from '@tldraw/editor';
export declare class Pointing extends StateNode {
    static id: string;
    shape?: TLTextShape;
    markId: string;
    enterTime: number;
    onEnter(): void;
    onExit(): void;
    onPointerMove(info: TLPointerEventInfo): void;
    onPointerUp(): void;
    onLongPress(): void;
    onComplete(): void;
    onCancel(): void;
    onInterrupt(): void;
    private complete;
    private cancel;
    private createTextShape;
}
//# sourceMappingURL=Pointing.d.ts.map