import type { ExcalidrawElement } from "@excalidraw/element/types";

import { normalizeGratitudeAsset } from "../assets/contracts";

import { getBoardBackground, getBoardPage } from "./engine/boardPage";
import { VISION_FONTS } from "./fonts";

import type { VisionBoardDocument, VisionElement } from "./model";

export const VISION_DOCUMENT_STORAGE_KEY = "gratitude:vision-document:v1";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isVisionCanvas = (
  value: unknown,
): value is VisionBoardDocument["canvas"] =>
  isRecord(value) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height) &&
  value.width > 0 &&
  value.height > 0 &&
  typeof value.backgroundColor === "string" &&
  typeof value.texture === "string";

const VISION_ELEMENT_TYPES = new Set<VisionElement["type"]>([
  "image",
  "text",
  "quote",
  "note",
  "shape",
  "sticker",
  "frame",
  "decoration",
]);

const isVisionElement = (value: unknown): value is VisionElement => {
  if (!isRecord(value) || !isRecord(value.metadata)) {
    return false;
  }
  const metadata = value.metadata;
  return (
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    VISION_ELEMENT_TYPES.has(value.type as VisionElement["type"]) &&
    isFiniteNumber(value.x) &&
    isFiniteNumber(value.y) &&
    isFiniteNumber(value.width) &&
    isFiniteNumber(value.height) &&
    (value.width as number) >= 0 &&
    (value.height as number) >= 0 &&
    isFiniteNumber(value.rotation) &&
    isFiniteNumber(value.opacity) &&
    typeof value.locked === "boolean" &&
    isFiniteNumber(value.zIndex) &&
    Array.isArray(value.excalidrawIds) &&
    value.excalidrawIds.every((id) => typeof id === "string") &&
    (metadata.aspirationId === undefined ||
      typeof metadata.aspirationId === "string") &&
    (metadata.reelOrder === undefined || isFiniteNumber(metadata.reelOrder)) &&
    (metadata.sourceAssetId === undefined ||
      typeof metadata.sourceAssetId === "string") &&
    (metadata.createdBy === undefined || typeof metadata.createdBy === "string")
  );
};

const isVisionBoardDocument = (
  value: unknown,
): value is VisionBoardDocument => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const document = value as Partial<VisionBoardDocument>;
  return (
    document.version === 3 &&
    typeof document.id === "string" &&
    typeof document.title === "string" &&
    isVisionCanvas(document.canvas) &&
    Array.isArray(document.elements) &&
    document.elements.every(isVisionElement) &&
    !!document.assets &&
    typeof document.assets === "object" &&
    Object.values(document.assets).every(
      (asset) => normalizeGratitudeAsset(asset) !== null,
    ) &&
    !!document.layout &&
    (document.layout.id === undefined ||
      typeof document.layout.id === "string") &&
    Array.isArray(document.layout.slotIds) &&
    document.layout.slotIds.every((id) => typeof id === "string") &&
    typeof document.layout.freeform === "boolean" &&
    Array.isArray(document.fontManifest) &&
    document.fontManifest.every(
      (font) =>
        isRecord(font) &&
        typeof font.family === "string" &&
        ["bundled", "fontsource"].includes(String(font.source)) &&
        ["OFL-1.1", "system"].includes(String(font.license)) &&
        (font.licenseUrl === undefined || typeof font.licenseUrl === "string"),
    ) &&
    !!document.reelConfig &&
    document.reelConfig.aspectRatio === "9:16" &&
    isFiniteNumber(document.reelConfig.defaultDurationMs) &&
    document.reelConfig.defaultDurationMs > 0 &&
    Array.isArray(document.reelConfig.elementOrder) &&
    document.reelConfig.elementOrder.every((id) => typeof id === "string")
  );
};

export const readVisionBoardDocument = (
  serialized: string | null,
): VisionBoardDocument | null => {
  if (!serialized) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (isVisionBoardDocument(parsed)) {
      return parsed;
    }
    if (
      parsed &&
      typeof parsed === "object" &&
      [1, 2].includes(Number((parsed as { version?: unknown }).version))
    ) {
      const legacy = parsed as Omit<
        VisionBoardDocument,
        "version" | "canvas"
      > & { version: 1 };
      if (
        typeof legacy.id !== "string" ||
        typeof legacy.title !== "string" ||
        !Array.isArray(legacy.elements) ||
        !legacy.assets
      ) {
        return null;
      }
      const legacyElements = legacy.elements.filter(isVisionElement);
      const legacyAssets = Object.fromEntries(
        Object.entries(legacy.assets).filter(
          ([, asset]) => normalizeGratitudeAsset(asset) !== null,
        ),
      );
      const legacyCanvas = (legacy as { canvas?: unknown }).canvas;
      return {
        ...legacy,
        version: 3 as const,
        canvas: isVisionCanvas(legacyCanvas)
          ? legacyCanvas
          : {
              width: 1200,
              height: 960,
              backgroundColor: "#ffffff",
              texture: "none",
            },
        elements: legacyElements,
        assets: legacyAssets,
        layout: { slotIds: [], freeform: true },
        fontManifest: [],
        reelConfig: {
          aspectRatio: "9:16",
          defaultDurationMs: 2500,
          elementOrder: legacyElements.map((element) => element.id),
        },
      };
    }
    return null;
  } catch {
    return null;
  }
};

/** Upgrade a legacy scene or refresh a companion document after a scene edit. */
export const createVisionBoardDocument = (
  scene: readonly ExcalidrawElement[],
  title: string,
  previous: VisionBoardDocument | null = null,
): VisionBoardDocument => {
  const page = getBoardPage(scene);
  const background = getBoardBackground(scene);
  const previousElements =
    previous && previous.id === page?.id ? previous.elements : [];
  const priorElements = new Map(
    previousElements.flatMap((element) =>
      element.excalidrawIds.map((id) => [id, element] as const),
    ),
  );
  const assets: VisionBoardDocument["assets"] = {};
  const elements: VisionElement[] = [];
  const layoutSlots: string[] = [];
  let layoutId: string | undefined;
  const fontIds = new Set<number>();

  scene.forEach((element, zIndex) => {
    if (
      element.isDeleted ||
      element.id === page?.id ||
      element.id === background?.id ||
      element.customData?.gratitudeBackground === true ||
      element.customData?.gratitudeBackgroundImage === true ||
      element.customData?.gratitudeTextureImage === true
    ) {
      return;
    }
    const asset = element.customData?.gratitudeAsset;
    if (element.customData?.gratitudeLayoutSlot === true) {
      const slotId = element.customData?.gratitudeSlotId;
      if (typeof slotId === "string") {
        layoutSlots.push(slotId);
      }
      const candidate = element.customData?.gratitudeLayoutId;
      if (typeof candidate === "string") {
        layoutId = candidate;
      }
    }
    if (element.type === "text") {
      fontIds.add(element.fontFamily);
    }
    const sourceAsset = normalizeGratitudeAsset(asset);
    if (sourceAsset) {
      assets[sourceAsset.id] = sourceAsset;
    }
    const prior = priorElements.get(element.id);
    const gratitudeVision = element.customData?.gratitudeVision as
      | { id?: unknown; type?: unknown }
      | undefined;
    const imageEdits = element.customData?.gratitudeImageEdits as
      | import("./contracts").VisionImageEdits
      | undefined;
    const type: VisionElement["type"] =
      gratitudeVision?.type === "sticker" || sourceAsset?.type === "sticker"
        ? "sticker"
        : element.type === "image"
        ? "image"
        : element.type === "text"
        ? "text"
        : element.type === "stickynote"
        ? "note"
        : element.type === "frame"
        ? "frame"
        : element.type === "rectangle" ||
          element.type === "ellipse" ||
          element.type === "diamond"
        ? "shape"
        : "decoration";
    const visionId =
      typeof gratitudeVision?.id === "string"
        ? gratitudeVision.id
        : prior?.id || element.id;
    const compound = elements.find((item) => item.id === visionId);
    if (compound) {
      const right = Math.max(
        compound.x + compound.width,
        element.x + element.width,
      );
      const bottom = Math.max(
        compound.y + compound.height,
        element.y + element.height,
      );
      compound.x = Math.min(compound.x, element.x);
      compound.y = Math.min(compound.y, element.y);
      compound.width = right - compound.x;
      compound.height = bottom - compound.y;
      compound.excalidrawIds.push(element.id);
      compound.zIndex = Math.max(compound.zIndex, zIndex);
      if (sourceAsset) {
        compound.metadata.sourceAssetId = sourceAsset.id;
      }
      return;
    }
    elements.push({
      id: visionId,
      type,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.angle,
      opacity: element.opacity,
      locked: element.locked,
      zIndex,
      excalidrawIds: [element.id],
      metadata: {
        ...prior?.metadata,
        ...(sourceAsset ? { sourceAssetId: sourceAsset.id } : {}),
        ...(element.type === "image" && imageEdits ? { imageEdits } : {}),
      },
    });
  });

  return {
    version: 3,
    id: page?.id || previous?.id || "legacy-board",
    title,
    canvas: {
      width: page?.width || previous?.canvas.width || 1200,
      height: page?.height || previous?.canvas.height || 960,
      backgroundColor:
        background?.backgroundColor ||
        previous?.canvas.backgroundColor ||
        "#ffffff",
      texture: String(
        page?.customData?.gratitudeTexture ||
          previous?.canvas.texture ||
          "none",
      ),
    },
    elements,
    assets,
    layout: {
      id: layoutId,
      slotIds: layoutSlots,
      freeform: !layoutSlots.length,
    },
    fontManifest: VISION_FONTS.filter((font) => fontIds.has(font.value)).map(
      (font) => ({
        family: font.family,
        source: font.source,
        license: font.license,
        licenseUrl: font.licenseUrl,
      }),
    ),
    reelConfig: {
      aspectRatio: "9:16",
      defaultDurationMs: 2500,
      elementOrder: elements
        .slice()
        .sort(
          (a, b) =>
            (a.metadata.reelOrder ?? a.zIndex) -
            (b.metadata.reelOrder ?? b.zIndex),
        )
        .map((element) => element.id),
    },
  };
};
