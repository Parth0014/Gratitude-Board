import { SharedStyle, StyleProp } from '@tldraw/editor';
import { StyleValuesForUi } from '../../../styles';
/** @public */
export interface StylePanelButtonPickerProps<T extends string> {
    title: string;
    uiType: string;
    style: StyleProp<T>;
    value: SharedStyle<T>;
    items: StyleValuesForUi<T>;
    onValueChange?(style: StyleProp<T>, value: T): void;
    onHistoryMark?(id: string): void;
}
/** @public @react */
export declare const StylePanelButtonPicker: <T extends string>(props: StylePanelButtonPickerProps<T>) => React.JSX.Element;
/** @public @react*/
export declare const StylePanelButtonPickerInline: <T extends string>(props: StylePanelButtonPickerProps<T>) => React.JSX.Element;
//# sourceMappingURL=StylePanelButtonPicker.d.ts.map