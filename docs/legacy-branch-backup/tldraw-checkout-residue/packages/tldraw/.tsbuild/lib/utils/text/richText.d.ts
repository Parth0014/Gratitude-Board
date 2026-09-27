import { Extension, Extensions } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';
import { type StarterKitOptions } from '@tiptap/starter-kit';
import { Editor, RichTextFontVisitorState, TLFontFace, TLRichText } from '@tldraw/editor';
/** @public */
export declare const KeyboardShiftEnterTweakExtension: Extension<any, any>;
/**
 * Build tldraw's default TipTap extension set, optionally overriding the bundled `StarterKit`
 * options. The one lever most consumers want is turning individual nodes off (e.g. comments use a
 * headingless set via `getTipTapDefaultExtensions({ heading: false })`); because `StarterKit` is a
 * single umbrella extension, its sub-extensions can only be disabled through its config, not by
 * filtering the returned array.
 *
 * @public
 */
export declare function getTipTapDefaultExtensions(starterKitOptions?: Partial<StarterKitOptions>): Extensions;
/**
 * Default extensions for the TipTap editor.
 *
 * @public
 */
export declare const tipTapDefaultExtensions: Extensions;
/**
 * Renders HTML from a rich text string using an explicit set of TipTap extensions, rather than the
 * ones configured on an editor. Use this when rendering rich text outside of a shape's editor
 * config (e.g. comments, which render through their own headingless extension set).
 *
 * @param richText - The rich text content.
 * @param extensions - The TipTap extensions to render with.
 *
 * @public
 */
export declare function renderHtmlFromRichTextWithExtensions(richText: TLRichText, extensions: Extensions): string;
/**
 * Renders HTML from a rich text string.
 *
 * @param editor - The editor instance.
 * @param richText - The rich text content.
 *
 * @public
 */
export declare function renderHtmlFromRichText(editor: Editor, richText: TLRichText): string;
/**
 * Renders HTML from a rich text string for measurement.
 * @param editor - The editor instance.
 * @param richText - The rich text content.
 *
 * @public
 */
export declare function renderHtmlFromRichTextForMeasurement(editor: Editor, richText: TLRichText): string;
export declare function isEmptyRichText(richText: TLRichText): boolean;
/**
 * Whether the editor's active rich text selection is inside a bullet or ordered list.
 * @internal
 */
export declare function isEditingRichTextList(editor: Editor): boolean;
/**
 * Renders plaintext from a rich text string.
 * @param editor - The editor instance.
 * @param richText - The rich text content.
 *
 * @public
 */
export declare function renderPlaintextFromRichText(editor: Editor, richText: TLRichText): string;
/**
 * Renders JSONContent from html.
 * @param editor - The editor instance.
 * @param richText - The rich text content.
 *
 * @public
 */
export declare function renderRichTextFromHTML(editor: Editor, html: string): TLRichText;
/** @public */
export declare function defaultAddFontsFromNode(node: Node, state: RichTextFontVisitorState, addFont: (font: TLFontFace) => void): RichTextFontVisitorState;
//# sourceMappingURL=richText.d.ts.map