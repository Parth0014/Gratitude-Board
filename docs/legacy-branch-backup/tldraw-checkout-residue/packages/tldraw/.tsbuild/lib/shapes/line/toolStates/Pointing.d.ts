import { StateNode, TLLineShape, TLShapeId } from '@tldraw/editor';
export declare class Pointing extends StateNode {
    static id: string;
    shape: TLLineShape;
    markId: string | undefined;
    onEnter(info: {
        shapeId?: TLShapeId;
    }): void;
    onPointerMove(): void;
    onPointerUp(): void;
    onLongPress(): void;
    onCancel(): void;
    onComplete(): void;
    onInterrupt(): void;
    complete(): void;
    cancel(): void;
}
//# sourceMappingURL=Pointing.d.ts.map