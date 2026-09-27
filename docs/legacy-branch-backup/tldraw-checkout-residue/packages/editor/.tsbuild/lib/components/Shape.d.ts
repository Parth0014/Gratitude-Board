import { TLShape, TLShapeId } from '@tldraw/tlschema';
import { ShapeUtil } from '../editor/shapes/ShapeUtil';
export declare const Shape: import("react").MemoExoticComponent<({ id, shape, util, index, backgroundIndex, opacity, }: {
    id: TLShapeId;
    shape: TLShape;
    util: ShapeUtil;
    index: number;
    backgroundIndex: number;
    opacity: number;
}) => import("react/jsx-runtime").JSX.Element | null>;
export declare const InnerShape: import("react").MemoExoticComponent<<T extends TLShape>({ shape, util }: {
    shape: T;
    util: ShapeUtil<T>;
}) => any>;
export declare const InnerShapeBackground: import("react").MemoExoticComponent<<T extends TLShape>({ shape, util, }: {
    shape: T;
    util: ShapeUtil<T>;
}) => any>;
//# sourceMappingURL=Shape.d.ts.map