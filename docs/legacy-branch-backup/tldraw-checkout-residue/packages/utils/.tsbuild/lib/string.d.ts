/**
 * Iterate over the grapheme clusters of a string — user-perceived characters such as emoji
 * sequences, flags, and accented letters — instead of UTF-16 code units. Uses `Intl.Segmenter`
 * where available and falls back to iterating by code point on browsers that lack it, where a
 * multi-code-point cluster is yielded as its component code points rather than as one segment.
 *
 * @public
 */
export declare function iterateGraphemes(str: string): IterableIterator<string>;
/**
 * Get the first character of a string, treating a multi-code-unit character such as an emoji as a
 * single character. Unlike `str[0]` or `str.charAt(0)`, which return one UTF-16 code unit and so
 * split an emoji into a broken half, this returns the first whole grapheme cluster. Returns an
 * empty string when the input is empty.
 *
 * @example
 * ```ts
 * getFirstCharacter('hello') // 'h'
 * getFirstCharacter('😀 hello') // '😀'
 * getFirstCharacter('') // ''
 * ```
 *
 * @public
 */
export declare function getFirstCharacter(str: string): string;
//# sourceMappingURL=string.d.ts.map