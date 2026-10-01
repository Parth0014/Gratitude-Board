import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import { exportToCanvas as exportSceneToCanvas } from "@excalidraw/excalidraw/scene/export";
import { ROUNDNESS, arrayToMap, getLineHeight } from "@excalidraw/common";
import {
  duplicateElements,
  newElementWith,
  newElement,
  newImageElement,
  newTextElement,
  refreshTextDimensions,
} from "@excalidraw/element";

import type {
  BinaryFileData,
  DataURL,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type {
  ExcalidrawFrameElement,
  FileId,
  NonDeleted,
} from "@excalidraw/element/types";
import type { Radians } from "@excalidraw/math";

import { getBoardBackground, getBoardPage } from "./engine/boardPage";
import { inspectBoardScene } from "./engine/sceneGuard";
import { rescaleImageCrop } from "./engine/imageCrop";

import { registerVisionFonts, VISION_FONTS } from "./fonts";

import { getLayoutSlotBounds } from "./layouts";

import type {
  CanvasAdapter,
  VisionFontFamily,
  VisionSelection,
  VisionSelectionKind,
  VisionSelectionPatch,
  VisionImageEdits,
} from "./contracts";
import type { VisionLayout } from "./layouts";
import type { VisionTextPreset } from "./typography";
import type { VisionTemplate } from "./templates";

registerVisionFonts();
const FONT_VALUES = Object.fromEntries(
  VISION_FONTS.map((font) => [font.id, font.value]),
) as Record<VisionFontFamily, number>;

const getVisionFont = (value: number): VisionFontFamily =>
  (Object.entries(FONT_VALUES).find(([, font]) => font === value)?.[0] as
    | VisionFontFamily
    | undefined) || "nunito";

const DEFAULT_IMAGE_EDITS: VisionImageEdits = {
  filter: "original",
  frame: "none",
  brightness: 100,
  exposure: 0,
  contrast: 100,
  saturation: 100,
  highlights: 0,
  shadows: 0,
  fade: 0,
  grain: 0,
  borderWidth: 0,
  borderColor: "#ffffff",
  shadow: 0,
  glow: 0,
  warmth: 0,
  blur: 0,
  flipX: false,
  flipY: false,
};

const getImageEditData = (customData: Record<string, unknown> | undefined) => {
  const data = customData?.gratitudeImageEdits as
    | (Partial<VisionImageEdits> & { originalFileId?: string })
    | undefined;
  return { ...DEFAULT_IMAGE_EDITS, ...data };
};

const filterCss = (edits: VisionImageEdits) => {
  const presets = {
    original: "",
    warm: "sepia(.18) saturate(1.12)",
    film: "contrast(1.08) saturate(.86) sepia(.1)",
    soft: "contrast(.92) saturate(.9) brightness(1.06)",
    mono: "grayscale(1) contrast(1.06)",
    dreamy: "brightness(1.08) saturate(.82) contrast(.9)",
    vintage: "sepia(.32) contrast(.92) saturate(.78)",
  }[edits.filter];
  return [
    presets,
    `brightness(${Math.max(
      10,
      edits.brightness + edits.exposure + edits.shadows * 0.12,
    )}%)`,
    `contrast(${Math.max(
      10,
      edits.contrast + edits.highlights * 0.18 - edits.fade * 0.45,
    )}%)`,
    `saturate(${edits.saturation}%)`,
    edits.warmth
      ? `sepia(${Math.abs(edits.warmth) / 250}) hue-rotate(${
          edits.warmth < 0 ? 180 : 0
        }deg)`
      : "",
    edits.blur ? `blur(${edits.blur}px)` : "",
  ]
    .filter(Boolean)
    .join(" ");
};

const coverCrop = (
  naturalWidth: number,
  naturalHeight: number,
  targetWidth: number,
  targetHeight: number,
) => {
  const targetRatio = targetWidth / targetHeight;
  const naturalRatio = naturalWidth / naturalHeight;
  const width =
    naturalRatio > targetRatio ? naturalHeight * targetRatio : naturalWidth;
  const height =
    naturalRatio > targetRatio ? naturalHeight : naturalWidth / targetRatio;
  return {
    x: (naturalWidth - width) / 2,
    y: (naturalHeight - height) / 2,
    width,
    height,
    naturalWidth,
    naturalHeight,
  };
};

const clipImageFrame = (
  context: CanvasRenderingContext2D,
  frame: VisionImageEdits["frame"],
  width: number,
  height: number,
) => {
  if (!["arch", "heart", "blob", "organic", "torn"].includes(frame)) {
    return;
  }
  context.beginPath();
  if (frame === "arch") {
    context.moveTo(0, height);
    context.lineTo(0, height * 0.42);
    context.bezierCurveTo(
      0,
      -height * 0.1,
      width,
      -height * 0.1,
      width,
      height * 0.42,
    );
    context.lineTo(width, height);
  } else if (frame === "heart") {
    context.moveTo(width / 2, height);
    context.bezierCurveTo(
      -width * 0.12,
      height * 0.58,
      0,
      height * 0.12,
      width * 0.25,
      height * 0.12,
    );
    context.bezierCurveTo(
      width * 0.4,
      height * 0.12,
      width * 0.5,
      height * 0.27,
      width / 2,
      height * 0.34,
    );
    context.bezierCurveTo(
      width * 0.5,
      height * 0.27,
      width * 0.6,
      height * 0.12,
      width * 0.75,
      height * 0.12,
    );
    context.bezierCurveTo(
      width,
      height * 0.12,
      width * 1.12,
      height * 0.58,
      width / 2,
      height,
    );
  } else if (frame === "blob") {
    context.moveTo(width * 0.5, 0);
    context.bezierCurveTo(
      width * 0.86,
      0,
      width,
      height * 0.22,
      width * 0.94,
      height * 0.55,
    );
    context.bezierCurveTo(
      width * 0.88,
      height * 0.9,
      width * 0.63,
      height,
      width * 0.34,
      height * 0.94,
    );
    context.bezierCurveTo(
      0,
      height * 0.88,
      -width * 0.06,
      height * 0.48,
      width * 0.08,
      height * 0.2,
    );
    context.bezierCurveTo(
      width * 0.2,
      -height * 0.02,
      width * 0.34,
      0,
      width * 0.5,
      0,
    );
  } else if (frame === "organic") {
    context.moveTo(width * 0.18, height * 0.08);
    context.bezierCurveTo(
      width * 0.48,
      -height * 0.04,
      width * 0.9,
      height * 0.02,
      width * 0.96,
      height * 0.34,
    );
    context.bezierCurveTo(
      width * 1.03,
      height * 0.68,
      width * 0.77,
      height * 0.98,
      width * 0.43,
      height,
    );
    context.bezierCurveTo(
      width * 0.1,
      height * 1.02,
      -width * 0.06,
      height * 0.72,
      width * 0.04,
      height * 0.42,
    );
    context.bezierCurveTo(
      width * 0.08,
      height * 0.25,
      width * 0.05,
      height * 0.14,
      width * 0.18,
      height * 0.08,
    );
  } else {
    const points = 18;
    for (let index = 0; index <= points; index += 1) {
      const x = (width * index) / points;
      const y = index % 2 ? height * 0.018 : 0;
      index ? context.lineTo(x, y) : context.moveTo(x, y);
    }
    for (let index = 0; index <= points; index += 1) {
      context.lineTo(
        index % 2 ? width * 0.982 : width,
        (height * index) / points,
      );
    }
    for (let index = points; index >= 0; index -= 1) {
      context.lineTo(
        (width * index) / points,
        index % 2 ? height * 0.982 : height,
      );
    }
    for (let index = points; index >= 0; index -= 1) {
      context.lineTo(index % 2 ? width * 0.018 : 0, (height * index) / points);
    }
  }
  context.closePath();
  context.clip();
};

const getSelectionKind = (type: string): VisionSelectionKind => {
  if (type === "text") {
    return "text";
  }
  if (type === "stickynote") {
    return "note";
  }
  if (type === "image") {
    return "image";
  }
  if (type === "freedraw") {
    return "drawing";
  }
  if (["rectangle", "ellipse", "diamond", "line", "arrow"].includes(type)) {
    return "shape";
  }
  return "item";
};

export const createCanvasAdapter = (
  api: ExcalidrawImperativeAPI,
): CanvasAdapter => {
  const imageEditVersions = new Map<string, number>();
  const pendingImageEdits = new Map<
    string,
    ReturnType<typeof getImageEditData>
  >();
  const prepareImageFile = async (
    blob: Blob,
    ownerWindow: Window & typeof globalThis,
  ) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(blob.type)) {
      throw new Error("Unsupported image type");
    }
    const dataURL = await new Promise<DataURL>((resolve, reject) => {
      const reader = new ownerWindow.FileReader();
      reader.onload = () => resolve(reader.result as DataURL);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
    const bitmap = await ownerWindow.createImageBitmap(blob);
    const imageFile = {
      fileId: ownerWindow.crypto.randomUUID() as FileId,
      dataURL,
      naturalWidth: bitmap.width,
      naturalHeight: bitmap.height,
    };
    bitmap.close();
    api.addFiles([
      {
        id: imageFile.fileId,
        dataURL,
        mimeType: blob.type as BinaryFileData["mimeType"],
        created: Date.now(),
      },
    ]);
    return imageFile;
  };

  const renderBoard = async (ownerDocument: Document, requestedScale = 2) => {
    const page = getBoardPage(api.getSceneElements());
    if (!page || page.type !== "frame" || page.isDeleted) {
      throw new Error("Board is unavailable");
    }
    // Browsers silently fail or return blank canvases above ~16.7MP (iOS Safari).
    const MAX_EXPORT_PIXELS = 16_000_000;
    const scale = Math.min(
      requestedScale,
      Math.sqrt(MAX_EXPORT_PIXELS / (page.width * page.height)),
    );
    const elements = api
      .getSceneElements()
      .filter((element) => !element.isDeleted);
    const files = api.getFiles();
    const missingImages = elements.filter(
      (element) =>
        element.type === "image" &&
        (!element.fileId || !files[element.fileId]?.dataURL),
    ).length;
    if (missingImages) {
      throw new Error(
        `${missingImages} board image${
          missingImages === 1 ? " is" : "s are"
        } unavailable. Reconnect or replace the missing asset before exporting.`,
      );
    }
    await Promise.all(
      elements.flatMap((element) => {
        if (element.type !== "text") {
          return [];
        }
        const family = VISION_FONTS.find(
          (font) => font.value === element.fontFamily,
        )?.family;
        return family
          ? [
              ownerDocument.fonts
                .load(`${element.fontSize}px "${family}"`, element.text)
                .catch(() => []),
            ]
          : [];
      }),
    );
    await ownerDocument.fonts.ready;
    const missingFont = elements.find((element) => {
      if (element.type !== "text") {
        return false;
      }
      const family = VISION_FONTS.find(
        (font) => font.value === element.fontFamily,
      )?.family;
      return family
        ? !ownerDocument.fonts.check(`16px "${family}"`, element.text)
        : false;
    });
    if (missingFont) {
      throw new Error(
        "A board font could not be loaded. Check your connection or choose another font before exporting.",
      );
    }
    const canvas = await exportSceneToCanvas(
      elements,
      { ...api.getAppState(), exportScale: scale },
      files,
      {
        exportBackground: true,
        exportPadding: 0,
        viewBackgroundColor: "#ffffff",
        exportingFrame: page as NonDeleted<ExcalidrawFrameElement>,
      },
      (width, height) => {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        return { canvas, scale };
      },
    );
    const credits = Array.from(
      new Map(
        elements.flatMap((element) => {
          const asset = element.customData?.gratitudeAsset as
            | import("../assets/contracts").GratitudeAsset
            | undefined;
          return asset?.license.attributionRequired
            ? [[asset.id, asset] as const]
            : [];
        }),
      ).values(),
    );
    if (!credits.length) {
      return canvas;
    }
    const fontSize = Math.max(11, Math.round(11 * scale));
    const lineHeight = Math.round(fontSize * 1.4);
    const horizontalPadding = Math.round(12 * scale);
    const measure = canvas.getContext("2d");
    if (!measure) {
      throw new Error("Attribution export is unavailable");
    }
    measure.font = `${fontSize}px sans-serif`;
    const maxLineWidth = canvas.width - horizontalPadding * 2;
    const creditLines = credits.flatMap((asset) => {
      const value = `${asset.title}${
        asset.license.author ? ` by ${asset.license.author}` : ""
      } (${asset.license.label})`;
      const words = value.split(/\s+/);
      const lines: string[] = [];
      let line = "";
      words.forEach((word) => {
        const candidate = line ? `${line} ${word}` : word;
        if (line && measure.measureText(candidate).width > maxLineWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      if (line) {
        lines.push(line);
      }
      return lines;
    });
    const footerHeight = Math.max(
      48,
      Math.round(12 * scale) * 2 + lineHeight * (creditLines.length + 1),
    );
    const output = ownerDocument.createElement("canvas");
    output.width = canvas.width;
    output.height = canvas.height + footerHeight;
    const outputContext = output.getContext("2d");
    if (!outputContext) {
      throw new Error("Attribution export is unavailable");
    }
    outputContext.drawImage(canvas, 0, 0);
    outputContext.fillStyle = "#fffafc";
    outputContext.fillRect(0, canvas.height, output.width, footerHeight);
    outputContext.fillStyle = "#594b53";
    outputContext.font = `${fontSize}px sans-serif`;
    outputContext.textBaseline = "top";
    let lineY = canvas.height + Math.round(12 * scale);
    outputContext.font = `600 ${fontSize}px sans-serif`;
    outputContext.fillText("Asset credits", horizontalPadding, lineY);
    outputContext.font = `${fontSize}px sans-serif`;
    creditLines.forEach((line) => {
      lineY += lineHeight;
      outputContext.fillText(line, horizontalPadding, lineY);
    });
    return output;
  };

  const downloadBlob = (
    ownerDocument: Document,
    blob: Blob,
    filename: string,
  ) => {
    const ownerWindow = ownerDocument.defaultView;
    if (!ownerWindow) {
      return;
    }
    const url = ownerWindow.URL.createObjectURL(blob);
    const anchor = ownerDocument.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    ownerWindow.setTimeout(() => ownerWindow.URL.revokeObjectURL(url), 30_000);
  };

  const renderSelection = async (ownerDocument: Document, scale = 3) => {
    const selectedIds = api.getAppState().selectedElementIds;
    const elements = api
      .getSceneElements()
      .filter((element) => !element.isDeleted && selectedIds[element.id]);
    if (!elements.length) {
      throw new Error("Select a board item before exporting a print piece");
    }
    const files = api.getFiles();
    const missing = elements.some(
      (element) =>
        element.type === "image" &&
        (!element.fileId || !files[element.fileId]?.dataURL),
    );
    if (missing) {
      throw new Error("The selected item contains an unavailable image");
    }
    await ownerDocument.fonts.ready;
    return exportSceneToCanvas(
      elements,
      { ...api.getAppState(), exportScale: scale },
      files,
      {
        exportBackground: false,
        exportPadding: 24,
        viewBackgroundColor: "transparent",
        exportingFrame: null,
      },
      (width, height) => {
        const canvas = ownerDocument.createElement("canvas");
        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));
        return { canvas, scale };
      },
    );
  };

  const getSelection = (): VisionSelection => {
    const selectedIds = api.getAppState().selectedElementIds;
    const selected = api
      .getSceneElements()
      .filter((element) => selectedIds[element.id]);
    if (selected.length !== 1) {
      return {
        ids: selected.map(({ id }) => id),
        count: selected.length,
        kind: selected.length ? "multiple" : "none",
        style: {},
      };
    }
    const [element] = selected;
    return {
      ids: [element.id],
      count: 1,
      kind: getSelectionKind(element.type),
      style: {
        opacity: element.opacity,
        width: element.width,
        height: element.height,
        strokeColor: element.strokeColor,
        backgroundColor: element.backgroundColor,
        strokeWidth: element.strokeWidth,
        rounded: !!element.roundness,
        ...(element.type === "text"
          ? {
              fontFamily: getVisionFont(element.fontFamily),
              fontSize: element.fontSize,
              textAlign: (["left", "center", "right"] as const).includes(
                element.textAlign as "left" | "center" | "right",
              )
                ? (element.textAlign as "left" | "center" | "right")
                : "left",
            }
          : {}),
        ...(element.type === "image"
          ? { imageEdits: getImageEditData(element.customData) }
          : {}),
      },
    };
  };

  const updateSelection = (patch: VisionSelectionPatch) => {
    const selectedIds = api.getAppState().selectedElementIds;
    const scene = api.getSceneElements();
    const elementsMap = new Map(scene.map((element) => [element.id, element]));
    const elements = scene.map((element) => {
      if (!selectedIds[element.id]) {
        return element;
      }
      const common = {
        ...(patch.opacity === undefined ? {} : { opacity: patch.opacity }),
        ...(patch.strokeColor === undefined
          ? {}
          : { strokeColor: patch.strokeColor }),
        ...(patch.backgroundColor === undefined
          ? {}
          : { backgroundColor: patch.backgroundColor }),
        ...(patch.strokeWidth === undefined
          ? {}
          : { strokeWidth: patch.strokeWidth }),
        ...(patch.rounded === undefined || element.type !== "rectangle"
          ? {}
          : {
              roundness: patch.rounded
                ? { type: ROUNDNESS.PROPORTIONAL_RADIUS }
                : null,
            }),
      };
      if (element.type === "text") {
        const fontFamily = patch.fontFamily
          ? FONT_VALUES[patch.fontFamily]
          : element.fontFamily;
        const next = newElementWith(element, {
          ...common,
          ...(patch.fontSize === undefined ? {} : { fontSize: patch.fontSize }),
          ...(patch.textAlign === undefined
            ? {}
            : { textAlign: patch.textAlign }),
          ...(patch.fontFamily === undefined
            ? {}
            : { fontFamily, lineHeight: getLineHeight(fontFamily) }),
        });
        const dimensions = refreshTextDimensions(next, null, elementsMap);
        return dimensions ? newElementWith(next, dimensions) : next;
      }
      if (element.type === "image" && (patch.width || patch.height)) {
        const ratio = element.width / element.height;
        const width = patch.width ?? patch.height! * ratio;
        const height = patch.height ?? patch.width! / ratio;
        return newElementWith(element, { ...common, width, height });
      }
      return newElementWith(element, common);
    });
    api.updateScene({
      elements,
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
  };

  return {
    async createImage(blob, ownerWindow, sourceAsset, position) {
      const { fileId, naturalWidth, naturalHeight } = await prepareImageFile(
        blob,
        ownerWindow,
      );
      const state = api.getAppState();
      const scene = api.getSceneElements();
      const page = getBoardPage(scene);
      const selectedIds = state.selectedElementIds;
      const selectedSlot = scene.find(
        (element) =>
          selectedIds[element.id] &&
          element.customData?.gratitudeLayoutSlot === true,
      );
      const size = Math.min(280, (page?.width || state.width) * 0.35);
      let width =
        naturalWidth >= naturalHeight
          ? size
          : (size * naturalWidth) / naturalHeight;
      let height =
        naturalHeight >= naturalWidth
          ? size
          : (size * naturalHeight) / naturalWidth;
      if (selectedSlot) {
        width = selectedSlot.width;
        height = selectedSlot.height;
      }
      const defaultX = selectedSlot
        ? selectedSlot.x
        : page
        ? page.x + (page.width - width) / 2
        : state.width / (2 * state.zoom.value) - state.scrollX - width / 2;
      const defaultY = selectedSlot
        ? selectedSlot.y
        : page
        ? page.y + (page.height - height) / 2
        : state.height / (2 * state.zoom.value) - state.scrollY - height / 2;
      let x = selectedSlot
        ? selectedSlot.x
        : position
        ? position.x - width / 2
        : defaultX;
      let y = selectedSlot
        ? selectedSlot.y
        : position
        ? position.y - height / 2
        : defaultY;
      if (page && position?.constrainToBoard) {
        x = Math.min(Math.max(x, page.x), page.x + page.width - width);
        y = Math.min(Math.max(y, page.y), page.y + page.height - height);
      }
      const belongsToBoard =
        !!page &&
        x >= page.x &&
        y >= page.y &&
        x + width <= page.x + page.width &&
        y + height <= page.y + page.height;
      const image = newImageElement({
        type: "image",
        x,
        y,
        width,
        height,
        frameId: belongsToBoard ? page.id : null,
        fileId,
        status: "saved",
        crop: selectedSlot
          ? coverCrop(
              naturalWidth,
              naturalHeight,
              selectedSlot.width,
              selectedSlot.height,
            )
          : null,
        angle: selectedSlot?.angle,
        roundness:
          selectedSlot?.customData?.gratitudeSlotFrame === "rounded" ||
          selectedSlot?.customData?.gratitudeSlotFrame === "circle"
            ? { type: ROUNDNESS.PROPORTIONAL_RADIUS }
            : null,
        customData: {
          gratitudeImageNaturalSize: {
            width: naturalWidth,
            height: naturalHeight,
          },
          ...(sourceAsset
            ? {
                gratitudeVision: {
                  version: 1,
                  id: ownerWindow.crypto.randomUUID(),
                  type: sourceAsset?.type === "sticker" ? "sticker" : "image",
                },
                gratitudeAsset: sourceAsset,
              }
            : {}),
          ...(selectedSlot
            ? {
                gratitudeLayoutPlacement: {
                  layoutId: selectedSlot.customData?.gratitudeLayoutId,
                  slotId: selectedSlot.customData?.gratitudeSlotId,
                },
              }
            : {}),
        },
      });
      api.updateScene({
        elements: [
          ...scene.filter((element) => element.id !== selectedSlot?.id),
          image,
        ],
        appState: { selectedElementIds: { [image.id]: true } },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      api.setActiveTool({ type: "selection" });
      return image.id;
    },
    async replaceSelectedImage(blob, ownerWindow, sourceAsset) {
      const selectedIds = api.getAppState().selectedElementIds;
      const selected = api
        .getSceneElements()
        .find((element) => selectedIds[element.id] && element.type === "image");
      if (!selected || selected.type !== "image") {
        return null;
      }
      const { fileId, naturalWidth, naturalHeight } = await prepareImageFile(
        blob,
        ownerWindow,
      );
      const replacement = newElementWith(selected, {
        fileId,
        status: "saved",
        crop: coverCrop(
          naturalWidth,
          naturalHeight,
          selected.width,
          selected.height,
        ),
        customData: {
          ...selected.customData,
          gratitudeImageNaturalSize: {
            width: naturalWidth,
            height: naturalHeight,
          },
          gratitudeImageEdits: undefined,
          ...(sourceAsset ? { gratitudeAsset: sourceAsset } : {}),
        },
      });
      api.updateScene({
        elements: api
          .getSceneElements()
          .map((element) =>
            element.id === replacement.id ? replacement : element,
          ),
        appState: { selectedElementIds: { [replacement.id]: true } },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      return replacement.id;
    },
    getSelection,
    updateSelection,
    async updateImageEdits(patch, ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const selectedIds = api.getAppState().selectedElementIds;
      const selected = api
        .getSceneElements()
        .find((element) => selectedIds[element.id] && element.type === "image");
      if (!selected || selected.type !== "image" || !selected.fileId) {
        return;
      }
      const previous =
        pendingImageEdits.get(selected.id) ||
        getImageEditData(selected.customData);
      const edits = { ...previous, ...patch };
      pendingImageEdits.set(selected.id, edits);
      const editVersion = (imageEditVersions.get(selected.id) || 0) + 1;
      imageEditVersions.set(selected.id, editVersion);
      const originalFileId = previous.originalFileId || selected.fileId;
      const original = api.getFiles()[originalFileId];
      if (!original) {
        throw new Error("The original photo is unavailable");
      }

      const image = new ownerWindow.Image();
      image.decoding = "async";
      image.src = original.dataURL;
      await image.decode();
      const maxDimension = 2048;
      const scale = Math.min(
        1,
        maxDimension / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = ownerDocument.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Photo editing is unavailable");
      }
      const processed = ownerDocument.createElement("canvas");
      processed.width = canvas.width;
      processed.height = canvas.height;
      const processedContext = processed.getContext("2d");
      if (!processedContext) {
        throw new Error("Photo effects are unavailable");
      }
      processedContext.filter = filterCss(edits);
      processedContext.save();
      clipImageFrame(
        processedContext,
        edits.frame,
        processed.width,
        processed.height,
      );
      processedContext.drawImage(
        image,
        0,
        0,
        processed.width,
        processed.height,
      );
      processedContext.restore();
      if (edits.grain > 0) {
        const imageData = processedContext.getImageData(
          0,
          0,
          processed.width,
          processed.height,
        );
        const amount = edits.grain * 0.45;
        for (let index = 0; index < imageData.data.length; index += 4) {
          const noise =
            ((((index * 1103515245 + 12345) >>> 16) & 255) / 255 - 0.5) *
            amount;
          imageData.data[index] += noise;
          imageData.data[index + 1] += noise;
          imageData.data[index + 2] += noise;
        }
        processedContext.putImageData(imageData, 0, 0);
      }
      const effects = [];
      if (edits.shadow > 0) {
        effects.push(
          `drop-shadow(8px 10px ${Math.max(
            1,
            edits.shadow,
          )}px rgba(38, 28, 44, 0.45))`,
        );
      }
      if (edits.glow > 0) {
        effects.push(
          `drop-shadow(0 0 ${Math.max(
            1,
            edits.glow,
          )}px rgba(255, 222, 235, 0.95))`,
        );
      }
      context.filter = effects.join(" ") || "none";
      context.drawImage(processed, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("Photo edit failed")),
          "image/png",
        ),
      );
      const digest = await ownerWindow.crypto.subtle.digest(
        "SHA-256",
        await blob.arrayBuffer(),
      );
      const fileId = Array.from(new Uint8Array(digest))
        .slice(0, 16)
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("") as FileId;
      const dataURL = canvas.toDataURL("image/png") as DataURL;
      if (imageEditVersions.get(selected.id) !== editVersion) {
        return;
      }
      api.addFiles([
        {
          id: fileId,
          dataURL,
          mimeType: "image/png",
          created: Date.now(),
        },
      ]);
      const elements = api.getSceneElements().map((element) => {
        if (element.id !== selected.id || element.type !== "image") {
          return element;
        }
        const frame = edits.frame;
        const shouldSquare = ["circle", "heart", "blob", "organic"].includes(
          frame,
        );
        const size = Math.min(element.width, element.height);
        return newElementWith(element, {
          fileId,
          crop: rescaleImageCrop(element.crop, canvas.width, canvas.height),
          width: shouldSquare ? size : element.width,
          height: shouldSquare ? size : element.height,
          scale: [edits.flipX ? -1 : 1, edits.flipY ? -1 : 1],
          roundness:
            frame === "rounded" || frame === "circle"
              ? { type: ROUNDNESS.PROPORTIONAL_RADIUS }
              : null,
          strokeColor:
            frame === "polaroid"
              ? "#fffdf8"
              : frame === "film"
              ? "#231f24"
              : edits.borderWidth > 0
              ? edits.borderColor
              : "transparent",
          strokeWidth:
            frame === "polaroid"
              ? 16
              : frame === "film"
              ? 10
              : Math.max(1, edits.borderWidth),
          customData: {
            ...element.customData,
            gratitudeImageEdits: {
              ...edits,
              originalFileId,
              derivativeFileId: fileId,
            },
          },
        });
      });
      api.updateScene({
        elements,
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      pendingImageEdits.delete(selected.id);
    },
    async resetImageEdits(ownerDocument) {
      await this.updateImageEdits(DEFAULT_IMAGE_EDITS, ownerDocument);
    },
    previewOriginalImage(show) {
      const selectedIds = api.getAppState().selectedElementIds;
      api.updateScene({
        elements: api.getSceneElements().map((element) => {
          if (!selectedIds[element.id] || element.type !== "image") {
            return element;
          }
          const edits = element.customData?.gratitudeImageEdits as
            | (Partial<VisionImageEdits> & {
                originalFileId?: FileId;
                derivativeFileId?: FileId;
              })
            | undefined;
          const fileId = show ? edits?.originalFileId : edits?.derivativeFileId;
          return fileId ? newElementWith(element, { fileId }) : element;
        }),
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    },
    startImageCrop() {
      const selectedIds = api.getAppState().selectedElementIds;
      const image = api
        .getSceneElements()
        .find((element) => selectedIds[element.id] && element.type === "image");
      if (!image) {
        return;
      }
      api.updateScene({ appState: { croppingElementId: image.id } });
    },
    setImageFit(mode) {
      const selectedIds = api.getAppState().selectedElementIds;
      const elements = api.getSceneElements().map((element) => {
        if (!selectedIds[element.id] || element.type !== "image") {
          return element;
        }
        const natural = element.customData?.gratitudeImageNaturalSize as
          | { width?: unknown; height?: unknown }
          | undefined;
        const naturalWidth =
          typeof natural?.width === "number" ? natural.width : element.width;
        const naturalHeight =
          typeof natural?.height === "number" ? natural.height : element.height;
        if (mode === "fit") {
          const ratio = naturalWidth / naturalHeight;
          const width = Math.min(element.width, element.height * ratio);
          const height = width / ratio;
          return newElementWith(element, {
            x: element.x + (element.width - width) / 2,
            y: element.y + (element.height - height) / 2,
            width,
            height,
            crop: null,
          });
        }
        const targetRatio = element.width / element.height;
        const naturalRatio = naturalWidth / naturalHeight;
        const cropWidth =
          naturalRatio > targetRatio
            ? naturalHeight * targetRatio
            : naturalWidth;
        const cropHeight =
          naturalRatio > targetRatio
            ? naturalHeight
            : naturalWidth / targetRatio;
        return newElementWith(element, {
          crop: {
            x: (naturalWidth - cropWidth) / 2,
            y: (naturalHeight - cropHeight) / 2,
            width: cropWidth,
            height: cropHeight,
            naturalWidth,
            naturalHeight,
          },
        });
      });
      api.updateScene({
        elements,
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    rotateSelection(degrees) {
      const selectedIds = api.getAppState().selectedElementIds;
      api.updateScene({
        elements: api.getSceneElements().map((element) =>
          selectedIds[element.id]
            ? newElementWith(element, {
                angle: (element.angle + (degrees * Math.PI) / 180) as Radians,
              })
            : element,
        ),
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    select(ids) {
      api.updateScene({
        appState: {
          selectedElementIds: Object.fromEntries(ids.map((id) => [id, true])),
        },
      });
    },
    delete(ids) {
      const selected = new Set(ids);
      api.updateScene({
        elements: api
          .getSceneElements()
          .filter((element) => !selected.has(element.id)),
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    clearBoard() {
      const elements = api.getSceneElements();
      const inspection = inspectBoardScene({
        elements,
        appState: api.getAppState(),
        previousElements: elements,
        allowBoardLayerReplacement: false,
      });
      const removableIds = new Set(
        elements
          .filter(
            (element) =>
              !element.isDeleted && !inspection.protectedIds.has(element.id),
          )
          .map((element) => element.id),
      );
      if (!removableIds.size) {
        return;
      }
      api.updateScene({
        elements: elements.filter(
          (element) => !removableIds.has(element.id),
        ),
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    duplicateSelection() {
      const appState = api.getAppState();
      const scene = api.getSceneElements();
      const selected = scene.filter(
        (element) => appState.selectedElementIds[element.id],
      );
      if (!selected.length) {
        return;
      }
      const duplication = duplicateElements({
        type: "in-place",
        elements: scene,
        idsOfElementsToDuplicate: arrayToMap(selected),
        appState,
        randomizeSeed: true,
        overrides: ({ origElement, origIdToDuplicateId }) => ({
          x: origElement.x + 18,
          y: origElement.y + 18,
          frameId:
            (origElement.frameId &&
              origIdToDuplicateId.get(origElement.frameId)) ||
            origElement.frameId,
        }),
      });
      api.updateScene({
        elements: duplication.elementsWithDuplicates,
        appState: {
          selectedElementIds: Object.fromEntries(
            duplication.duplicatedElements.map(({ id }) => [id, true]),
          ),
        },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    arrangeSelection(position) {
      const selectedIds = api.getAppState().selectedElementIds;
      const scene = api.getSceneElements();
      const selected = scene.filter((element) => selectedIds[element.id]);
      if (!selected.length) {
        return;
      }
      const page = getBoardPage(scene);
      const background = getBoardBackground(scene);
      const protectedIds = new Set(
        [page?.id, background?.id].filter((id): id is string => Boolean(id)),
      );
      const boardLayers = scene.filter((element) =>
        protectedIds.has(element.id),
      );
      const remaining = scene.filter(
        (element) => !protectedIds.has(element.id) && !selectedIds[element.id],
      );
      api.updateScene({
        elements:
          position === "front"
            ? [...boardLayers, ...remaining, ...selected]
            : [...boardLayers, ...selected, ...remaining],
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
    },
    activateTool(tool) {
      api.setActiveTool({ type: tool === "note" ? "stickynote" : tool });
    },
    createTextPreset(preset: VisionTextPreset) {
      const scene = api.getSceneElements();
      const page = getBoardPage(scene);
      const fontFamily = FONT_VALUES[preset.fontFamily];
      const text = newTextElement({
        x: page ? page.x + page.width / 2 : 200,
        y: page ? page.y + page.height / 2 : 200,
        text: preset.sample,
        fontSize: preset.fontSize,
        fontFamily,
        lineHeight: getLineHeight(fontFamily),
        textAlign: preset.align || "center",
        verticalAlign: "middle",
        strokeColor: preset.color,
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        frameId: page?.id || null,
        customData: {
          gratitudeVision: {
            version: 1,
            id: preset.id,
            type: preset.category === "reflection" ? "quote" : "text",
          },
          gratitudeTextPreset: preset.id,
        },
      });
      api.updateScene({
        elements: [...scene, text],
        appState: { selectedElementIds: { [text.id]: true } },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      api.setActiveTool({ type: "selection" });
    },
    applyLayout(layout: VisionLayout) {
      const scene = api.getSceneElements();
      const page = getBoardPage(scene);
      if (!page) {
        return;
      }
      const withoutOldSlots = scene.filter(
        (element) => element.customData?.gratitudeLayoutSlot !== true,
      );
      const slots = layout.slots.map((slot) => {
        const bounds = getLayoutSlotBounds(slot);
        return newElement({
          type: "rectangle",
          x: page.x + page.width * bounds.x,
          y: page.y + page.height * bounds.y,
          width: page.width * bounds.width,
          height: page.height * bounds.height,
          angle: (((slot.rotation || 0) * Math.PI) / 180) as Radians,
          frameId: page.id,
          strokeColor: "#d4c7cd",
          backgroundColor: "#f6f1f3",
          fillStyle: "solid",
          strokeStyle: "solid",
          strokeWidth: 1,
          opacity: 100,
          roughness: 0,
          roundness:
            slot.frame === "rounded" || slot.frame === "circle"
              ? { type: ROUNDNESS.PROPORTIONAL_RADIUS }
              : null,
          customData: {
            gratitudeLayoutSlot: true,
            gratitudeLayoutId: layout.id,
            gratitudeSlotId: slot.id,
            gratitudeSlotFrame: slot.frame || "none",
          },
        });
      });
      api.updateScene({
        elements: [...withoutOldSlots, ...slots],
        appState: {
          selectedElementIds: slots[0] ? { [slots[0].id]: true } : {},
        },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      api.setActiveTool({ type: "selection" });
    },
    applyTemplate(template: VisionTemplate) {
      const scene = api.getSceneElements();
      const page = getBoardPage(scene);
      if (!page) {
        return;
      }
      const background = getBoardBackground(scene);
      const withoutOldSlots = scene.filter(
        (element) => element.customData?.gratitudeLayoutSlot !== true,
      );
      const themedScene = withoutOldSlots.map((element) =>
        element.id === background?.id
          ? newElementWith(element, {
              backgroundColor: template.backgroundColor,
            })
          : element,
      );
      const slots = template.layout.slots.map((slot) => {
        const bounds = getLayoutSlotBounds(slot, true);
        return newElement({
          type: "rectangle",
          x: page.x + page.width * bounds.x,
          y: page.y + page.height * bounds.y,
          width: page.width * bounds.width,
          height: page.height * bounds.height,
          angle: (((slot.rotation || 0) * Math.PI) / 180) as Radians,
          frameId: page.id,
          strokeColor: "#d4c7cd",
          backgroundColor: "#f6f1f3",
          fillStyle: "solid",
          strokeStyle: "solid",
          strokeWidth: 1,
          opacity: 100,
          roughness: 0,
          roundness:
            slot.frame === "rounded" || slot.frame === "circle"
              ? { type: ROUNDNESS.PROPORTIONAL_RADIUS }
              : null,
          customData: {
            gratitudeLayoutSlot: true,
            gratitudeLayoutId: template.layout.id,
            gratitudeSlotId: slot.id,
            gratitudeSlotFrame: slot.frame || "none",
            gratitudeTemplateId: template.id,
          },
        });
      });
      const fontFamily = FONT_VALUES["lilita-one"];
      const headingText =
        typeof template.heading === "string" && template.heading.length > 0
          ? template.heading
          : "My vision board";
      const heading = newTextElement({
        x: page.x + page.width * 0.08,
        y: page.y + page.height * 0.025,
        text: headingText,
        fontSize: 34,
        fontFamily,
        lineHeight: getLineHeight(fontFamily),
        textAlign: "left",
        verticalAlign: "middle",
        strokeColor: template.accent,
        backgroundColor: "transparent",
        fillStyle: "solid",
        strokeWidth: 1,
        roughness: 0,
        frameId: page.id,
        customData: {
          gratitudeVision: {
            version: 1,
            id: `${template.id}:heading`,
            type: "text",
          },
          gratitudeTemplateId: template.id,
        },
      });
      api.updateScene({
        elements: [...themedScene, ...slots, heading],
        appState: { selectedElementIds: { [heading.id]: true } },
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      });
      api.setActiveTool({ type: "selection" });
    },
    fitBoard() {
      const page = getBoardPage(api.getSceneElements());
      if (!page) {
        return;
      }
      api.setViewport({
        target: {
          x: page.x - 56,
          y: page.y - 56,
          width: page.width + 112,
          height: page.height + 112,
        },
        fit: "contain",
        lock: { scroll: true, zoom: false, overscroll: false },
      });
    },
    exportImage() {
      const page = getBoardPage(api.getSceneElements());
      api.updateScene({
        appState: {
          selectedElementIds: page ? { [page.id]: true } : {},
          openDialog: { name: "imageExport" },
        },
      });
    },
    exportSelection() {
      const selected = api.getAppState().selectedElementIds;
      if (!Object.keys(selected).length) {
        return;
      }
      api.updateScene({ appState: { openDialog: { name: "imageExport" } } });
    },
    async downloadSelectedPrint(ownerDocument, scale = 3) {
      const canvas = await renderSelection(ownerDocument, scale);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value
              ? resolve(value)
              : reject(new Error("Print-piece export failed")),
          "image/png",
        ),
      );
      downloadBlob(ownerDocument, blob, "gratitude-print-piece.png");
    },
    async downloadHighResolution(ownerDocument, scale = 3) {
      const canvas = await renderBoard(ownerDocument, scale);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) =>
            value ? resolve(value) : reject(new Error("PNG export failed")),
          "image/png",
        ),
      );
      downloadBlob(ownerDocument, blob, "gratitude-board-high-resolution.png");
    },
    async printBoard(ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const printWindow = ownerWindow.open("", "gratitude-board-print");
      if (!printWindow) {
        throw new Error("Allow pop-ups to open the print layout");
      }
      let canvas: HTMLCanvasElement;
      try {
        canvas = await renderBoard(ownerDocument, 2);
      } catch (error) {
        printWindow.close();
        throw error;
      }
      const image = canvas.toDataURL("image/png");
      printWindow.document.open();
      printWindow.document.write(
        `<!doctype html><html><head><title>Gratitude board print</title><style>@page{size:auto;margin:10mm}html,body{margin:0}body{display:grid;place-items:center;min-height:100vh}img{display:block;max-width:100%;max-height:100vh;object-fit:contain}@media print{body{min-height:0}}</style></head><body><img src="${image}" alt="Vision board"></body></html>`,
      );
      printWindow.document.close();
      printWindow.focus();
      const printableImage = printWindow.document.querySelector("img");
      if (!printableImage) {
        printWindow.close();
        throw new Error("The print preview could not be created");
      }
      const print = () => printWindow.print();
      if (printableImage.complete) {
        print();
      } else {
        printableImage.addEventListener("load", print, { once: true });
        printableImage.addEventListener("error", () => printWindow.close(), {
          once: true,
        });
      }
    },
    async downloadReelVideo(ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow || typeof ownerWindow.MediaRecorder === "undefined") {
        throw new Error("WebM video export is unavailable in this browser");
      }
      const board = await renderBoard(ownerDocument, 1.5);
      const reel = ownerDocument.createElement("canvas");
      reel.width = 540;
      reel.height = 960;
      const context = reel.getContext("2d");
      if (!context) {
        throw new Error("Video canvas is unavailable");
      }
      const stream = reel.captureStream(30);
      const mimeType = ownerWindow.MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "";
      const recorder = new ownerWindow.MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 5_000_000,
      });
      const chunks: Blob[] = [];
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size) {
          chunks.push(event.data);
        }
      });
      const stopped = new Promise<void>((resolve) =>
        recorder.addEventListener("stop", () => resolve(), { once: true }),
      );
      recorder.start(250);
      const started = ownerWindow.performance.now();
      const duration = 4500;
      await new Promise<void>((resolve) => {
        const draw = (time: number) => {
          const progress = Math.min(1, (time - started) / duration);
          context.fillStyle = "#f7eaf0";
          context.fillRect(0, 0, reel.width, reel.height);
          const baseScale = Math.min(
            (reel.width * 0.9) / board.width,
            (reel.height * 0.9) / board.height,
          );
          const zoom = baseScale * (1 + progress * 0.035);
          const width = board.width * zoom;
          const height = board.height * zoom;
          context.drawImage(
            board,
            (reel.width - width) / 2,
            (reel.height - height) / 2,
            width,
            height,
          );
          if (progress < 1) {
            ownerWindow.requestAnimationFrame(draw);
          } else {
            resolve();
          }
        };
        ownerWindow.requestAnimationFrame(draw);
      });
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((track) => track.stop());
      downloadBlob(
        ownerDocument,
        new ownerWindow.Blob(chunks, { type: "video/webm" }),
        "gratitude-reel.webm",
      );
    },
    downloadAttributions(ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const assets = new Map<
        string,
        import("../assets/contracts").GratitudeAsset
      >();
      api.getSceneElements().forEach((element) => {
        const asset = element.customData?.gratitudeAsset as
          | import("../assets/contracts").GratitudeAsset
          | undefined;
        if (asset?.license.attributionRequired) {
          assets.set(asset.id, asset);
        }
      });
      const lines = [...assets.values()].map((asset) =>
        [
          asset.title,
          asset.license.author && `by ${asset.license.author}`,
          asset.license.label,
          asset.license.sourceUrl,
        ]
          .filter(Boolean)
          .join(" · "),
      );
      const content = lines.length
        ? `Gratitude Vision Studio — Asset credits\n\n${lines.join("\n")}`
        : "Gratitude Vision Studio — No asset credits are required for this board.";
      const url = ownerWindow.URL.createObjectURL(
        new ownerWindow.Blob([content], { type: "text/plain;charset=utf-8" }),
      );
      const anchor = ownerDocument.createElement("a");
      anchor.href = url;
      anchor.download = "gratitude-board-credits.txt";
      anchor.click();
      ownerWindow.URL.revokeObjectURL(url);
    },
    downloadReelPlan(ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const page = getBoardPage(api.getSceneElements());
      const frames = api
        .getSceneElements()
        .filter(
          (element) =>
            !element.isDeleted &&
            element.id !== page?.id &&
            element.customData?.gratitudeBackground !== true &&
            element.customData?.gratitudeLayoutSlot !== true,
        )
        .map((element, index) => ({
          order:
            Number(
              (element.customData as { reelOrder?: unknown } | undefined)
                ?.reelOrder,
            ) || index + 1,
          elementId: element.id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
          durationMs: 2500,
        }))
        .sort((a, b) => a.order - b.order);
      const content = JSON.stringify(
        { version: 1, format: "vertical-reel", aspectRatio: "9:16", frames },
        null,
        2,
      );
      const url = ownerWindow.URL.createObjectURL(
        new ownerWindow.Blob([content], { type: "application/json" }),
      );
      const anchor = ownerDocument.createElement("a");
      anchor.href = url;
      anchor.download = "gratitude-reel-plan.json";
      anchor.click();
      ownerWindow.URL.revokeObjectURL(url);
    },
    downloadReel(ownerDocument) {
      const ownerWindow = ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      const page = getBoardPage(api.getSceneElements());
      const files = api.getFiles();
      const escape = (value: string) =>
        value.replace(
          /[&<>"']/g,
          (character) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              '"': "&quot;",
              "'": "&#39;",
            }[character] || character),
        );
      const elements = api
        .getSceneElements()
        .filter(
          (element) =>
            !element.isDeleted &&
            element.id !== page?.id &&
            element.customData?.gratitudeBackground !== true &&
            element.customData?.gratitudeLayoutSlot !== true,
        );
      const slides = elements
        .map((element, index) => {
          let content = "";
          if (
            element.type === "image" &&
            element.fileId &&
            files[element.fileId]
          ) {
            content = `<img src="${files[element.fileId].dataURL}" alt="">`;
          } else if (element.type === "text") {
            content = `<p>${escape(element.text).replace(/\n/g, "<br>")}</p>`;
          } else {
            content = `<div class="shape" style="background:${escape(
              element.backgroundColor,
            )};border-color:${escape(element.strokeColor)}"></div>`;
          }
          return `<section class="slide" style="--i:${index}"><div class="card">${content}</div></section>`;
        })
        .join("");
      const duration = Math.max(1, elements.length) * 2.5;
      const visibleUntil = Math.max(3, 95 / Math.max(1, elements.length));
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Gratitude Reel</title><style>html,body{margin:0;background:#17131a;font-family:system-ui}.reel{position:relative;width:min(100vw,56.25vh);height:min(100vh,177.78vw);margin:auto;overflow:hidden;background:#f7eaf0}.slide{position:absolute;inset:0;display:grid;place-items:center;padding:8%;box-sizing:border-box;opacity:0;animation:show ${duration}s infinite;animation-delay:calc(var(--i)*2.5s)}.card{width:100%;height:100%;display:grid;place-items:center}.card img{max-width:100%;max-height:100%;object-fit:contain;border-radius:28px;box-shadow:0 25px 70px #3b243850}.card p{font-size:clamp(30px,7vw,82px);line-height:1.1;text-align:center;color:#392b32}.shape{width:70%;height:55%;border:8px solid;border-radius:40px}@keyframes show{0%,100%{opacity:0;transform:scale(.96)}2%,${visibleUntil}%{opacity:1;transform:scale(1)}${
        visibleUntil + 2
      }%{opacity:0}}</style></head><body><main class="reel">${
        slides ||
        '<section class="slide" style="opacity:1"><p>Add items to your board first.</p></section>'
      }</main></body></html>`;
      const url = ownerWindow.URL.createObjectURL(
        new ownerWindow.Blob([html], { type: "text/html;charset=utf-8" }),
      );
      const anchor = ownerDocument.createElement("a");
      anchor.href = url;
      anchor.download = "gratitude-reel.html";
      anchor.click();
      ownerWindow.URL.revokeObjectURL(url);
    },
  };
};
