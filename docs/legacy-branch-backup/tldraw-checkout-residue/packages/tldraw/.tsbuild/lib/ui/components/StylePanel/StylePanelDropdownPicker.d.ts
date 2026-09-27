import { SharedStyle, StyleProp } from '@tldraw/editor';
import * as React from 'react';
import { StyleValuesForUi } from '../../../styles';
import { TLUiTranslationKey } from '../../hooks/useTranslation/TLUiTranslationKey';
/** @public */
export interface StylePanelDropdownPickerProps<T extends string> {
    id: string;
    label?: TLUiTranslationKey | Exclude<string, TLUiTranslationKey>;
    uiType: string;
    stylePanelType: string;
    style: StyleProp<T>;
    value: SharedStyle<T>;
    items: StyleValuesForUi<T>;
    type: 'icon' | 'tool' | 'menu';
    onValueChange?(style: StyleProp<T>, value: T): void;
    /** Override the test ID prefix. Defaults to uiType. */
    testIdType?: string;
    /**
     * Distance to push the popover left of the trigger so it lands flush with the style panel.
     * Defaults to the standard popover gap so standalone dropdowns don't sit flush against the panel.
     */
    sideOffset?: number;
    /** Is the dropdown an overflow of a different radio group? If so, show active when the group's active item is inside of the dropdown.*/
    isOverflow?: boolean;
}
/** @public @react */
export declare const StylePanelDropdownPicker: <T extends string>(props: StylePanelDropdownPickerProps<T>) => React.JSX.Element;
/** @public @react */
export declare const StylePanelDropdownPickerInline: <T extends string>(props: StylePanelDropdownPickerProps<T>) => React.JSX.Element;
//# sourceMappingURL=StylePanelDropdownPicker.d.ts.map