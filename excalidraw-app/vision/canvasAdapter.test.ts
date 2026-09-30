import { describe, expect, it, vi } from "vitest";
import { CaptureUpdateAction } from "@excalidraw/excalidraw";

import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/element/types";

import { createCanvasAdapter } from "./canvasAdapter";
import { VISION_LAYOUTS } from "./layouts";

const element = (overrides: Partial<ExcalidrawElement> = {}) =>
  ({
    id: "shape",
    type: "rectangle",
    x: 20,
    y: 20,
    width: 100,
    height: 80,
    angle: 0,
    opacity: 100,
    strokeColor: "#33272b",
    backgroundColor: "#ffffff",
    strokeWidth: 1,
    roundness: null,
    version: 1,
    versionNonce: 1,
    index: "a0",
    seed: 1,
    isDeleted: false,
    locked: false,
    groupIds: [],
    frameId: "page",
    boundElements: null,
    updated: 1,
    link: null,
    ...overrides,
  } as ExcalidrawElement);

const page = element({
  id: "page",
  type: "frame",
  x: 0,
  y: 0,
  width: 1200,
  height: 960,
  frameId: null,
  customData: { gratitudePage: true },
});

const createApi = () => {
  let elements = [page, element()];
  let appState = { selectedElementIds: { shape: true } };
  const updateScene = vi.fn((update) => {
    elements = update.elements || elements;
    appState = { ...appState, ...(update.appState || {}) };
  });
  const api = {
    getSceneElements: () => elements,
    getAppState: () => appState,
    updateScene,
    setViewport: vi.fn(),
    setActiveTool: vi.fn(),
    addFiles: vi.fn(),
  } as unknown as ExcalidrawImperativeAPI;
  return { api, updateScene, getElements: () => elements };
};

describe("CanvasAdapter", () => {
  it("round-trips selection and style updates through product types", () => {
    const { api, getElements } = createApi();
    const adapter = createCanvasAdapter(api);

    expect(adapter.getSelection()).toMatchObject({
      ids: ["shape"],
      count: 1,
      kind: "shape",
      style: { opacity: 100 },
    });
    adapter.updateSelection({ opacity: 55, backgroundColor: "#f9dce3" });
    expect(getElements().find(({ id }) => id === "shape")).toMatchObject({
      opacity: 55,
      backgroundColor: "#f9dce3",
    });
  });

  it("routes selection, deletion, camera, and export through the adapter", () => {
    const { api, updateScene, getElements } = createApi();
    const adapter = createCanvasAdapter(api);

    adapter.select([]);
    adapter.fitBoard();
    adapter.exportImage();
    adapter.delete(["shape"]);

    expect(api.setViewport).toHaveBeenCalledOnce();
    expect(updateScene).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({
          openDialog: { name: "imageExport" },
        }),
      }),
    );
    expect(getElements().map(({ id }) => id)).toEqual(["page"]);
  });

  it("creates semantic layout slots in one undoable scene update", () => {
    const { api, updateScene, getElements } = createApi();
    const adapter = createCanvasAdapter(api);
    const layout = VISION_LAYOUTS[0];

    adapter.applyLayout(layout);

    const slots = getElements().filter(
      (item) => item.customData?.gratitudeLayoutSlot === true,
    );
    expect(slots).toHaveLength(layout.slots.length);
    expect(slots[0].customData).toMatchObject({
      gratitudeLayoutId: layout.id,
      gratitudeSlotId: layout.slots[0].id,
    });
    expect(slots[0]).toEqual(
      expect.objectContaining({
        backgroundColor: "#f6f1f3",
        strokeColor: "#d4c7cd",
        strokeStyle: "solid",
        opacity: 100,
      }),
    );
    expect(updateScene).toHaveBeenLastCalledWith(
      expect.objectContaining({
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      }),
    );
  });
});
