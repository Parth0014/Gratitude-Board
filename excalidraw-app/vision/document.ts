import type { ExcalidrawElement } from "@excalidraw/element/types";

import { normalizeGratitudeAsset } from "../assets/contracts";

import { getBoardBackground, getBoardPage } from "./engine/boardPage";
import { VISION_FONTS } from "./fonts";

import type { VisionBoardDocument, VisionElement } from "./model";

export const VISION_DOCUMENT_STORAGE_KEY = "gratitude:vision-document:v1";

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
    !!document.canvas &&
    typeof document.canvas.width === "number" &&
    typeof document.canvas.height === "number" &&
    Array.isArray(document.elements) &&
    !!document.assets &&
    typeof document.assets === "object"
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
      return {
        ...legacy,
        version: 3 as const,
        canvas: (legacy as { canvas?: VisionBoardDocument["canvas"] })
          .canvas || {
          width: 1200,
          height: 960,
          backgroundColor: "#ffffff",
          texture: "none",
        },
        layout: { slotIds: [], freeform: true },
        fontManifest: [],
        reelConfig: {
          aspectRatio: "9:16",
          defaultDurationMs: 2500,
          elementOrder: legacy.elements.map((element) => element.id),
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
    previousElements.map((element) => [element.excalidrawIds[0], element]),
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
