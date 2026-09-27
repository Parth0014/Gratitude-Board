import { VecModel } from '@tldraw/editor';
import { StrokeOptions } from '../../../lib/shapes/shared/freehand/types';
/** A single comparison case: recorded input points plus the options tldraw would use. */
export interface CorpusCase {
    id: string;
    /** What kind of tldraw stroke this represents. */
    kind: 'draw' | 'pen' | 'solid' | 'highlight';
    points: VecModel[];
    options: StrokeOptions;
}
/** The full corpus of comparison cases: real hand-drawn strokes recorded in tldraw. */
export declare const CORPUS: CorpusCase[];
//# sourceMappingURL=strokes.d.ts.map