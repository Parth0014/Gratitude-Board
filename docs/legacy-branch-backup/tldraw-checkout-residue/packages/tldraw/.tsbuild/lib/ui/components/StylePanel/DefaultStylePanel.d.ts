import { ReadonlySharedStyleMap } from '@tldraw/editor';
import { ReactNode } from 'react';
/** @public */
export interface TLUiStylePanelProps {
    isMobile?: boolean;
    styles?: ReadonlySharedStyleMap | null;
    children?: ReactNode;
}
/** @public @react */
export declare const DefaultStylePanel: import("react").MemoExoticComponent<({ isMobile, styles, children, }: TLUiStylePanelProps) => import("react/jsx-runtime").JSX.Element | null>;
//# sourceMappingURL=DefaultStylePanel.d.ts.map