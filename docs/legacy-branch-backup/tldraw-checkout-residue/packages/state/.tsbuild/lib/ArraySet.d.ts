/**
 * The number of items an ArraySet holds in array mode before switching to a Set.
 * Exported only for tests.
 * @internal
 */
export declare const ARRAY_SIZE_THRESHOLD = 8;
/**
 * An ArraySet operates as an array until it reaches a certain size, after which a Set is used
 * instead. In either case, the same methods are used to get, set, remove, and visit the items.
 *
 * `set` and `array` are never both non-null. `set` being null means array mode, but the array
 * itself is only allocated on the first `add` (most signals never get a child, and an empty
 * ArraySet is created for every atom and effect, and two for every computed), so array-mode code
 * must handle `array === null`; `arraySize` is 0 in that state. Once promoted to a set, an
 * ArraySet never goes back.
 * @internal
 */
export declare class ArraySet<T> {
    private set;
    private array;
    private arraySize;
    /**
     * Get whether this ArraySet has any elements.
     */
    get isEmpty(): boolean;
    /**
     * Add an element to the ArraySet if it is not already present.
     *
     * @returns `true` if the element was added, `false` if it was already present
     */
    add(elem: T): boolean;
    /**
     * Remove an element from the ArraySet if it is present.
     *
     * @returns `true` if the element was removed, `false` if it was not present
     */
    remove(elem: T): boolean;
    /**
     * Execute a callback function for each element in the ArraySet.
     */
    visit(visitor: (item: T) => void): void;
    /**
     * Make the ArraySet iterable, allowing it to be used in for...of loops and with spread syntax.
     */
    [Symbol.iterator](): Generator<T, void, unknown>;
    /**
     * Check whether an element is present in the ArraySet.
     */
    has(elem: T): boolean;
    /**
     * Remove all elements from the ArraySet.
     */
    clear(): void;
    /**
     * Get the number of elements in the ArraySet.
     */
    size(): number;
}
//# sourceMappingURL=ArraySet.d.ts.map