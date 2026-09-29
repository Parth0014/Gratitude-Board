import type { GratitudeAsset } from "../assets/contracts";
import type { VisionLayout } from "./layouts";
import type { VisionTemplate } from "./templates";

export type VisionTheme = "light" | "dark";
export type VisionFontFamily =
  | "nunito"
  | "lilita-one"
  | "helvetica"
  | "virgil"
  | "assistant"
  | "comic-shanns"
  | "playfair-display"
  | "dm-serif-display"
  | "cormorant-garamond"
  | "libre-baskerville"
  | "inter"
  | "poppins"
  | "montserrat"
  | "raleway"
  | "caveat"
  | "dancing-script"
  | "patrick-hand"
  | "kalam"
  | "fredoka"
  | "pacifico";

export interface VisionTextPreset {
  id: string;
  label: string;
  sample: string;
  category: "editorial" | "handwritten" | "playful" | "minimal" | "reflection";
  fontFamily: VisionFontFamily;
  fontSize: number;
  color: string;
  align?: "left" | "center" | "right";
}

export type VisionSelectionKind =
  | "none"
  | "text"
  | "note"
  | "image"
  | "shape"
  | "drawing"
  | "item"
  | "multiple";

export type VisionImageFilter =
  | "original"
  | "warm"
  | "film"
  | "soft"
  | "mono"
  | "dreamy"
  | "vintage";

export type VisionImageFrame =
  | "none"
  | "rounded"
  | "circle"
  | "polaroid"
  | "film"
  | "arch"
  | "heart"
  | "blob"
  | "organic"
  | "torn";

export interface VisionImageEdits {
  filter: VisionImageFilter;
  frame: VisionImageFrame;
  brightness: number;
  exposure: number;
  contrast: number;
  saturation: number;
  highlights: number;
  shadows: number;
  fade: number;
  grain: number;
  borderWidth: number;
  borderColor: string;
  shadow: number;
  glow: number;
  warmth: number;
  blur: number;
  flipX: boolean;
  flipY: boolean;
}

export interface VisionSelection {
  ids: string[];
  count: number;
  kind: VisionSelectionKind;
  style: {
    fontFamily?: VisionFontFamily;
    fontSize?: number;
    textAlign?: "left" | "center" | "right";
    strokeColor?: string;
    backgroundColor?: string;
    strokeWidth?: number;
    opacity?: number;
    width?: number;
    height?: number;
    rounded?: boolean;
    imageEdits?: VisionImageEdits;
  };
}

export type VisionSelectionPatch = Partial<VisionSelection["style"]>;

export interface VisionPoint {
  x: number;
  y: number;
  constrainToBoard?: boolean;
}

/** Product-facing canvas API. No Excalidraw types may cross this boundary. */
export interface CanvasAdapter {
  createImage(
    blob: Blob,
    ownerWindow: Window & typeof globalThis,
    sourceAsset?: GratitudeAsset,
    position?: VisionPoint,
  ): Promise<string>;
  replaceSelectedImage(
    blob: Blob,
    ownerWindow: Window & typeof globalThis,
    sourceAsset?: GratitudeAsset,
  ): Promise<string | null>;
  getSelection(): VisionSelection;
  updateSelection(patch: VisionSelectionPatch): void;
  updateImageEdits(
    patch: Partial<VisionImageEdits>,
    ownerDocument: Document,
  ): Promise<void>;
  resetImageEdits(ownerDocument: Document): Promise<void>;
  previewOriginalImage(show: boolean): void;
  startImageCrop(): void;
  setImageFit(mode: "fit" | "fill"): void;
  rotateSelection(degrees: number): void;
  select(ids: string[]): void;
  delete(ids: string[]): void;
  duplicateSelection(): void;
  arrangeSelection(position: "front" | "back"): void;
  activateTool(tool: "image" | "note" | "text"): void;
  createTextPreset(preset: VisionTextPreset): void;
  applyLayout(layout: VisionLayout): void;
  applyTemplate(template: VisionTemplate): void;
  fitBoard(): void;
  exportImage(): void;
  exportSelection(): void;
  downloadSelectedPrint(ownerDocument: Document, scale?: number): Promise<void>;
  downloadHighResolution(
    ownerDocument: Document,
    scale?: number,
  ): Promise<void>;
  printBoard(ownerDocument: Document): Promise<void>;
  downloadReelVideo(ownerDocument: Document): Promise<void>;
  downloadAttributions(ownerDocument: Document): void;
  downloadReelPlan(ownerDocument: Document): void;
  downloadReel(ownerDocument: Document): void;
}

export const EMPTY_VISION_SELECTION: VisionSelection = {
  ids: [],
  count: 0,
  kind: "none",
  style: {},
};
