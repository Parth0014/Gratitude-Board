import { StateNode, TLKeyboardEventInfo, TLPointerEventInfo } from '@tldraw/editor';
export declare class TranslatingCrop extends StateNode {
    static id: string;
    info: TLPointerEventInfo & {
        target: 'shape';
        isCreating?: boolean;
        onInteractionEnd?: string;
    };
    markId: string;
    private snapshot;
    onEnter(info: TLPointerEventInfo & {
        target: 'shape';
        isCreating?: boolean;
        onInteractionEnd?: string;
    }): void;
    onExit(): void;
    onPointerMove(): void;
    onPointerUp(): void;
    onComplete(): void;
    onCancel(): void;
    onKeyDown(info: TLKeyboardEventInfo): void;
    onKeyUp(info: TLKeyboardEventInfo): void;
    protected complete(): void;
    private cancel;
    private createSnapshot;
    protected updateShapes(): void;
}
//# sourceMappingURL=TranslatingCrop.d.ts.map