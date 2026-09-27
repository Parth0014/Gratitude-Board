import { Editor, TLImageShape, TLShape, TLVideoShape, Vec } from '@tldraw/editor';
import * as React from 'react';
import { TLUiOverrideHelpers } from '../overrides';
import { TLUiEventSource } from './events';
/** @public */
export interface TLUiActionItem<TransationKey extends string = string, IconType extends string = string> {
    icon?: IconType | React.ReactElement;
    id: string;
    kbd?: string;
    label?: TransationKey | {
        [key: string]: TransationKey;
    };
    readonlyOk?: boolean;
    checkbox?: boolean;
    isRequiredA11yAction?: boolean;
    onSelect(source: TLUiEventSource): Promise<void> | void;
}
/** @public */
export type TLUiActionsContextType = Record<string, TLUiActionItem>;
/** @internal */
export declare const ActionsContext: React.Context<TLUiActionsContextType | null>;
/**
 * The page point the context menu opened at, or null while it is closed. The context menu
 * writes it; actions that place content (paste) read it, since the pointer keeps moving
 * over the menu after it opens (#10423).
 *
 * @internal
 */
export declare const ContextMenuPagePointContext: React.Context<{
    current: Vec | null;
} | null>;
/** @public */
export interface ActionsProviderProps {
    overrides?(editor: Editor, actions: TLUiActionsContextType, helpers: TLUiOverrideHelpers): TLUiActionsContextType;
    children: React.ReactNode;
}
/** @public */
export declare function supportsDownloadingOriginal(shape: TLShape, editor: Editor): shape is TLImageShape | TLVideoShape;
/** @internal */
export declare function ActionsProvider({ overrides, children }: ActionsProviderProps): import("react/jsx-runtime").JSX.Element;
/** @public */
export declare function useActions(): TLUiActionsContextType;
/** @public */
export declare function unwrapLabel(label?: TLUiActionItem['label'], menuType?: string): string | undefined;
//# sourceMappingURL=actions.d.ts.map