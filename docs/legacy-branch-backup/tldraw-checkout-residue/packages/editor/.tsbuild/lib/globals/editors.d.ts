import { Signal } from '@tldraw/state';
import type { Editor } from '../editor/Editor';
/**
 * A global registry of currently mounted editor instances. Use it to discover live editors from
 * outside the React tree, for example from sidebar chrome, keyboard shortcuts, or multi-editor
 * layouts.
 *
 * @example
 * ```ts
 * tleditors.getMounted() // readonly Editor[]
 *
 * const editors = useValue('mounted editors', () => tleditors.getMounted(), [])
 * ```
 *
 * @public
 */
export declare const tleditors: {
    /**
     * A reactive list of currently mounted editor instances.
     *
     * An editor is added when it emits the `mount` event and removed when it emits `unmount`
     * (including when the editor is disposed while still mounted).
     *
     * @public
     */
    mounted: Signal<readonly Editor[]>;
    /**
     * Get the currently mounted editor instances.
     *
     * @public
     */
    getMounted(): readonly Editor[];
};
/** @internal */
export declare function registerMountedEditor(editor: Editor): void;
/** @internal */
export declare function unregisterMountedEditor(editor: Editor): void;
//# sourceMappingURL=editors.d.ts.map