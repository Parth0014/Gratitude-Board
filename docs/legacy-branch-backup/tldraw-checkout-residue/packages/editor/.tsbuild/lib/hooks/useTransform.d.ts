import { VecLike } from '../primitives/Vec';
/**
 * Position an element by writing its `transform` directly, outside React's render output — the
 * cheap path for elements that move at pointer/presence frequency.
 * @public
 */
export declare function useTransform(ref: React.RefObject<HTMLElement | SVGElement | null>, x?: number, y?: number, scale?: number, rotate?: number, additionalOffset?: VecLike): void;
//# sourceMappingURL=useTransform.d.ts.map