/** Start a new path. Builders must call this before writing. */
export declare function resetPath(): void;
/** Append a string of ASCII characters (command letters, arc flags) to the path. */
export declare function writeStr(s: string): void;
/**
 * Append a value given in integer hundredths, e.g. 255 as `2.55`, -30 as `-.3`, 0 as `0`.
 * Assumes |n| < 2^31, which holds for canvas coordinates (|v| < ~21 million px).
 */
export declare function writeC(n: number): void;
/** Append a coordinate pair given in integer hundredths as `x,y `. */
export declare function writeCPair(nx: number, ny: number): void;
/** Finish the path: decode everything written since `resetPath` and reset the writer. */
export declare function finishPath(): string;
/** Round a coordinate to integer hundredths. */
export declare function toCenti(v: number): number;
//# sourceMappingURL=fmt.d.ts.map