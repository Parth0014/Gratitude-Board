import { StateNode, TLDefaultSizeStyle, TLDrawShape, TLDrawShapeSegment, TLHighlightShape, TLKeyboardEventInfo, TLPointerEventInfo, Vec } from '@tldraw/editor';
import { HighlightShapeUtil } from '../../highlight/HighlightShapeUtil';
import { DrawShapeUtil } from '../DrawShapeUtil';
type DrawableShape = TLDrawShape | TLHighlightShape;
export declare class Drawing extends StateNode {
    static id: string;
    static trackPerformance: boolean;
    info: TLPointerEventInfo;
    initialShape?: DrawableShape;
    shapeType: "draw" | "highlight";
    util: DrawShapeUtil | HighlightShapeUtil;
    isPen: boolean;
    isPenOrStylus: boolean;
    segmentDim: 2 | undefined;
    segmentMode: 'free' | 'straight' | 'starting_straight' | 'starting_free';
    didJustShiftClickToExtendPreviousShapeLine: boolean;
    pagePointWhereCurrentSegmentChanged: Vec;
    pagePointWhereNextSegmentChanged: Vec | null;
    lastRecordedPoint: Vec;
    mergeNextPoint: boolean;
    currentLineLength: number;
    zoomOnEnter: number;
    currentSegmentPoints: Vec[];
    markId: null | string;
    onEnter(info: TLPointerEventInfo): void;
    onPointerMove(): void;
    onKeyDown(info: TLKeyboardEventInfo): void;
    onKeyUp(info: TLKeyboardEventInfo): void;
    onExit(): void;
    canClose(): boolean;
    getIsClosed(segments: TLDrawShapeSegment[], size: TLDefaultSizeStyle, scale: number, strokeWidth?: number): boolean;
    /**
     * Build a segment from points, encoding `path` at this stroke's `segmentDim` and
     * attaching `dim: 2` only when z was dropped. 3D segments omit `dim` so they
     * serialize byte-identically to pre-#8879 data.
     */
    private makeSegment;
    private startShape;
    private updateDrawingShape;
    private getLineLength;
    onPointerUp(): void;
    onCancel(): void;
    onComplete(): void;
    onInterrupt(): void;
    complete(): void;
    cancel(): void;
}
export {};
//# sourceMappingURL=Drawing.d.ts.map