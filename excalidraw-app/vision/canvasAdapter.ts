import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import { ROUNDNESS, getLineHeight } from "@excalidraw/common";
import {
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
import type { FileId } from "@excalidraw/element/types";
import type { Radians } from "@excalidraw/math";

import { getBoardPage } from "../boardPage";

import { registerVisionFonts, VISION_FONTS } from "./fonts";

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
  contrast: 100,
  saturation: 100,
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
    `brightness(${edits.brightness}%)`,
    `contrast(${edits.contrast}%)`,
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
      const naturalWidth = bitmap.width;
      const naturalHeight = bitmap.height;
      const fileId = ownerWindow.crypto.randomUUID() as FileId;
      api.addFiles([
        {
          id: fileId,
          dataURL,
          mimeType: blob.type as BinaryFileData["mimeType"],
          created: Date.now(),
        },
      ]);
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
        bitmap.width >= bitmap.height
          ? size
          : (size * bitmap.width) / bitmap.height;
      let height =
        bitmap.height >= bitmap.width
          ? size
          : (size * bitmap.height) / bitmap.width;
      bitmap.close();
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
      const previous = getImageEditData(selected.customData);
      const edits = { ...previous, ...patch };
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
      context.filter = filterCss(edits);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
        const shouldSquare = frame === "circle";
        const size = Math.min(element.width, element.height);
        return newElementWith(element, {
          fileId,
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
              : "transparent",
          strokeWidth: frame === "polaroid" ? 16 : frame === "film" ? 10 : 1,
          customData: {
            ...element.customData,
            gratitudeImageEdits: { ...edits, originalFileId },
          },
        });
      });
      api.updateScene({
        elements,
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
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
      const slots = layout.slots.map((slot) =>
        newElement({
          type: "rectangle",
          x: page.x + page.width * slot.x,
          y: page.y + page.height * slot.y,
          width: page.width * slot.width,
          height: page.height * slot.height,
          angle: (((slot.rotation || 0) * Math.PI) / 180) as Radians,
          frameId: page.id,
          strokeColor: "#c34d76",
          backgroundColor: "#f9eef2",
          fillStyle: "solid",
          strokeStyle: "dashed",
          strokeWidth: 2,
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
        }),
      );
      api.updateScene({
        elements: [...withoutOldSlots, ...slots],
        appState: {
          selectedElementIds: slots[0] ? { [slots[0].id]: true } : {},
        },
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
