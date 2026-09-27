import type { TLShapeId } from '@tldraw/tlschema';
import { Box } from '../../../primitives/Box';
/**
 * Element stored in the R-tree spatial index.
 * Contains bounds (minX, minY, maxX, maxY) and shape ID.
 */
export interface SpatialElement {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    id: TLShapeId;
}
/**
 * Wrapper around RBush R-tree for efficient spatial queries.
 * Maintains a map of elements currently in the tree for efficient updates.
 */
export declare class RBushIndex {
    private rBush;
    private elementsInTree;
    constructor();
    /**
     * Search for shapes within the given bounds.
     * Returns set of shape IDs that intersect with the bounds.
     */
    search(bounds: Box): Set<TLShapeId>;
    /**
     * Remove a shape from the spatial index.
     */
    remove(id: TLShapeId): void;
    /**
     * Apply the removals and upserts collected during one incremental update.
     * Mutations are applied per item: bulk-rebuilding the whole tree instead
     * was measured slower even with ~10% of the index in the batch.
     */
    applyBatch(removes: Set<TLShapeId>, upserts: SpatialElement[]): void;
    /**
     * Bulk load elements into the spatial index.
     * More efficient than individual inserts for initial loading.
     */
    bulkLoad(elements: SpatialElement[]): void;
    /**
     * Clear all elements from the spatial index.
     */
    clear(): void;
    /**
     * Check if a shape is in the spatial index.
     */
    has(id: TLShapeId): boolean;
    /**
     * Get the number of elements in the spatial index.
     */
    getSize(): number;
    /**
     * Get the raw stored element for a shape, without allocating a Box.
     * Use when you only need to read the indexed bounds for comparison.
     *
     * @internal
     */
    getElement(id: TLShapeId): SpatialElement | undefined;
    /**
     * Dispose of the spatial index.
     * Clears all data structures to prevent memory leaks.
     */
    dispose(): void;
}
//# sourceMappingURL=RBushIndex.d.ts.map