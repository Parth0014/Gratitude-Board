import type { Editor } from '../../Editor';
import { EditorManager } from '../EditorManager';
/** @internal */
export declare class TickManager extends EditorManager {
    constructor(editor: Editor);
    cancelRaf?: null | (() => void);
    isPaused: boolean;
    now: number;
    start(): void;
    tick(): void;
    dispose(): void;
}
//# sourceMappingURL=TickManager.d.ts.map