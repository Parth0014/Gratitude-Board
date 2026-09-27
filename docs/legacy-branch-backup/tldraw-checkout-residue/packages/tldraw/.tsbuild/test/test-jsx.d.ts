import { TLAsset, TLAssetId, TLBinding, TLBindingCreate, TLBindingId, TLShape, TLShapeId, TLShapePartial } from '@tldraw/editor';
import React from 'react';
export { base64ToPoints, createDrawSegments, pointsToBase64 } from '../lib/utils/test-helpers';
interface CommonShapeProps {
    x?: number;
    y?: number;
    id?: TLShapeId;
    rotation?: number;
    isLocked?: number;
    ref?: string;
    children?: React.JSX.Element | React.JSX.Element[];
    opacity?: number;
}
type FormatShapeProps<Props extends object> = {
    [K in keyof Props]?: Props[K] extends TLAssetId ? TLAssetId | React.JSX.Element : Props[K] extends TLAssetId | null ? TLAssetId | React.JSX.Element | null : Props[K];
};
type PropsForShape<Type extends TLShape['type']> = CommonShapeProps & FormatShapeProps<TLShape<Type>['props']>;
type AssetByType<Type extends TLAsset['type']> = Extract<TLAsset, {
    type: Type;
}>;
type PropsForAsset<Type extends string> = Type extends TLAsset['type'] ? Partial<AssetByType<Type>['props']> : Record<string, unknown>;
interface BindingReactConnections {
    from?: string | TLShapeId;
    to: string | TLShapeId;
}
interface CommonBindingReactProps extends BindingReactConnections {
    ref?: string;
    id?: TLBindingId;
}
type ReactPropsForBinding<Type extends TLBinding['type']> = CommonBindingReactProps & Partial<TLBinding<Type>['props']>;
declare const tlAsset: { [K in TLAsset['type']]: (props: PropsForAsset<K>) => null; } & Record<string, (props: PropsForAsset<string>) => null>;
declare const tlBinding: { [K in TLBinding['type']]: (props: ReactPropsForBinding<K>) => null; };
/**
 * TL - jsx helpers for creating tldraw shapes in test cases
 */
export declare const TL: {
    asset: typeof tlAsset;
    binding: typeof tlBinding;
} & { [K in TLShape['type']]: (props: PropsForShape<K>) => null; } & Record<string, (props: CommonShapeProps & Record<string, unknown>) => null>;
export declare function shapesFromJsx(shapes: React.JSX.Element | Array<React.JSX.Element>, idPrefix?: string): {
    ids: Record<string, TLShapeId> & {
        bindings: Record<string, TLBindingId>;
    };
    shapes: TLShapePartial[];
    assets: TLAsset[];
    bindings: TLBindingCreate[];
};
//# sourceMappingURL=test-jsx.d.ts.map