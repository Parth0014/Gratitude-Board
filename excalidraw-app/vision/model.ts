/** Product data that can be serialized independently of the canvas engine. */
export interface VisionElementBase {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked: boolean;
  zIndex: number;
  excalidrawIds: string[];
  metadata: {
    aspirationId?: string;
    reelOrder?: number;
    sourceAssetId?: string;
    createdBy?: string;
    imageEdits?: import("./contracts").VisionImageEdits;
  };
}

export type VisionElement = VisionElementBase & {
  type:
    | "image"
    | "text"
    | "quote"
    | "shape"
    | "sticker"
    | "frame"
    | "decoration";
};

export interface VisionBoardDocument {
  version: 3;
  id: string;
  title: string;
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    texture: string;
  };
  elements: VisionElement[];
  assets: Record<string, import("../assets/contracts").GratitudeAsset>;
  layout: { id?: string; slotIds: string[]; freeform: boolean };
  fontManifest: Array<{
    family: string;
    source: "bundled" | "fontsource";
    license: "OFL-1.1" | "system";
    licenseUrl?: string;
  }>;
  reelConfig: {
    aspectRatio: "9:16";
    defaultDurationMs: number;
    elementOrder: string[];
  };
}
