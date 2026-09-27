import { StrokeOptions } from '../../../lib/shapes/shared/freehand/types';
/** The 'draw' dash style with a mouse or finger (pressure is simulated). */
export declare function simulatePressureSettings(strokeWidth: number): StrokeOptions;
/** The 'draw' dash style with a stylus (real pressure). */
export declare function realPressureSettings(strokeWidth: number): StrokeOptions;
/** The solid / dashed / dotted dash styles (constant width). */
export declare function solidSettings(strokeWidth: number): StrokeOptions;
/** The highlighter shape. */
export declare function highlightSettings(strokeWidth: number): StrokeOptions;
//# sourceMappingURL=presets.d.ts.map